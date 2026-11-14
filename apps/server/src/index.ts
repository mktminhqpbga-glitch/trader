import { Database } from "bun:sqlite";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dbPath = resolve(process.env.AC_DB_PATH ?? "data/studio.sqlite");
const host = "127.0.0.1";
const port = Number(process.env.AC_PORT ?? 3101);
const schemaVersion = 3;
const maxJsonBytes = 2 * 1024 * 1024;
const maxNodes = 2000;
const maxEdges = 5000;
const maxCoordinate = 1_000_000_000;
const allowedOrigins = new Set(["http://127.0.0.1:5173", "http://localhost:5173"]);
for (const configured of (process.env.AC_WEB_ORIGIN ?? "").split(",").map((item) => item.trim()).filter(Boolean)) {
  const match = /^http:\/\/(?:127\.0\.0\.1|localhost):(\d{1,5})$/.exec(configured);
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 65535) {
    throw new Error("AC_WEB_ORIGIN phải là địa chỉ http localhost hoặc 127.0.0.1 với cổng hợp lệ");
  }
  allowedOrigins.add(configured);
}
const nodeTypes = new Set(["text", "image", "video"]);
// Connections follow the available Vue Flow handles: Text -> Image/Video,
// Image -> Video. Video has no output handle, and Text has no input handle.
const allowedEdgeTypes: Readonly<Record<string, ReadonlySet<string>>> = {
  text: new Set(["image", "video"]),
  image: new Set(["video"]),
  video: new Set(),
};
const nodeMeta: Record<string, { label: string; icon: string }> = {
  text: { label: "Text Node", icon: "Ab" },
  image: { label: "Image Node", icon: "▧" },
  video: { label: "Video Node", icon: "▶" },
};

if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("AC_PORT phải trong khoảng 1024–65535");
}

type ProjectRow = { id: string; name: string; createdAt: string; updatedAt: string; revision: number };
type CanvasRow = { id: string; projectId: string; revision: number; viewportX: number; viewportY: number; viewportZoom: number };
type NodeRow = { id: string; type: string; positionX: number; positionY: number; data: string };
type EdgeRow = { id: string; source: string; target: string; sourceHandle: string | null; targetHandle: string | null };
type ValidNode = { id: string; type: string; x: number; y: number; content: string };
type ValidEdge = { id: string; source: string; target: string; sourceHandle: string | null; targetHandle: string | null };
type ValidCanvas = { revision: number; nodes: ValidNode[]; edges: ValidEdge[]; viewportX: number; viewportY: number; viewportZoom: number };

class HttpError extends Error {
  constructor(readonly status: number, message: string, readonly details?: Record<string, unknown>) {
    super(message);
  }
}

let database: Database | undefined;
let idCounter = 0;

function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureSchema(candidate: Database) {
  candidate.exec("PRAGMA foreign_keys = ON");
  // All schema upgrades commit together. A failed ALTER cannot mark a database migrated.
  candidate.exec("BEGIN IMMEDIATE");
  try {
    candidate.exec("CREATE TABLE IF NOT EXISTS schemaVersion (version INTEGER NOT NULL)");
    const versions = candidate.query("SELECT version FROM schemaVersion").all() as { version: number }[];
    if (versions.length > 1 || (versions.length === 1 && (!Number.isInteger(versions[0].version) || versions[0].version < 1))) {
      throw new Error("Phiên bản SQLite không hợp lệ");
    }
    const currentVersion = versions[0]?.version ?? 1;
    if (currentVersion > schemaVersion) throw new Error("Cấu trúc dữ liệu mới hơn ứng dụng");
    if (!versions.length) candidate.exec("INSERT INTO schemaVersion(version) VALUES (1)");
    if (currentVersion < 2) {
      candidate.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS canvases (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
        viewportX REAL NOT NULL DEFAULT 0,
        viewportY REAL NOT NULL DEFAULT 0,
        viewportZoom REAL NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS canvas_nodes (
        id TEXT PRIMARY KEY,
        canvasId TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video')),
        positionX REAL NOT NULL,
        positionY REAL NOT NULL,
        data TEXT NOT NULL DEFAULT '{}'
      );
      CREATE TABLE IF NOT EXISTS canvas_edges (
        id TEXT PRIMARY KEY,
        canvasId TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        source TEXT NOT NULL REFERENCES canvas_nodes(id) ON DELETE CASCADE,
        target TEXT NOT NULL REFERENCES canvas_nodes(id) ON DELETE CASCADE,
        sourceHandle TEXT,
        targetHandle TEXT,
        UNIQUE(canvasId, source, target, sourceHandle, targetHandle)
      );
      CREATE INDEX IF NOT EXISTS canvas_nodes_canvas_idx ON canvas_nodes(canvasId);
      CREATE INDEX IF NOT EXISTS canvas_edges_canvas_idx ON canvas_edges(canvasId);
      `);
      candidate.exec("UPDATE schemaVersion SET version = 2");
    }
    if (currentVersion < 3) {
      candidate.exec("ALTER TABLE canvases ADD COLUMN revision INTEGER NOT NULL DEFAULT 0");
      candidate.exec("UPDATE schemaVersion SET version = 3");
    }
    candidate.exec("COMMIT");
  } catch (error) {
    candidate.exec("ROLLBACK");
    throw error;
  }
}

function getDatabase() {
  if (database) return database;
  mkdirSync(dirname(dbPath), { recursive: true, mode: 0o700 });
  const candidate = new Database(dbPath, { create: true });
  try {
    chmodSync(dbPath, 0o600);
    ensureSchema(candidate);
    database = candidate;
    return candidate;
  } catch (error) {
    candidate.close();
    throw error;
  }
}

function reply(status: number, data: unknown) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return reply(error.status, { ok: false, message: error.message, ...error.details });
  }
  console.error("API request failure:", error);
  const code = (error as { code?: unknown } | null)?.code;
  const unavailable = typeof code === "string" && /^(SQLITE_BUSY|SQLITE_LOCKED|SQLITE_READONLY|SQLITE_IOERR|SQLITE_FULL|SQLITE_CANTOPEN|SQLITE_CORRUPT|SQLITE_NOTADB)/.test(code);
  return reply(unavailable ? 503 : 500, { ok: false, message: unavailable ? "Không thể truy cập SQLite" : "Lỗi nội bộ máy chủ" });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && Number(declaredLength) > maxJsonBytes) {
    throw new HttpError(413, "Dữ liệu gửi vượt giới hạn 2 MB");
  }
  if (!request.body) throw new HttpError(400, "Thiếu dữ liệu JSON");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxJsonBytes) {
        await reader.cancel();
        throw new HttpError(413, "Dữ liệu gửi vượt giới hạn 2 MB");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const body: unknown = JSON.parse(text);
    if (!isObject(body)) throw new HttpError(400, "JSON phải là một đối tượng");
    return body;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error instanceof SyntaxError || error instanceof TypeError) {
      throw new HttpError(400, "Dữ liệu JSON không hợp lệ");
    }
    throw error;
  } finally {
    reader.releaseLock();
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, label: string, maxLength = 128): string {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    throw new HttpError(400, `${label} không hợp lệ`);
  }
  return value;
}

function numberInRange(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new HttpError(400, `${label} không hợp lệ`);
  }
  return value;
}

function validateCanvas(body: Record<string, unknown>): ValidCanvas {
  if (!Number.isSafeInteger(body.revision) || (body.revision as number) < 0) {
    throw new HttpError(400, "Thiếu revision hoặc revision không hợp lệ");
  }
  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges) || !isObject(body.viewport)) {
    throw new HttpError(400, "Canvas cần đầy đủ nodes, edges và viewport");
  }
  if (body.nodes.length > maxNodes || body.edges.length > maxEdges) {
    throw new HttpError(400, "Số lượng node hoặc kết nối vượt giới hạn");
  }
  const nodeIds = new Set<string>();
  const nodeTypesById = new Map<string, string>();
  const nodes: ValidNode[] = body.nodes.map((item: unknown, index) => {
    if (!isObject(item) || !isObject(item.position) || !isObject(item.data)) {
      throw new HttpError(400, `Node thứ ${index + 1} không hợp lệ`);
    }
    const id = boundedString(item.id, `ID node thứ ${index + 1}`);
    if (nodeIds.has(id)) throw new HttpError(400, "Trùng ID node");
    nodeIds.add(id);
    if (typeof item.type !== "string" || !nodeTypes.has(item.type)) {
      throw new HttpError(400, `Loại node thứ ${index + 1} không hợp lệ`);
    }
    nodeTypesById.set(id, item.type);
    if (typeof item.data.content !== "string" || item.data.content.length > 65536) {
      throw new HttpError(400, `Nội dung node thứ ${index + 1} không hợp lệ`);
    }
    return {
      id,
      type: item.type,
      x: numberInRange(item.position.x, "Tọa độ X", -maxCoordinate, maxCoordinate),
      y: numberInRange(item.position.y, "Tọa độ Y", -maxCoordinate, maxCoordinate),
      content: item.data.content,
    };
  });
  const edgeIds = new Set<string>();
  const edgeKeys = new Set<string>();
  const edges: ValidEdge[] = body.edges.map((item: unknown, index) => {
    if (!isObject(item)) throw new HttpError(400, `Kết nối thứ ${index + 1} không hợp lệ`);
    const id = boundedString(item.id, `ID kết nối thứ ${index + 1}`);
    const source = boundedString(item.source, "Node đầu kết nối");
    const target = boundedString(item.target, "Node cuối kết nối");
    if (edgeIds.has(id)) throw new HttpError(400, "Trùng ID kết nối");
    edgeIds.add(id);
    if (source === target || !nodeIds.has(source) || !nodeIds.has(target)) {
      throw new HttpError(400, `Kết nối thứ ${index + 1} không thuộc Canvas này`);
    }
    if (!allowedEdgeTypes[nodeTypesById.get(source) ?? ""]?.has(nodeTypesById.get(target) ?? "")) {
      throw new HttpError(400, `Kiểu kết nối thứ ${index + 1} không được hỗ trợ`);
    }
    // Preserve already-saved AC-02A edges with explicit null sourceHandle.
    // Newly generated connections must use 'output' -> 'input'.
    if (item.sourceHandle !== "output" && item.sourceHandle !== null) {
      throw new HttpError(400, `Cổng nguồn kết nối thứ ${index + 1} không hợp lệ`);
    }
    if (item.targetHandle !== "input") {
      throw new HttpError(400, `Cổng đích kết nối thứ ${index + 1} không hợp lệ`);
    }
    const sourceHandle = item.sourceHandle;
    const targetHandle = item.targetHandle;
    // Vue Flow's single input/output handles mean a repeated node pair is
    // duplicate even if one copy uses the historical null source handle.
    const key = JSON.stringify([source, target]);
    if (edgeKeys.has(key)) throw new HttpError(400, "Không thể lưu kết nối trùng");
    edgeKeys.add(key);
    return { id, source, target, sourceHandle, targetHandle };
  });
  return {
    revision: body.revision as number,
    nodes,
    edges,
    viewportX: numberInRange(body.viewport.x, "Tọa độ X của Canvas", -maxCoordinate, maxCoordinate),
    viewportY: numberInRange(body.viewport.y, "Tọa độ Y của Canvas", -maxCoordinate, maxCoordinate),
    viewportZoom: numberInRange(body.viewport.zoom, "Mức thu phóng", 0.2, 2),
  };
}

function getProject(db: Database, projectId: string) {
  return db.query("SELECT p.id, p.name, p.createdAt, p.updatedAt, c.revision FROM projects p LEFT JOIN canvases c ON c.projectId = p.id WHERE p.id = ?").get(projectId) as ProjectRow | null;
}

function getCanvas(db: Database, projectId: string) {
  const canvas = db.query("SELECT id, projectId, revision, viewportX, viewportY, viewportZoom FROM canvases WHERE projectId = ?").get(projectId) as CanvasRow | null;
  if (!canvas) return null;
  const nodes = db.query("SELECT id, type, positionX, positionY, data FROM canvas_nodes WHERE canvasId = ? ORDER BY rowid").all(canvas.id) as NodeRow[];
  const edges = db.query("SELECT id, source, target, sourceHandle, targetHandle FROM canvas_edges WHERE canvasId = ? ORDER BY rowid").all(canvas.id) as EdgeRow[];
  return {
    id: canvas.id,
    revision: canvas.revision,
    viewport: { x: canvas.viewportX, y: canvas.viewportY, zoom: canvas.viewportZoom },
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: { x: node.positionX, y: node.positionY },
      data: { ...nodeMeta[node.type], ...(JSON.parse(node.data) as { content?: string }) },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };
}

function projectResponse(db: Database, project: ProjectRow) {
  const canvas = getCanvas(db, project.id);
  if (!canvas) throw new Error("Canvas của dự án không tồn tại");
  return { ok: true, project, canvas };
}

function createProject(db: Database, name: string) {
  const now = new Date().toISOString();
  const project = { id: newId("project"), name, createdAt: now, updatedAt: now };
  const canvasId = newId("canvas");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.query("INSERT INTO projects(id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)").run(project.id, project.name, project.createdAt, project.updatedAt);
    db.query("INSERT INTO canvases(id, projectId) VALUES (?, ?)").run(canvasId, project.id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const created = getProject(db, project.id);
  if (!created) throw new Error("Không thể đọc lại dự án vừa tạo");
  return projectResponse(db, created);
}

// A project gets its initial canvas atomically at creation time. This endpoint
// also repairs older projects without a canvas and is safe to retry.
function ensureProjectCanvas(db: Database, projectId: string) {
  let created = false;
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!getProject(db, projectId)) throw new HttpError(404, "Không tìm thấy dự án");
    const existing = db.query("SELECT id FROM canvases WHERE projectId = ?").get(projectId) as { id: string } | null;
    if (!existing) {
      db.query("INSERT INTO canvases(id, projectId) VALUES (?, ?)").run(newId("canvas"), projectId);
      created = true;
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const canvas = getCanvas(db, projectId);
  if (!canvas) throw new Error("Không thể đọc Canvas sau khi tạo");
  return reply(created ? 201 : 200, { ok: true, created, canvas });
}

function saveCanvas(db: Database, projectId: string, body: Record<string, unknown>) {
  const input = validateCanvas(body);
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!getProject(db, projectId)) throw new HttpError(404, "Không tìm thấy dự án");
    const canvas = db.query("SELECT id, revision FROM canvases WHERE projectId = ?").get(projectId) as { id: string; revision: number } | null;
    if (!canvas) throw new HttpError(404, "Không tìm thấy Canvas");
    if (canvas.revision !== input.revision) {
      throw new HttpError(409, "Canvas đã được cập nhật ở nơi khác", { currentRevision: canvas.revision, revision: canvas.revision });
    }
    // IDs are globally unique in v2; reject cross-project reuse without touching either project.
    const foreignNode = db.query("SELECT canvasId FROM canvas_nodes WHERE id = ?");
    const foreignEdge = db.query("SELECT canvasId FROM canvas_edges WHERE id = ?");
    for (const node of input.nodes) {
      const owner = foreignNode.get(node.id) as { canvasId: string } | null;
      if (owner && owner.canvasId !== canvas.id) throw new HttpError(409, "ID node đã tồn tại ở dự án khác");
    }
    for (const edge of input.edges) {
      const owner = foreignEdge.get(edge.id) as { canvasId: string } | null;
      if (owner && owner.canvasId !== canvas.id) throw new HttpError(409, "ID kết nối đã tồn tại ở dự án khác");
    }
    const update = db.query("UPDATE canvases SET viewportX = ?, viewportY = ?, viewportZoom = ?, revision = revision + 1 WHERE id = ? AND revision = ?")
      .run(input.viewportX, input.viewportY, input.viewportZoom, canvas.id, input.revision);
    if (update.changes !== 1) {
      const latest = db.query("SELECT revision FROM canvases WHERE id = ?").get(canvas.id) as { revision: number } | null;
      throw new HttpError(409, "Canvas đã được cập nhật ở nơi khác", { currentRevision: latest?.revision ?? null, revision: latest?.revision ?? null });
    }
    db.query("DELETE FROM canvas_edges WHERE canvasId = ?").run(canvas.id);
    db.query("DELETE FROM canvas_nodes WHERE canvasId = ?").run(canvas.id);
    const insertNode = db.query("INSERT INTO canvas_nodes(id, canvasId, type, positionX, positionY, data) VALUES (?, ?, ?, ?, ?, ?)");
    for (const node of input.nodes) insertNode.run(node.id, canvas.id, node.type, node.x, node.y, JSON.stringify({ content: node.content }));
    const insertEdge = db.query("INSERT INTO canvas_edges(id, canvasId, source, target, sourceHandle, targetHandle) VALUES (?, ?, ?, ?, ?, ?)");
    for (const edge of input.edges) insertEdge.run(edge.id, canvas.id, edge.source, edge.target, edge.sourceHandle, edge.targetHandle);
    db.query("UPDATE projects SET updatedAt = ? WHERE id = ?").run(now, projectId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const updatedProject = getProject(db, projectId);
  if (!updatedProject) throw new Error("Không thể đọc lại dự án sau khi lưu");
  return reply(200, projectResponse(db, updatedProject));
}

const server = Bun.serve({
  hostname: host,
  port,
  async fetch(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return reply(404, { ok: false, message: "Không tìm thấy API" });
    const origin = request.headers.get("origin");
    if (origin && !allowedOrigins.has(origin)) return reply(403, { ok: false, message: "Nguồn truy cập không được phép" });
    const db = (() => { try { return getDatabase(); } catch (error) { console.error("SQLite unavailable:", error); return null; } })();
    if (url.pathname === "/api/health") {
      if (request.method !== "GET") return reply(405, { ok: false, message: "Phương thức không được hỗ trợ" });
      if (!db) return reply(503, { ok: false, server: "connected", database: "unavailable", message: "Không thể truy cập SQLite" });
      try {
        const check = db.query("SELECT 1 AS value").get() as { value: number } | null;
        if (check?.value !== 1) throw new Error("SQLite không trả kết quả hợp lệ");
        return reply(200, { ok: true, server: "connected", database: "connected", schemaVersion });
      } catch (error) {
        console.error("SQLite health failure:", error);
        return reply(503, { ok: false, server: "connected", database: "unavailable", message: "Không thể truy cập SQLite" });
      }
    }
    if (!db) return reply(503, { ok: false, message: "Không thể truy cập SQLite" });
    const parts = url.pathname.split("/").filter(Boolean);
    try {
      if (parts.length === 2 && parts[1] === "projects") {
        if (request.method === "GET") return reply(200, { ok: true, projects: db.query("SELECT p.id, p.name, p.createdAt, p.updatedAt, c.revision FROM projects p LEFT JOIN canvases c ON c.projectId = p.id ORDER BY p.updatedAt DESC").all() });
        if (request.method === "POST") {
          const body = await readJson(request);
          const name = typeof body.name === "string" ? body.name.trim() : "";
          if (!name || name.length > 100) return reply(400, { ok: false, message: "Tên dự án phải có từ 1 đến 100 ký tự" });
          return reply(201, createProject(db, name));
        }
        return reply(405, { ok: false, message: "Phương thức không được hỗ trợ" });
      }
      if (parts.length === 3 && parts[1] === "projects") {
        const projectId = parts[2];
        const project = getProject(db, projectId);
        if (request.method === "GET") return project ? reply(200, projectResponse(db, project)) : reply(404, { ok: false, message: "Không tìm thấy dự án" });
        return reply(405, { ok: false, message: "Phương thức không được hỗ trợ" });
      }
      if (parts.length === 4 && parts[1] === "projects" && parts[3] === "canvas") {
        if (request.method === "POST") return ensureProjectCanvas(db, parts[2]);
        if (request.method === "GET") {
          if (!getProject(db, parts[2])) return reply(404, { ok: false, message: "Không tìm thấy dự án" });
          const canvas = getCanvas(db, parts[2]);
          return canvas ? reply(200, { ok: true, canvas }) : reply(404, { ok: false, message: "Không tìm thấy Canvas" });
        }
        if (request.method === "PUT") return saveCanvas(db, parts[2], await readJson(request));
        return reply(405, { ok: false, message: "Phương thức không được hỗ trợ" });
      }
      return reply(404, { ok: false, message: "Không tìm thấy API" });
    } catch (error) {
      return errorResponse(error);
    }
  },
});

console.info(`AI Canvas Studio API: http://${host}:${server.port}`);
process.on("SIGINT", () => { database?.close(); process.exit(0); });
process.on("SIGTERM", () => { database?.close(); process.exit(0); });
