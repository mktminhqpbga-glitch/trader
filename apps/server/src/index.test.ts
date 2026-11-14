import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import type { AddressInfo } from "node:net";

const repo = resolve(import.meta.dir, "../../..");
const folders: string[] = [];
const processes: Array<ReturnType<typeof Bun.spawn>> = [];

type ApiResult = { status: number; data: any };

function tempDatabase() {
  const folder = mkdtempSync(join(tmpdir(), "ac02-server-test-"));
  folders.push(folder);
  return { folder, path: join(folder, "studio.sqlite") };
}

async function freePort(): Promise<number> {
  return new Promise((resolvePort, rejectPort) => {
    const listener = createServer();
    listener.on("error", rejectPort);
    listener.listen(0, "127.0.0.1", () => {
      const port = (listener.address() as AddressInfo).port;
      listener.close((error) => error ? rejectPort(error) : resolvePort(port));
    });
  });
}

async function launch(dbPath: string, healthStatus = 200) {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = Bun.spawn([process.execPath, "apps/server/src/index.ts"], {
    cwd: repo,
    env: { ...process.env, AC_PORT: String(port), AC_DB_PATH: dbPath, AC_WEB_ORIGIN: "http://127.0.0.1:5174" },
    stdout: "pipe",
    stderr: "pipe",
  });
  processes.push(child);
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) break;
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.status === healthStatus) return base;
    } catch { /* server is still starting */ }
    await Bun.sleep(30);
  }
  throw new Error(`Server did not start with expected health HTTP ${healthStatus}`);
}

async function api(base: string, path: string, method = "GET", body?: unknown): Promise<ApiResult> {
  const response = await fetch(base + path, {
    method,
    ...(body === undefined ? {} : { headers: { "content-type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json() };
}

function node(id: string, type = "text", content = "Giữ lại nội dung") {
  return { id, type, position: { x: 140, y: -20 }, data: { content } };
}

function canvas(revision: number, nodes: ReturnType<typeof node>[] = [], edges: unknown[] = []) {
  return { revision, nodes, edges, viewport: { x: 12, y: -13, zoom: 1.25 } };
}

async function createProject(base: string, name: string) {
  const response = await api(base, "/api/projects", "POST", { name });
  expect(response.status).toBe(201);
  expect(response.data.canvas.revision).toBe(0);
  expect(response.data.project.revision).toBe(0);
  return response.data.project.id as string;
}

async function stopAll() {
  await Promise.all(processes.splice(0).map(async (child) => {
    if (child.exitCode === null) child.kill();
    await child.exited;
  }));
}

afterEach(async () => {
  await stopAll();
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

test("creates projects and saves nodes, edges, viewport and revision through restart", async () => {
  const db = tempDatabase();
  const base = await launch(db.path);
  const health = await api(base, "/api/health");
  expect(health.data.schemaVersion).toBe(3);
  const id = await createProject(base, "Thử lưu bền vững");
  const canvasCreatedWithProject = await api(base, `/api/projects/${id}/canvas`);
  const originalCanvasId = canvasCreatedWithProject.data.canvas.id;
  const ensured = await api(base, `/api/projects/${id}/canvas`, "POST");
  expect(ensured.status).toBe(200);
  expect(ensured.data.created).toBe(false);
  expect(ensured.data.canvas.id).toBe(originalCanvasId);
  expect((await api(base, "/api/projects/not-found/canvas", "POST")).status).toBe(404);
  const original = canvas(0, [node("node_a"), node("node_b", "image")], [
    { id: "edge_a", source: "node_a", target: "node_b", sourceHandle: null, targetHandle: "input" },
  ]);
  const saved = await api(base, `/api/projects/${id}/canvas`, "PUT", original);
  expect(saved.status).toBe(200);
  expect(saved.data.canvas.revision).toBe(1);
  expect(saved.data.canvas.id).toBe(originalCanvasId);
  expect(saved.data.project.revision).toBe(1);
  expect(saved.data.canvas.nodes).toHaveLength(2);
  expect(saved.data.canvas.edges).toHaveLength(1);
  expect(saved.data.canvas.viewport).toEqual(original.viewport);

  const list = await api(base, "/api/projects");
  expect(list.data.projects).toEqual([expect.objectContaining({ id, revision: 1 })]);
  const currentCanvas = await api(base, `/api/projects/${id}/canvas`);
  expect(currentCanvas.data.canvas).toEqual(saved.data.canvas);
  await stopAll();

  const restarted = await launch(db.path);
  const restored = await api(restarted, `/api/projects/${id}`);
  expect(restored.status).toBe(200);
  expect(restored.data.canvas).toEqual(saved.data.canvas);
  expect(restored.data.project.revision).toBe(1);
});

test("stale writes, malformed writes and foreign project node IDs cannot erase saved work", async () => {
  const db = tempDatabase();
  const base = await launch(db.path);
  const projectA = await createProject(base, "A");
  const projectB = await createProject(base, "B");
  const pathA = `/api/projects/${projectA}/canvas`;
  const pathB = `/api/projects/${projectB}/canvas`;
  expect((await api(base, pathA, "PUT", canvas(0, [node("shared_id")]))).status).toBe(200);
  expect((await api(base, pathB, "PUT", canvas(0, [node("other_id")]))).status).toBe(200);

  const stale = await api(base, pathA, "PUT", canvas(0, [node("lost_node")]));
  expect(stale.status).toBe(409);
  expect(stale.data.currentRevision).toBe(1);
  expect(stale.data.revision).toBe(1);
  expect((await api(base, pathB, "PUT", canvas(1, [node("shared_id")]))).status).toBe(409);
  expect((await api(base, pathA, "PUT", { revision: 1, viewport: { x: 0, y: 0, zoom: 1 } })).status).toBe(400);
  expect((await api(base, pathA, "PUT", { revision: 1, nodes: [], edges: [] })).status).toBe(400);
  expect((await api(base, pathA, "PUT", canvas(1, [node("same"), node("same")]))).status).toBe(400);
  expect((await api(base, pathA, "PUT", canvas(1, [node("bad")], [{ id: "edge", source: "bad", target: "not_here" }]))).status).toBe(400);
  expect((await api(base, pathA, "PUT", "{wrong json")).status).toBe(400);
  expect((await api(base, pathA, "PUT", "[]")).status).toBe(400);
  expect((await api(base, pathA, "PUT", { revision: 1, nodes: [], edges: [], viewport: { x: 1e300, y: 0, zoom: 1 } })).status).toBe(400);
  expect((await api(base, pathA, "PUT", { padding: "x".repeat(2 * 1024 * 1024) })).status).toBe(413);
  expect((await api(base, "/api/projects/missing-id/canvas", "PUT", canvas(0))).status).toBe(404);

  const stillA = await api(base, pathA);
  const stillB = await api(base, pathB);
  expect(stillA.data.canvas.nodes.map((item: { id: string }) => item.id)).toEqual(["shared_id"]);
  expect(stillB.data.canvas.nodes.map((item: { id: string }) => item.id)).toEqual(["other_id"]);
  expect(stillA.data.canvas.revision).toBe(1);
  expect(stillB.data.canvas.revision).toBe(1);

  const cleared = await api(base, pathA, "PUT", canvas(1));
  expect(cleared.status).toBe(200);
  expect(cleared.data.canvas.revision).toBe(2);
  expect(cleared.data.canvas.nodes).toEqual([]);
  expect((await api(base, pathB)).data.canvas.nodes).toHaveLength(1);
});

test("migrates an existing v2 database to v3 once and retains its project and canvas", async () => {
  const dbFile = tempDatabase().path;
  const db = new Database(dbFile, { create: true });
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE schemaVersion(version INTEGER NOT NULL);
    INSERT INTO schemaVersion VALUES (2);
    CREATE TABLE projects(id TEXT PRIMARY KEY, name TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE canvases(id TEXT PRIMARY KEY, projectId TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE, viewportX REAL NOT NULL DEFAULT 0, viewportY REAL NOT NULL DEFAULT 0, viewportZoom REAL NOT NULL DEFAULT 1);
    CREATE TABLE canvas_nodes(id TEXT PRIMARY KEY, canvasId TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK(type IN ('text','image','video')), positionX REAL NOT NULL, positionY REAL NOT NULL, data TEXT NOT NULL DEFAULT '{}');
    CREATE TABLE canvas_edges(id TEXT PRIMARY KEY, canvasId TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE, source TEXT NOT NULL REFERENCES canvas_nodes(id) ON DELETE CASCADE, target TEXT NOT NULL REFERENCES canvas_nodes(id) ON DELETE CASCADE, sourceHandle TEXT, targetHandle TEXT, UNIQUE(canvasId,source,target,sourceHandle,targetHandle));
    INSERT INTO projects VALUES ('v2_project', 'Dự án cũ', '2025-01-01', '2025-01-02');
    INSERT INTO canvases VALUES ('v2_canvas', 'v2_project', 17, -4, 0.75);
    INSERT INTO canvas_nodes VALUES ('v2_node', 'v2_canvas', 'text', 44, 55, '{"content":"Không được mất"}');
  `);
  db.close();

  const base = await launch(dbFile);
  const project = await api(base, "/api/projects/v2_project");
  expect(project.status).toBe(200);
  expect(project.data.project.name).toBe("Dự án cũ");
  expect(project.data.canvas.revision).toBe(0);
  expect(project.data.canvas.viewport).toEqual({ x: 17, y: -4, zoom: 0.75 });
  expect(project.data.canvas.nodes[0].data.content).toBe("Không được mất");
  await stopAll();

  const migrated = new Database(dbFile);
  expect((migrated.query("SELECT version FROM schemaVersion").get() as { version: number }).version).toBe(3);
  expect((migrated.query("SELECT COUNT(*) AS n FROM canvas_nodes").get() as { n: number }).n).toBe(1);
  migrated.close();
  const again = await launch(dbFile);
  expect((await api(again, "/api/projects/v2_project")).data.canvas.nodes[0].id).toBe("v2_node");
  const upgraded = new Database(dbFile);
  expect((upgraded.query("SELECT COUNT(*) AS n FROM pragma_table_info('canvases') WHERE name='revision'").get() as { n: number }).n).toBe(1);
  upgraded.close();
});

test("migrates an existing v1 health database without deleting unrelated tables", async () => {
  const dbFile = tempDatabase().path;
  const db = new Database(dbFile, { create: true });
  db.exec("CREATE TABLE schemaVersion(version INTEGER NOT NULL); INSERT INTO schemaVersion VALUES (1); CREATE TABLE old_notes(note TEXT); INSERT INTO old_notes VALUES ('giữ nguyên');");
  db.close();
  const base = await launch(dbFile);
  expect((await api(base, "/api/health")).data.schemaVersion).toBe(3);
  await createProject(base, "Dự án mới trên DB cũ");
  const upgraded = new Database(dbFile);
  expect((upgraded.query("SELECT note FROM old_notes").get() as { note: string }).note).toBe("giữ nguyên");
  expect((upgraded.query("SELECT version FROM schemaVersion").get() as { version: number }).version).toBe(3);
  upgraded.close();
});

test("distinguishes SQLite unavailable (503) and damaged stored data (500)", async () => {
  const fixture = tempDatabase();
  const badBase = await launch(fixture.folder, 503);
  expect((await api(badBase, "/api/health")).status).toBe(503);
  expect((await api(badBase, "/api/projects")).status).toBe(503);
  await stopAll();

  const goodBase = await launch(fixture.path);
  const id = await createProject(goodBase, "Test dữ liệu lỗi");
  expect((await api(goodBase, `/api/projects/${id}/canvas`, "PUT", canvas(0, [node("corrupt-node")]))).status).toBe(200);
  const db = new Database(fixture.path);
  db.query("UPDATE canvas_nodes SET data = ? WHERE id = ?").run("{broken", "corrupt-node");
  db.close();
  expect((await api(goodBase, `/api/projects/${id}`)).status).toBe(500);
  expect((await api(goodBase, "/api/health")).status).toBe(200);
});
