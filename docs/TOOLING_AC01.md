# Bộ công cụ phát triển AI Canvas Studio — AC-01

Ngày đánh giá: **14/11/2026** · Repository: `mktminhqpbga-glitch/trader` · Nhánh: `feat/aiCanvasStudioFoundation`

Tài liệu này chỉ chốt công cụ phục vụ AC-01. Công cụ cho Canvas nâng cao, kết nối AI thật, video, Chrome Extension/WebSocket và Desktop được ghi ở phần kế hoạch; chưa được thêm vào ứng dụng.

## Kết quả nhanh

| Công cụ/thành phần | Trạng thái | Bằng chứng hoặc lý do |
|---|---|---|
| Bun/Node.js/npm | Đã có và kiểm chứng | Bun 1.4.3, Node v22.23.3, npm 10.9.9; dùng cho install, typecheck, build và chạy Web/API |
| Vue 3 + TypeScript + Vite | Đã có và kiểm chứng | Web build và typecheck PASS; Vue 3, TypeScript, Vite trong workspace |
| Element Plus | Đã có và kiểm chứng | Dùng nút retry thật trong `apps/web/src/App.vue`; license MIT |
| Vue Flow | Đã có, chưa dùng trong AC-01 | `@vue-flow/core@1.48.2`, license MIT; để dành cho Canvas giai đoạn 1 sau khi có phạm vi node |
| SQLite (`bun:sqlite`) | Đã có và kiểm chứng | API health chạy `SELECT 1`, schema version và kiểm tra bảo toàn DB |
| Playwright CLI | Có thể chạy và đã kiểm chứng thao tác thật | `npx --yes playwright@1.65.1 --version` → 1.65.1; `playwright cli --help`, open, snapshot, click, console, requests đã chạy trên app; license Apache-2.0 |
| Playwright project dependency | Chưa thêm | AC-01 dùng CLI qua `npx` để tránh thêm dependency/test runner khi chưa có suite cần commit; pin version trong lệnh khi chạy CI |
| Chrome DevTools MCP | CLI help chạy được, chưa tích hợp | `chrome-devtools-mcp@1.13.0 --help` PASS; chưa có MCP client DevTools trong phiên, không đưa vào runtime ứng dụng; upstream Apache-2.0 |
| Context7 | Chưa tích hợp | Metadata registry quan sát được `@upstash/context7-mcp@4.7.0`; thử npx bị chặn bởi npm cache có file root-owned, nên không báo hoạt động; upstream MIT |
| Codex Plugins/Skills | Có trong môi trường Codex | Skills nguồn và plugin được Codex cung cấp; không phải dependency runtime. Skill repo AC-01 được tạo tại `.agents/skills/ac01-browser-verification/` |
| AGENTS.md | Đã tạo | Quy tắc bền vững cho repository, AC-01, MapID, bảo toàn dữ liệu và lệnh kiểm tra |
| Dagre / `@dagrejs/dagre` | Chưa cài | Candidate registry `@dagrejs/dagre@3.1.3`; chỉ cần khi có yêu cầu tự động bố trí đồ thị; upstream MIT; không thêm thư viện thừa |
| Pinia | Chưa cài | Chỉ cần khi state dùng chung nhiều màn hình được triển khai; upstream MIT; version chưa kiểm tra được do npm cache lỗi; state AC-01 hiện nhỏ và nằm trong component |
| Zod | Chưa cài | Candidate registry `zod@4.6.7`; chỉ cần khi nhận payload task/API bên ngoài; upstream MIT; AC-01 chưa có boundary schema tương ứng |

## Đánh giá theo yêu cầu

### 1. Playwright CLI và Skills

Playwright CLI phù hợp với coding agent vì có lệnh điều hướng, snapshot DOM, click theo role, network request, console và ghi trace. Nó kiểm chứng được chức năng thực mà `curl` hoặc kiểm tra file không thấy được. AC-01 đã dùng CLI trên `http://127.0.0.1:5173/`: snapshot thấy status, MapID và nút `Kiểm tra lại`; sau khi tắt API, giao diện chuyển sang `Không kết nối`/HTTP 502; sau khi bật lại, click retry khôi phục `Đã kết nối`.

Skill repo-scoped quy định quy trình này tại [`.agents/skills/ac01-browser-verification/SKILL.md`](../.agents/skills/ac01-browser-verification/SKILL.md). Vì chưa có suite test cần chạy trong CI, Playwright chưa được thêm vào `package.json`; khi suite đầu tiên được chốt, pin một version cụ thể và chạy browser install trong CI.

Nguồn: [Playwright introduction](https://playwright.dev/docs/intro), [Playwright CLI installation](https://playwright.dev/agent-cli/installation), [playwright-cli](https://github.com/microsoft/playwright-cli).

### 2. Chrome DevTools MCP

Chrome DevTools MCP cho phép MCP client điều khiển Chrome, đọc console/network/performance và chụp ảnh. `npx --yes chrome-devtools-mcp --version` trả `1.13.0` và `--help` chạy thực tế, nhưng phiên Codex này không cung cấp MCP server/client DevTools để kết nối trực tiếp. Vì Playwright đã đủ cho kiểm chứng AC-01 và hai công cụ trùng phần browser automation, chưa tích hợp DevTools MCP vào repository. Có thể dùng ở giai đoạn tối ưu hiệu năng hoặc debug Chrome khi môi trường cung cấp MCP client.

Nguồn: [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp/), [Chrome DevTools agents](https://developer.chrome.com/docs/devtools/agents/get-started). License upstream: Apache-2.0.

### 3. Context7

Context7 cung cấp tài liệu thư viện theo version thông qua MCP/CLI, hữu ích khi triển khai Vue Flow, Pinia, Zod hoặc SDK AI ở giai đoạn sau. Registry trả metadata `@upstash/context7-mcp@4.7.0`, nhưng đây không phải dependency của ứng dụng. Trong môi trường này chưa có Context7 MCP được kết nối; lệnh npx bị lỗi quyền trên npm cache (`root-owned files`), vì vậy trạng thái là **chưa kiểm chứng**, không phải đã cài.

Nguồn: [Context7 repository](https://github.com/upstash/context7), [Context7 developer resources](https://context7.com/docs/resources/developer). Package MCP upstream `@upstash/context7-mcp`, license MIT.

### 4. OpenAI Plugins dành cho Codex

Plugin/skill của Codex là công cụ làm việc của agent, không đóng gói vào Web/API. Các skill đã dùng để định hướng gồm project memory refresh, implement task và code review. Không thêm plugin vào `package.json`, không sao chép code từ ứng dụng tham khảo. AGENTS.md và skill repo là lớp quy tắc ổn định để agent tuân thủ dù phiên làm việc thay đổi.

Nguồn: [Codex customization](https://learn.chatgpt.com/docs/customization/overview), [Build skills](https://learn.chatgpt.com/docs/build-skills), [OpenAI skills](https://github.com/openai/skills).

### 5. AGENTS.md và Skills riêng repository

`AGENTS.md` quy định phạm vi AC-01, đọc requirements trước khi sửa, MapID ổn định, không mất dữ liệu, không sửa `ToonFlow-App`, lệnh Bun, cách ghi bằng chứng và cấm tự chuyển AC-02. Skill browser verification mô tả thao tác thật bằng Playwright và ngưỡng `PARTIAL` khi chưa quan sát DOM.

### 6. Vue Flow, Dagre, Pinia, Zod

Vue Flow đã có sẵn và tương thích Vue 3; giữ nguyên để tránh thay framework. Dagre chỉ thêm khi cần layout tự động cho đồ thị; ưu tiên package hiện hành `@dagrejs/dagre`. Pinia chỉ thêm khi state dự án/canvas cần store dùng chung; Zod chỉ thêm khi có payload từ API/extension/AI cần validate tại boundary. Cả ba chưa được thêm vì AC-01 hiện chỉ có health/retry và SQLite schema tối thiểu. Các package đều có license MIT theo metadata upstream.

## Kế hoạch giai đoạn sau

1. **Giai đoạn 1 — Ứng dụng cơ bản:** dùng Vue Flow cho canvas, bổ sung Pinia khi state canvas/project vượt phạm vi component, thêm `@dagrejs/dagre` cho auto-layout nếu được yêu cầu, dùng Zod cho schema lưu/khôi phục node. Mỗi dependency phải có version pin, license và kiểm thử thực tế.
2. **Giai đoạn 2 — Kết nối AI thật:** chọn một nhà cung cấp, WebSocket/Chrome Extension MV3, Task ID riêng, chống gửi lại khi mất kết nối và đối chiếu kết quả. Zod sẽ được đánh giá ở boundary payload.
3. **Giai đoạn 3 — Hoàn thiện/Desktop:** kiểm thử hồi quy, accessibility/performance, đóng gói Desktop và kiểm tra bảo toàn dữ liệu.

## Cách sử dụng nhanh

```bash
# Kiểm tra công cụ browser
npx --yes playwright@1.65.1 --version
npx --yes playwright@1.65.1 cli --help

# Chạy ứng dụng AC-01
bun run dev

# Trong terminal khác, kiểm chứng browser
npx --yes playwright@1.65.1 cli -s=ac01 open http://127.0.0.1:5173/
npx --yes playwright@1.65.1 cli -s=ac01 snapshot
npx --yes playwright@1.65.1 cli -s=ac01 click <retry-ref>
npx --yes playwright@1.65.1 cli -s=ac01 requests
npx --yes playwright@1.65.1 cli -s=ac01 console
```

Kết quả kiểm thử và giới hạn hiện tại được ghi trong [`docs/acceptance.md`](acceptance.md). AC-01 chỉ được nâng từ `PARTIAL` sang `PASS` khi mọi tiêu chí của acceptance đã có bằng chứng chạy được.
