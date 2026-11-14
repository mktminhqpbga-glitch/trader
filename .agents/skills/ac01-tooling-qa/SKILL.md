---
name: ac01-tooling-qa
description: Xác minh bộ công cụ AI Canvas Studio, chạy health smoke, quality gates và phân loại công cụ verified/deferred cho AC-01; không thêm phụ thuộc khi chưa có bằng chứng.
---

# AC-01 tooling and quality gates

Sử dụng khi cần kiểm tra môi trường phát triển hoặc chuẩn bị công cụ lập trình cho repository `mktminhqpbga-glitch/trader`. **Không** gọi quy trình này là kiểm thử AI/Canvas/Video/Desktop. AC-01 và AC-02 đã có lịch sử nghiệm thu: không sửa lại tính năng hay đổi trạng thái Issue, trừ khi được giao riêng.

## Trước khi chạy

1. Đọc nguyên vẹn `CORE_REQUIREMENTS.md`, `AGENTS.md`, `docs/TOOLING_AC01.md` và `docs/acceptance.md`.
2. Chạy `git status --short --branch` và `git rev-parse HEAD`; nếu có thay đổi chưa commit của người dùng, không reset, không overwrite.
3. Xác định Bun (`$HOME/.bun/bin/bun` nếu shell chưa có PATH), Node, npm và phiên bản thư viện từ `bun.lock` / chính workspace. **Không dùng `npm install` để sửa workspace được Bun quản lý.**
4. Xác minh cổng 3101/5173 hoặc cặp cổng cấu hình bằng `lsof` trước khi mở dịch vụ. Không kill/restart trình duyệt, server hoặc database của người dùng đang chạy.

## Quality gates bắt buộc

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install --frozen-lockfile
bun run typecheck
bun run build
bun test apps/server/src/index.test.ts
```

Khi Web/API **đang chạy** (đặt cổng thật, mặc định 5173), chạy kiểm tra không ghi dữ liệu:

```bash
AC_WEB_URL=http://127.0.0.1:5173 bun run tooling:smoke
```

`tooling:smoke` xác minh Web HTTP 200 và API `/api/health` trả SQLite connected. **Nó không thay Playwright**, không tạo project và không coi HTML tải được là bằng chứng DOM hoạt động.

## Kiểm chứng tương tác trình duyệt

Theo `.agents/skills/ac01-browser-verification/SKILL.md`. Một browser session duy nhất là đủ; `open`, `snapshot`, click vào `[data-map-id="AC.SYSTEM.HEALTH.RETRY"]`, kiểm tra `requests` và `console`. Khi muốn mô phỏng mất kết nối, khởi chạy Web/API **thử nghiệm riêng** từ database tạm và chỉ dừng tiến trình mình tạo; không làm gián đoạn phiên người dùng đang test.

```bash
npx --yes playwright@1.65.1 cli -s=ac01qa open http://127.0.0.1:5173/
npx --yes playwright@1.65.1 cli -s=ac01qa snapshot
npx --yes playwright@1.65.1 cli -s=ac01qa click '[data-map-id="AC.SYSTEM.HEALTH.RETRY"]'
npx --yes playwright@1.65.1 cli -s=ac01qa requests
npx --yes playwright@1.65.1 cli -s=ac01qa console
npx --yes playwright@1.65.1 cli -s=ac01qa close
```

## Công cụ đánh giá nhưng không cài tràn lan

- `chrome-devtools-mcp`: chỉ xác minh CLI/version/help cho lần audit nền tảng. Không đăng ký MCP server hoặc khởi chạy Chrome profile mới khi Playwright đã đáp ứng kiểm thử. Chỉ dùng thêm nếu có nhiệm vụ performance hoặc network debugging đặc thù.
- `@upstash/context7-mcp`: chỉ sử dụng như nguồn tra cứu tài liệu có version nếu MCP client có thể kết nối thực; lỗi npm cache không được xử lý bằng `sudo` hoặc `npm --force`. Nếu cần smoke riêng, dùng `npm_config_cache=$(mktemp -d /tmp/...)` và ghi rõ test chỉ là `--help`, không chứng minh MCP hoạt động.
- Codex CLI/Plugins: kiểm tra `codex --version`, `codex mcp list`; không commit cấu hình toàn cục hoặc token. Plugin của agent **khác** với dependency chạy Web/Backend.
- Dagre, Pinia, Zod: chưa cài chỉ vì có tên trong kế hoạch; phải chứng minh thiếu chức năng thực tế, duyệt phụ thuộc và test trước khi thêm.

## Quy tắc bằng chứng

Ghi phiên bản thực đo, license từ package metadata/upstream, thao tác đã chạy, pass/fail và công cụ chỉ là candidate vào `docs/TOOLING_AC01.md`. Không báo MCP/server/plugin đã cài chỉ vì `npx ... --help` hoạt động. Không commit `.env`, cache npm, ảnh chụp/test log tạm, SQLite, `dist` hay `node_modules`. Chỉ commit mã cấu hình/Skill/docs phù hợp phạm vi và đã kiểm tra `git diff --check`.
