import { Database } from "bun:sqlite";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dbPath = resolve(process.env.AC_DB_PATH ?? "data/studio.sqlite");
const host = "127.0.0.1";
const port = Number(process.env.AC_PORT ?? 3101);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("AC_PORT phải trong khoảng 1024–65535");
}

let database: Database | undefined;
function getDatabase() {
  if (database) return database;
  mkdirSync(dirname(dbPath), { recursive: true, mode: 0o700 });
  const candidate = new Database(dbPath, { create: true });
  try {
    chmodSync(dbPath, 0o600);
    candidate.exec("PRAGMA foreign_keys = ON");
    candidate.exec("CREATE TABLE IF NOT EXISTS schemaVersion (version INTEGER NOT NULL)");
    const current = candidate.query("SELECT version FROM schemaVersion LIMIT 1").get() as { version: number } | null;
    if (!current) candidate.exec("INSERT INTO schemaVersion(version) VALUES (1)");
    else if (current.version !== 1) throw new Error("Cấu trúc dữ liệu không tương thích");
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
const server = Bun.serve({
  hostname: host,
  port,
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/health") return reply(404, { ok: false, message: "Không tìm thấy API" });
    if (request.method !== "GET") return reply(405, { ok: false, message: "Phương thức không được hỗ trợ" });
    const origin = request.headers.get("origin");
    if (origin && !["http://127.0.0.1:5173", "http://localhost:5173"].includes(origin)) {
      return reply(403, { ok: false, message: "Nguồn truy cập không được phép" });
    }
    try {
      const check = getDatabase().query("SELECT 1 AS value").get() as { value: number } | null;
      if (check?.value !== 1) throw new Error("SQLite không trả kết quả hợp lệ");
      return reply(200, { ok: true, server: "connected", database: "connected", schemaVersion: 1 });
    } catch (error) {
      console.error("SQLite health failure:", error);
      return reply(503, { ok: false, server: "connected", database: "unavailable", message: "Không thể truy cập SQLite" });
    }
  },
});
console.info("AI Canvas Studio API: http://" + host + ":" + server.port);
process.on("SIGINT", () => { database?.close(); process.exit(0); });
process.on("SIGTERM", () => { database?.close(); process.exit(0); });
