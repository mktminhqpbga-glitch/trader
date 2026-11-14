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

function edge(id: string, source: string, target: string, sourceHandle: unknown = "output", targetHandle: unknown = "input") {
  return { id, source, target, sourceHandle, targetHandle };
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
  expect(health.data.schemaVersion).toBe(4);
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

test("only Text→Image, Text→Video, Image→Video edges persist; legacy null output is round-tripped", async () => {
  const db = tempDatabase();
  const base = await launch(db.path);
  const id = await createProject(base, "Luồng hợp lệ");
  const path = `/api/projects/${id}/canvas`;
  const nodes = [node("text_1"), node("image_1", "image"), node("video_1", "video")];
  const edges = [
    edge("text_to_image", "text_1", "image_1"),
    edge("text_to_video", "text_1", "video_1"),
    edge("image_to_video", "image_1", "video_1", null),
  ];
  const saved = await api(base, path, "PUT", canvas(0, nodes, edges));
  expect(saved.status).toBe(200);
  expect(saved.data.canvas.revision).toBe(1);
  expect(saved.data.canvas.edges).toEqual(edges);
  const updated = await api(base, path, "PUT", canvas(1, nodes, edges));
  expect(updated.status).toBe(200);
  expect(updated.data.canvas.revision).toBe(2);
  expect(updated.data.canvas.edges).toEqual(edges);
  await stopAll();
  const restarted = await launch(db.path);
  const restored = await api(restarted, path);
  expect(restored.data.canvas.revision).toBe(2);
  expect(restored.data.canvas.edges).toEqual(edges);
});

test("invalid pairs, handles, duplicate edges and forged endpoints cause HTTP 400 with zero mutations", async () => {
  const db = tempDatabase();
  const base = await launch(db.path);
  const projectA = await createProject(base, "Dự án gốc");
  const projectB = await createProject(base, "Dự án khác");
  const pathA = `/api/projects/${projectA}/canvas`;
  const pathB = `/api/projects/${projectB}/canvas`;
  expect((await api(base, pathB, "PUT", canvas(0, [node("foreign_text")]))).status).toBe(200);

  const nodes = [
    node("t1"), node("t2"),
    node("i1", "image"), node("i2", "image"),
    node("v1", "video"), node("v2", "video"),
  ];
  const baselineEdge = edge("baseline", "t1", "i1", null);
  const initial = await api(base, pathA, "PUT", canvas(0, nodes, [baselineEdge]));
  expect(initial.status).toBe(200);
  const baseline = initial.data.canvas;

  const rejected: Array<[string, unknown[]]> = [
    ["Text→Text", [edge("invalid", "t1", "t2")]],
    ["Image→Image", [edge("invalid", "i1", "i2")]],
    ["Image→Text", [edge("invalid", "i1", "t1")]],
    ["Video→Text", [edge("invalid", "v1", "t1")]],
    ["Video→Image", [edge("invalid", "v1", "i1")]],
    ["Video→Video", [edge("invalid", "v1", "v2")]],
    ["reverse handles", [edge("invalid", "t1", "i1", "input", "output")]],
    ["source input", [edge("invalid", "t1", "i1", "input", "input")]],
    ["source unknown", [edge("invalid", "t1", "i1", "out", "input")]],
    ["source empty", [edge("invalid", "t1", "i1", "", "input")]],
    ["target output", [edge("invalid", "t1", "i1", "output", "output")]],
    ["target unknown", [edge("invalid", "t1", "i1", "output", "in")]],
    ["target null", [edge("invalid", "t1", "i1", "output", null)]],
    ["target missing", [{ id: "invalid", source: "t1", target: "i1", sourceHandle: "output" }]],
    ["source missing", [{ id: "invalid", source: "t1", target: "i1", targetHandle: "input" }]],
    ["handle number", [edge("invalid", "t1", "i1", 123, "input")]],
    ["self-loop", [edge("invalid", "i1", "i1")]],
    ["unknown source", [edge("invalid", "missing", "v1")]],
    ["unknown target", [edge("invalid", "t1", "missing")]],
    ["empty source ID", [edge("invalid", "", "i1")]],
    ["empty target ID", [edge("invalid", "t1", "")]],
    ["number source ID", [edge("invalid", 5 as unknown as string, "i1")]],
    ["null target ID", [edge("invalid", "t1", null as unknown as string)]],
    ["empty edge ID", [edge("", "t1", "i1")]],
    ["number edge ID", [edge(1 as unknown as string, "t1", "i1")]],
    ["cross-canvas source", [edge("invalid", "foreign_text", "i1")]],
    ["cross-canvas target", [edge("invalid", "t1", "foreign_text")]],
    ["duplicate endpoints with legacy/new output", [edge("one", "t1", "i1", null), edge("two", "t1", "i1", "output")]],
    ["duplicate endpoints with two new edges", [edge("one", "t1", "i1"), edge("two", "t1", "i1")]],
    ["duplicate edge IDs", [edge("duplicate", "t1", "i1"), edge("duplicate", "i1", "v1")]],
    ["valid plus illegal edge", [edge("allowed", "i1", "v1"), edge("invalid", "v1", "t1")]],
  ];
  for (const [label, edges] of rejected) {
    const result = await api(base, pathA, "PUT", canvas(1, nodes, edges));
    expect(result.status).toBe(400);
    const unchanged = await api(base, pathA);
    expect(unchanged.data.canvas).toEqual(baseline);
    if (result.status !== 400) throw new Error(`Expected HTTP 400 for ${label}`);
  }
  const badNodeSnapshots = [
    canvas(1, [...nodes, node("unknown_type", "audio")], [edge("allowed", "t1", "i1")]),
    canvas(1, [...nodes, { ...node("bad_id"), id: "" }], [edge("allowed", "t1", "i1")]),
    canvas(1, [...nodes, { ...node("bad_id"), id: 42 as unknown as string }], [edge("allowed", "t1", "i1")]),
  ];
  for (const snapshot of badNodeSnapshots) {
    expect((await api(base, pathA, "PUT", snapshot)).status).toBe(400);
    expect((await api(base, pathA)).data.canvas).toEqual(baseline);
  }

  const stale = await api(base, pathA, "PUT", canvas(0, nodes, [edge("fresh", "t1", "v1")]));
  expect(stale.status).toBe(409);
  expect(stale.data.currentRevision).toBe(1);
  expect((await api(base, pathA)).data.canvas).toEqual(baseline);
  expect((await api(base, pathB)).data.canvas.nodes).toEqual([expect.objectContaining({ id: "foreign_text" })]);

  const next = await api(base, pathA, "PUT", canvas(1, nodes, [edge("next", "i1", "v1")]));
  expect(next.status).toBe(200);
  expect(next.data.canvas.revision).toBe(2);
  expect(next.data.canvas.edges).toEqual([edge("next", "i1", "v1")]);
  await stopAll();
  const restarted = await launch(db.path);
  const restored = await api(restarted, pathA);
  expect(restored.data.canvas).toEqual(next.data.canvas);
});

test("migrates an existing v2 database to v4 once and retains its project and canvas", async () => {
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
    INSERT INTO canvas_nodes VALUES ('v2_image', 'v2_canvas', 'image', 24, 35, '{"content":"Ảnh cũ"}');
    INSERT INTO canvas_edges VALUES ('v2_edge', 'v2_canvas', 'v2_node', 'v2_image', NULL, 'input');
  `);
  db.close();

  const base = await launch(dbFile);
  const project = await api(base, "/api/projects/v2_project");
  expect(project.status).toBe(200);
  expect(project.data.project.name).toBe("Dự án cũ");
  expect(project.data.project.deletedAt).toBeNull();
  expect(project.data.canvas.revision).toBe(0);
  expect(project.data.canvas.viewport).toEqual({ x: 17, y: -4, zoom: 0.75 });
  expect(project.data.canvas.nodes[0].data.content).toBe("Không được mất");
  expect(project.data.canvas.edges).toEqual([edge("v2_edge", "v2_node", "v2_image", null)]);
  const saved = await api(base, "/api/projects/v2_project/canvas", "PUT", {
    revision: 0,
    nodes: project.data.canvas.nodes,
    edges: project.data.canvas.edges,
    viewport: project.data.canvas.viewport,
  });
  expect(saved.status).toBe(200);
  expect(saved.data.canvas.edges).toEqual([edge("v2_edge", "v2_node", "v2_image", null)]);
  expect(saved.data.canvas.revision).toBe(1);
  await stopAll();

  const migrated = new Database(dbFile);
  expect((migrated.query("SELECT version FROM schemaVersion").get() as { version: number }).version).toBe(4);
  expect((migrated.query("SELECT COUNT(*) AS n FROM canvas_nodes").get() as { n: number }).n).toBe(2);
  expect((migrated.query("SELECT COUNT(*) AS n FROM canvas_edges").get() as { n: number }).n).toBe(1);
  migrated.close();
  const again = await launch(dbFile);
  expect((await api(again, "/api/projects/v2_project")).data.canvas.nodes[0].id).toBe("v2_node");
  expect((await api(again, "/api/projects/v2_project")).data.canvas.edges).toEqual([edge("v2_edge", "v2_node", "v2_image", null)]);
  const upgraded = new Database(dbFile);
  expect((upgraded.query("SELECT COUNT(*) AS n FROM pragma_table_info('canvases') WHERE name='revision'").get() as { n: number }).n).toBe(1);
  expect((upgraded.query("SELECT COUNT(*) AS n FROM pragma_table_info('projects') WHERE name='deletedAt'").get() as { n: number }).n).toBe(1);
  upgraded.close();
});

test("migrates an existing v1 health database to v4 without deleting unrelated tables", async () => {
  const dbFile = tempDatabase().path;
  const db = new Database(dbFile, { create: true });
  db.exec("CREATE TABLE schemaVersion(version INTEGER NOT NULL); INSERT INTO schemaVersion VALUES (1); CREATE TABLE old_notes(note TEXT); INSERT INTO old_notes VALUES ('giữ nguyên');");
  db.close();
  const base = await launch(dbFile);
  expect((await api(base, "/api/health")).data.schemaVersion).toBe(4);
  await createProject(base, "Dự án mới trên DB cũ");
  const upgraded = new Database(dbFile);
  expect((upgraded.query("SELECT note FROM old_notes").get() as { note: string }).note).toBe("giữ nguyên");
  expect((upgraded.query("SELECT version FROM schemaVersion").get() as { version: number }).version).toBe(4);
  upgraded.close();
});

test("renaming, trashing and restoring projects preserves canvas, node, edge and revision through restart", async () => {
  const dbFile = tempDatabase().path;
  const base = await launch(dbFile);
  const projectA = await createProject(base, "Bản nháp A");
  const projectB = await createProject(base, "Dự án B");
  const aPath = `/api/projects/${projectA}`;
  const bPath = `/api/projects/${projectB}`;
  const aCanvasPath = `${aPath}/canvas`;
  const bCanvasPath = `${bPath}/canvas`;

  const aInput = canvas(0,
    [node("a_text", "text", "Giữ nguyên prompt"), node("a_image", "image", "Giữ ảnh"), node("a_video", "video", "Giữ video")],
    [edge("a_edge_legacy", "a_text", "a_image", null), edge("a_edge_new", "a_image", "a_video")],
  );
  const bInput = canvas(0, [node("b_text")]);
  const aSaved = await api(base, aCanvasPath, "PUT", aInput);
  const bSaved = await api(base, bCanvasPath, "PUT", bInput);
  expect(aSaved.status).toBe(200);
  expect(bSaved.status).toBe(200);
  const originalCanvas = aSaved.data.canvas;
  const originalB = bSaved.data;
  const originalA = await api(base, aPath);
  expect(originalA.data.project.deletedAt).toBeNull();

  // No HTTP request is made when the confirmation is cancelled by the client.
  const cancelled = new AbortController();
  cancelled.abort();
  await expect(fetch(base + aPath, { method: "DELETE", signal: cancelled.signal })).rejects.toThrow();
  expect((await api(base, aPath)).data.project).toEqual(originalA.data.project);

  const renamed = await api(base, aPath, "PATCH", { name: "  Dự án đã đổi tên  " });
  expect(renamed.status).toBe(200);
  expect(renamed.data.project).toEqual(expect.objectContaining({
    id: projectA, name: "Dự án đã đổi tên", revision: 1, deletedAt: null,
    createdAt: originalA.data.project.createdAt,
  }));
  const renamedRead = await api(base, aPath);
  expect(renamedRead.data.canvas).toEqual(originalCanvas);
  const repeatRename = await api(base, aPath, "PATCH", { name: " Dự án đã đổi tên " });
  expect(repeatRename.status).toBe(200);
  expect(repeatRename.data.project).toEqual(renamed.data.project);

  const deleted = await api(base, aPath, "DELETE");
  expect(deleted.status).toBe(200);
  expect(typeof deleted.data.project.deletedAt).toBe("string");
  expect(Number.isNaN(Date.parse(deleted.data.project.deletedAt))).toBe(false);
  expect(deleted.data.project.id).toBe(projectA);
  expect(deleted.data.project.revision).toBe(1);
  expect((await api(base, aPath, "DELETE")).status).toBe(409);
  expect((await api(base, aPath, "PATCH", { name: "Không được đổi" })).status).toBe(404);
  expect((await api(base, aPath)).status).toBe(404);
  expect((await api(base, aCanvasPath)).status).toBe(404);
  expect((await api(base, aCanvasPath, "POST")).status).toBe(404);
  expect((await api(base, aCanvasPath, "PUT", aInput)).status).toBe(404);
  expect((await api(base, aCanvasPath, "PUT", { broken: true })).status).toBe(404);

  const active = await api(base, "/api/projects");
  expect(active.status).toBe(200);
  expect(active.data.projects.map((project: { id: string }) => project.id)).toEqual([projectB]);
  const activeExplicit = await api(base, "/api/projects?status=active");
  expect(activeExplicit.data).toEqual(active.data);
  const trash = await api(base, "/api/projects?status=deleted");
  expect(trash.status).toBe(200);
  expect(trash.data.projects).toEqual([deleted.data.project]);
  expect((await api(base, bPath)).data).toEqual(originalB);
  expect((await api(base, bCanvasPath)).data.canvas).toEqual(originalB.canvas);

  // A restart must not make a soft-deleted project visible in the active list.
  await stopAll();
  const restarted = await launch(dbFile);
  expect((await api(restarted, aPath)).status).toBe(404);
  expect((await api(restarted, "/api/projects?status=deleted")).data.projects).toEqual([deleted.data.project]);
  const restored = await api(restarted, `${aPath}/restore`, "POST");
  expect(restored.status).toBe(200);
  expect(restored.data.project).toEqual(expect.objectContaining({
    id: projectA, name: "Dự án đã đổi tên", revision: 1, deletedAt: null,
    createdAt: originalA.data.project.createdAt,
  }));
  expect((await api(restarted, `${aPath}/restore`, "POST")).status).toBe(409);
  const restoredRead = await api(restarted, aPath);
  expect(restoredRead.status).toBe(200);
  expect(restoredRead.data.canvas).toEqual(originalCanvas);
  expect(restoredRead.data.project.deletedAt).toBeNull();
  expect((await api(restarted, "/api/projects?status=deleted")).data.projects).toEqual([]);
  expect((await api(restarted, "/api/projects")).data.projects.map((project: { id: string }) => project.id).sort())
    .toEqual([projectA, projectB].sort());
  expect((await api(restarted, bPath)).data).toEqual(originalB);

  // Canvas saves still use optimistic concurrency and keep all original IDs.
  const stale = await api(restarted, aCanvasPath, "PUT", canvas(0, aInput.nodes, aInput.edges));
  expect(stale.status).toBe(409);
  expect(stale.data.currentRevision).toBe(1);
  const updated = await api(restarted, aCanvasPath, "PUT", { ...aInput, revision: 1 });
  expect(updated.status).toBe(200);
  expect(updated.data.canvas.id).toBe(originalCanvas.id);
  expect(updated.data.canvas.nodes.map((item: { id: string }) => item.id)).toEqual(aInput.nodes.map((item) => item.id));
  expect(updated.data.canvas.edges.map((item: { id: string }) => item.id)).toEqual(["a_edge_legacy", "a_edge_new"]);
  expect(updated.data.canvas.revision).toBe(2);
});

test("project name, trash status and missing IDs return correct errors without changing records", async () => {
  const dbFile = tempDatabase().path;
  const base = await launch(dbFile);
  const id = await createProject(base, "Tên chuẩn");
  const projectPath = `/api/projects/${id}`;
  const original = await api(base, projectPath);
  const invalidNames: unknown[] = [
    {}, { name: null }, { name: 5 }, { name: "" }, { name: "   " }, { name: "x".repeat(101) },
    { name: ["Tên sai"] },
  ];
  for (const input of invalidNames) {
    expect((await api(base, projectPath, "PATCH", input)).status).toBe(400);
    expect((await api(base, projectPath)).data).toEqual(original.data);
  }
  expect((await api(base, projectPath, "PATCH", "not json")).status).toBe(400);
  expect((await api(base, projectPath, "PATCH")).status).toBe(400);
  expect((await api(base, "/api/projects", "POST", { name: " " })).status).toBe(400);
  expect((await api(base, "/api/projects", "POST", { name: "x".repeat(101) })).status).toBe(400);
  for (const status of ["all", "unknown", "", "DELETED"]) {
    expect((await api(base, `/api/projects?status=${encodeURIComponent(status)}`)).status).toBe(400);
  }
  expect((await api(base, "/api/projects/nonexistent", "PATCH", { name: "Mới" })).status).toBe(404);
  expect((await api(base, "/api/projects/nonexistent", "DELETE")).status).toBe(404);
  expect((await api(base, "/api/projects/nonexistent/restore", "POST")).status).toBe(404);
  expect((await api(base, `${projectPath}/restore`, "POST")).status).toBe(409);
  expect((await api(base, `${projectPath}/restore`, "GET")).status).toBe(405);
  expect((await api(base, `${projectPath}/restore`, "DELETE")).status).toBe(405);
  expect((await api(base, projectPath)).data).toEqual(original.data);
  expect((await api(base, "/api/projects?status=deleted")).data.projects).toEqual([]);
  expect((await api(base, "/api/projects")).data.projects).toEqual([original.data.project]);
});

test("v3 to v4 migration retains old revision and legacy edge, then supports delete/restore idempotently", async () => {
  const dbFile = tempDatabase().path;
  const db = new Database(dbFile, { create: true });
  db.exec(`
    PRAGMA foreign_keys=ON;
    CREATE TABLE schemaVersion (version INTEGER NOT NULL);
    INSERT INTO schemaVersion VALUES (3);
    CREATE TABLE projects(id TEXT PRIMARY KEY, name TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE canvases(id TEXT PRIMARY KEY, projectId TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE, viewportX REAL NOT NULL DEFAULT 0, viewportY REAL NOT NULL DEFAULT 0, viewportZoom REAL NOT NULL DEFAULT 1, revision INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE canvas_nodes(id TEXT PRIMARY KEY, canvasId TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video')), positionX REAL NOT NULL, positionY REAL NOT NULL, data TEXT NOT NULL DEFAULT '{}');
    CREATE TABLE canvas_edges(id TEXT PRIMARY KEY, canvasId TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE, source TEXT NOT NULL REFERENCES canvas_nodes(id) ON DELETE CASCADE, target TEXT NOT NULL REFERENCES canvas_nodes(id) ON DELETE CASCADE, sourceHandle TEXT, targetHandle TEXT, UNIQUE(canvasId,source,target,sourceHandle,targetHandle));
    INSERT INTO projects VALUES ('legacy_project','Hồ sơ cũ','2024-01-01','2024-05-01');
    INSERT INTO canvases VALUES ('legacy_canvas','legacy_project',17,29,1.5,9);
    INSERT INTO canvas_nodes VALUES ('legacy_text','legacy_canvas','text',30,40,'{"content":"Cũ"}');
    INSERT INTO canvas_nodes VALUES ('legacy_video','legacy_canvas','video',80,90,'{"content":"Video"}');
    INSERT INTO canvas_edges VALUES ('legacy_edge','legacy_canvas','legacy_text','legacy_video',NULL,'input');
  `);
  db.close();

  const base = await launch(dbFile);
  const health = await api(base, "/api/health");
  expect(health.status).toBe(200);
  expect(health.data.schemaVersion).toBe(4);
  const current = await api(base, "/api/projects/legacy_project");
  expect(current.status).toBe(200);
  expect(current.data.project.deletedAt).toBeNull();
  expect(current.data.project.revision).toBe(9);
  const originalCanvas = current.data.canvas;
  expect(originalCanvas.id).toBe("legacy_canvas");
  expect(originalCanvas.nodes.map((item: { id: string }) => item.id)).toEqual(["legacy_text", "legacy_video"]);
  expect(originalCanvas.edges).toEqual([edge("legacy_edge", "legacy_text", "legacy_video", null)]);

  expect((await api(base, "/api/projects/legacy_project", "DELETE")).status).toBe(200);
  expect((await api(base, "/api/projects/legacy_project/restore", "POST")).status).toBe(200);
  expect((await api(base, "/api/projects/legacy_project")).data.canvas).toEqual(originalCanvas);
  await stopAll();

  const verify = new Database(dbFile);
  expect((verify.query("SELECT version FROM schemaVersion").get() as { version: number }).version).toBe(4);
  expect((verify.query("SELECT COUNT(*) AS n FROM pragma_table_info('projects') WHERE name = 'deletedAt'").get() as { n: number }).n).toBe(1);
  expect((verify.query("SELECT deletedAt FROM projects WHERE id = 'legacy_project'").get() as { deletedAt: string | null }).deletedAt).toBeNull();
  expect((verify.query("SELECT COUNT(*) AS n FROM canvas_edges").get() as { n: number }).n).toBe(1);
  verify.close();

  const again = await launch(dbFile);
  const persisted = await api(again, "/api/projects/legacy_project");
  expect(persisted.data.canvas).toEqual(originalCanvas);
  expect(persisted.data.project.revision).toBe(9);
});

test("distinguishes SQLite unavailable (503) and damaged stored data (500)", async () => {
  const fixture = tempDatabase();
  const badBase = await launch(fixture.folder, 503);
  expect((await api(badBase, "/api/health")).status).toBe(503);
  expect((await api(badBase, "/api/projects")).status).toBe(503);
  expect((await api(badBase, "/api/projects/fake", "PATCH", { name: "Không lưu" })).status).toBe(503);
  expect((await api(badBase, "/api/projects/fake", "DELETE")).status).toBe(503);
  expect((await api(badBase, "/api/projects/fake/restore", "POST")).status).toBe(503);
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
