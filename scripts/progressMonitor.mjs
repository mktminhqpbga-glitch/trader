import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repository = "mktminhqpbga-glitch/trader";
const branch = "feat/aiCanvasStudioFoundation";
const intervalMs = 120_000;
const oneShot = process.argv.includes("--once");
const directory = fileURLToPath(new URL("../data/monitor/", import.meta.url));
const token = process.env.GITHUB_TOKEN?.trim();
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "ai-canvas-studio-monitor",
};
if (token) headers.Authorization = "Bearer " + token;

async function readRemote(url, api = false) {
  const response = await fetch(url, {
    headers: api ? headers : { "User-Agent": headers["User-Agent"] },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("HTTP " + response.status + " khi đọc " + new URL(url).pathname);
  return response.text();
}
function hash(value) { return createHash("sha256").update(value).digest("hex"); }
function acceptanceRows(markdown) {
  return markdown.split("\n").flatMap(line => {
    if (!line.trim().startsWith("|")) return [];
    const cells = line.split("|").slice(1, -1).map(x => x.trim());
    if (cells.length < 2) return [];
    const status = cells[1].match(/^(PASS|PARTIAL|FAIL|NOT TESTED)\b/i);
    return status ? [{ name: cells[0].replaceAll(String.fromCharCode(96), ""), status: status[1].toUpperCase() }] : [];
  });
}
async function previousSnapshot() {
  try { return JSON.parse(await readFile(join(directory, "latest.json"), "utf8")); }
  catch (error) {
    if (error?.code !== "ENOENT") console.warn("Snapshot cũ không đọc được:", error?.message);
    return null;
  }
}
async function inspect() {
  const api = "https://api.github.com/repos/" + repository;
  const raw = "https://raw.githubusercontent.com/" + repository + "/";
  const [branchText, issueText, htmlBranch, htmlMain, acceptance] = await Promise.all([
    readRemote(api + "/branches/" + branch, true),
    readRemote(api + "/issues/1", true),
    readRemote(raw + branch + "/progressReport.html"),
    readRemote(raw + "main/progressReport.html"),
    readRemote(raw + branch + "/docs/acceptance.md"),
  ]);
  const head = JSON.parse(branchText).commit?.sha;
  const issue = JSON.parse(issueText);
  if (!head || !["open", "closed"].includes(issue.state)) throw new Error("GitHub không trả trạng thái hợp lệ");
  const rows = acceptanceRows(acceptance);
  const pending = rows.filter(row => row.status !== "PASS");
  const state = {
    head, issueState: issue.state, issueUpdated: issue.updated_at,
    htmlBranchHash: hash(htmlBranch), htmlMainHash: hash(htmlMain), acceptanceHash: hash(acceptance),
  };
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const old = await previousSnapshot();
  const changes = Object.keys(state).filter(key => old?.[key] !== state[key]);
  const checkedAt = new Date().toISOString();
  let action = "Tiếp tục kiểm tra AC-01; không tự chuyển AC-02.";
  if (issue.state === "closed" && pending.length) action = "CẢNH BÁO: Issue đóng khi còn kiểm thử chưa đạt; cần xác minh.";
  else if (issue.state === "closed") action = "Chờ người phụ trách xác nhận hoàn tất, không tự mở AC-02.";
  else if (!rows.length) action = "Không tìm thấy bảng nghiệm thu; chưa được phép báo PASS.";
  else if (pending.length) action = "Tiếp tục AC-01: " + pending.map(x => x.name + " [" + x.status + "]").join("; ");
  else action = "Bảng nghiệm thu ghi PASS nhưng Issue vẫn mở; cần người nghiệm thu xác nhận.";
  const record = {
    checkedAt, head, issueState: issue.state, changes, pending, action,
    mainReportDiffers: state.htmlBranchHash !== state.htmlMainHash,
  };
  const logPath = join(directory, "checks-" + checkedAt.slice(0, 10) + ".jsonl");
  await appendFile(logPath, JSON.stringify(record) + "\n", { mode: 0o600 });
  console.log("[" + checkedAt + "] AC-01 " + issue.state +
    " | HEAD " + head.slice(0, 8) + " | chưa đạt " + pending.length +
    (changes.length ? " | thay đổi: " + changes.join(", ") : " | không đổi"));
  if (changes.length) {
    if (record.mainReportDiffers) console.warn("Lưu ý: báo cáo main khác nhánh phát triển.");
    console.log("Việc cần làm: " + action);
  }
  const temporary = join(directory, "latest." + process.pid + ".tmp");
  await writeFile(temporary, JSON.stringify({ ...state, checkedAt }, null, 2) + "\n", { mode: 0o600 });
  await rename(temporary, join(directory, "latest.json"));
}
let running = false;
async function tick() {
  if (running) return console.warn("Lượt trước còn chạy, bỏ qua lượt trùng");
  running = true;
  try { await inspect(); }
  catch (error) { console.error("Kiểm tra THẤT BẠI, không xác nhận PASS:", error?.message ?? error); }
  finally { running = false; }
}
if (!token) console.warn("Không có GITHUB_TOKEN; GitHub API công khai có thể giới hạn tần suất.");
if (!oneShot) {
  console.log("Giám sát mỗi 120 giây khi tiến trình còn chạy. Ctrl+C để dừng.");
  setInterval(() => { void tick(); }, intervalMs);
}
await tick();
