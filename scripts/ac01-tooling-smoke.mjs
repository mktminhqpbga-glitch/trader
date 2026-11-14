// AC-01 read-only smoke test. It does NOT create a project or change SQLite.
// Run after starting the app: AC_WEB_URL=http://127.0.0.1:5182 bun run tooling:smoke
const rawUrl = process.env.AC_WEB_URL ?? 'http://127.0.0.1:5173';
let base;
try {
  base = new URL(rawUrl);
} catch {
  console.error(`AC_WEB_URL is not a valid URL: ${rawUrl}`);
  process.exit(1);
}
if (base.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(base.hostname) ||
    base.username || base.password || base.search || base.hash || base.pathname !== '/') {
  console.error('AC_WEB_URL must be a local http://127.0.0.1:PORT/ or http://localhost:PORT/ URL');
  process.exit(1);
}

async function read(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}

try {
  const web = await read('/');
  const html = await web.text();
  if (!html.includes('AI Canvas Studio')) throw new Error('Web HTML has no AI Canvas Studio title');
  const api = await read('/api/health');
  const health = await api.json();
  if (health.ok !== true || health.server !== 'connected' || health.database !== 'connected' ||
      !Number.isInteger(health.schemaVersion) || health.schemaVersion < 1) {
    throw new Error('Health response is not a genuine connected SQLite status');
  }
  console.log(`PASS — Web HTTP ${web.status}; API HTTP ${api.status}; SQLite connected; schemaVersion=${health.schemaVersion}`);
  console.log('DOM interactions/MapID require the separate Playwright browser skill. This is an HTTP-only smoke test.');
} catch (error) {
  console.error(`FAIL — AC-01 smoke test: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
