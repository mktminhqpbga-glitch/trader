# Bộ công cụ phát triển AI Canvas Studio — AC-01

Ngày đánh giá: **14/11/2026** · Repository: `mktminhqpbga-glitch/trader` · Nhánh: `feat/aiCanvasStudioFoundation`

Tài liệu này chỉ chốt công cụ phục vụ AC-01. Công cụ cho Canvas nâng cao, kết nối AI thật, video, Chrome Extension/WebSocket và Desktop được ghi ở phần kế hoạch; chưa được thêm vào ứng dụng.

## Kiểm toán công cụ bổ sung — 15/11/2026 (sau khi AC-01 và AC-02 đã nghiệm thu)

**Phạm vi của lần này là thiết lập và xác minh công cụ AC-01, không quay lại phát triển AC-01/02.** Issue [#1](https://github.com/mktminhqpbga-glitch/trader/issues/1) và [#2](https://github.com/mktminhqpbga-glitch/trader/issues/2) đều đã đóng theo nghiệm thu trước. Các nhận xét “chưa dùng Vue Flow”, “AC-01 chưa có Canvas” và `NOT TESTED` nằm phía dưới là **nhật ký lịch sử ở thời điểm AC-01**, không phải tình trạng mã nguồn hiện tại. Đợt này không thêm dependency runtime, không thay framework, không đụng database hay code Canvas; bổ sung một lệnh smoke HTTP chỉ đọc và Skill hướng dẫn chất lượng.

### Ma trận phiên bản, license và kiểm thử thực tế

| Thành phần | Phiên bản thực đo hoặc metadata | License | Trạng thái ngày 15/11 | Bằng chứng/Quyết định |
|---|---|---|---|---|
| macOS + Node.js + npm | Node **22.23.3**, npm **10.9.9**, macOS Intel | Node MIT, npm Artistic-2.0 | **RUNNABLE** | CLI `node --version`/`npm --version`; Node phù hợp engines Vite/Chrome/Context7 |
| Bun | **1.4.3** | MIT | **VERIFIED** | `$HOME/.bun/bin/bun --version`; frozen install + build/test; Bun workspace và `bun:sqlite` đang vận hành |
| Vue 3 + TypeScript | **Vue 3.5.45**, **TS 5.9.3** | Vue MIT, TS Apache-2.0 | **INSTALLED** | Import/compilation trong Web; typecheck + build phải PASS |
| Vite + plugin Vue | **Vite 8.3.8**, **@vitejs/plugin-vue 6.0.11** | MIT | **INSTALLED** | Web HTTP 200; Vite yêu cầu Node `^20.19.0 || >=22.12.0` |
| Element Plus | **2.14.8** | MIT | **INSTALLED / UI VERIFIED** | Nút UI và dialog trong Web đang hoạt động |
| Vue Flow | **@vue-flow/core 1.48.2** | MIT | **INSTALLED (AC-02)** | Module thực sự resolve được từ `apps/web`, Vue peer `^3.3.0`, đã dùng trong Canvas AC-02; **không cài lại** |
| SQLite | Bun built-in `bun:sqlite`, schema **v4** hiện tại | Bundled with Bun | **VERIFIED** | `GET /api/health` HTTP 200, `database=connected`; không tạo DB hoặc reset trong đợt này |
| Playwright CLI / Skills | **1.65.1** | Apache-2.0 | **VERIFIED — BROWSER THẬT** | CLI version/help, mở app ở `127.0.0.1:5182`, snapshot DOM, click retry, Network GET health 200, console 0 errors/0 warnings; Skill có sẵn và được cập nhật |
| Chrome DevTools MCP | **1.13.0** | Apache-2.0 | **CLI VERIFIED, MCP NOT CONNECTED** | `npx ... --version` và `--help` chạy, nhưng `codex mcp list` không có DevTools MCP. Chưa dùng tool MCP để điều khiển Chrome; không báo tích hợp |
| Context7 MCP | **4.7.0**, Node `>=20.18.1` | MIT | **CLI VERIFIED, MCP NOT CONNECTED** | Npm cache mặc định EACCES; thử `npx ... --help` với `npm_config_cache` tạm **PASS**. Không có Context7 trong `codex mcp list` và chưa gọi công cụ truy xuất docs qua MCP |
| Codex CLI và agent plugins | **codex-cli 0.167.0** | Tùy thành phần | **CLI VERIFIED / plugin-specific NOT TESTED** | `codex --version`, `codex mcp list`: `cua_repl`, `node_repl` enabled; `codex_app` disabled. Chỉ xác nhận client và tên MCP, **không suy diễn Plugins được kích hoạt hoặc dùng được** |
| AGENTS.md, repo Skills | 1 `AGENTS.md`; **2 repo Skills** | Mã/tài liệu nội bộ | **PRESENT + INSTRUCTIONS CHECKED** | `.agents/skills/ac01-browser-verification/SKILL.md` và `.agents/skills/ac01-tooling-qa/SKILL.md`; Codex/agent phải làm theo, không phải package runtime |
| @dagrejs/dagre | Registry **3.1.3** | MIT | **NOT INSTALLED** | Chỉ dùng nếu có tiêu chí auto-layout; AC-01 không cần; không trùng chức năng Vue Flow |
| Pinia | Registry **4.1.0** | MIT | **NOT INSTALLED** | State hiện có tại Vue composable; chưa cần store toàn ứng dụng; không thay framework |
| Zod | Registry **4.6.7** | MIT | **NOT INSTALLED** | Backend đã có validation thủ công và tests; chỉ cân nhắc khi boundary/API nhiều schema cần thống nhất |

**Lưu ý về Bun workspace:** `npm ls --depth=0` có thể báo `UNMET DEPENDENCY @ac/*` vì npm không hiểu đầy đủ cách Bun quản lý workspace/link. Đây **không phải** bằng chứng ứng dụng lỗi: kiểm tra bằng `bun install --frozen-lockfile`, `node` resolve module từ đúng `apps/web`, typecheck/build và test chạy thật. Không dùng `npm install` để “sửa” hệ thống lockfile do Bun sở hữu.

### Lựa chọn và lý do tránh cài đặt trùng

1. **Giữ Playwright CLI + Skill nội bộ** làm luồng kiểm thử E2E mặc định AC-01, vì đã thấy được DOM/Network/Console và click thao tác thật. Không đưa Playwright vào dependencies ứng dụng chỉ để chạy lệnh agent thông qua `npx` với version pin.
2. **Hoãn cấu hình Chrome DevTools MCP**: bộ công cụ có thế mạnh khi debug performance, memory, network, nhưng nhiều thao tác trùng với Playwright; chưa có use case AC-01 cần cả hai và không chứng minh được MCP client đã gọi tool.
3. **Hoãn kết nối Context7 MCP**: hữu ích khi tra cứu API phiên bản mới; có thể chạy local CLI với npm cache tạm, nhưng chưa chứng minh retrieval qua MCP. Chỉ cấu hình trong Codex khi có tác vụ tài liệu thật và kiểm chứng truy vấn trả nội dung.
4. **Codex Plugins/Skills** là lớp workflow/connector của coding agent, không phải thư viện cần cài trong `apps/web` hay `apps/server`. Đợt này ưu tiên file hướng dẫn repo-scoped, không tự cài plugin bên thứ ba hay thay đổi cấu hình `~/.codex`.
5. **Không thêm Dagre/Pinia/Zod** vì sẽ tăng số dependency mà không tạo tiêu chí nghiệm thu AC-01 mới. Vue Flow đã có từ AC-02, không được thay thế hoặc viết lại.

### Cách chạy lại công cụ và giới hạn bằng chứng

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install --frozen-lockfile
bun run typecheck
bun run build
bun test apps/server/src/index.test.ts

# Khi ứng dụng đã chạy: HTTP-only smoke, không thêm hoặc xóa dự án
AC_WEB_URL=http://127.0.0.1:5182 bun run tooling:smoke

# Browser UI thật (một session rồi đóng)
npx --yes playwright@1.65.1 cli -s=ac01toolkit open http://127.0.0.1:5182/
npx --yes playwright@1.65.1 cli -s=ac01toolkit snapshot
npx --yes playwright@1.65.1 cli -s=ac01toolkit click '[data-map-id="AC.SYSTEM.HEALTH.RETRY"]'
npx --yes playwright@1.65.1 cli -s=ac01toolkit requests
npx --yes playwright@1.65.1 cli -s=ac01toolkit console
npx --yes playwright@1.65.1 cli -s=ac01toolkit close

# Optional CLI inspection, KHÔNG chứng minh đã đăng ký/điều khiển MCP
npx --yes chrome-devtools-mcp@1.13.0 --version
npx --yes chrome-devtools-mcp@1.13.0 --help
npm_config_cache="$(mktemp -d /tmp/trader-npm-cache-XXXXXXXX)" npx --yes @upstash/context7-mcp@4.7.0 --help
codex --version
codex mcp list
```

**Nguồn upstream kiểm tra license và compatibility:** [Playwright CLI](https://github.com/microsoft/playwright-cli), [Chrome DevTools MCP releases](https://github.com/ChromeDevTools/chrome-devtools-mcp/releases), [Context7 npm](https://www.npmjs.com/package/@upstash/context7-mcp), [OpenAI agent skills](https://learn.chatgpt.com/docs/build-skills), [Codex plugin format](https://developers.openai.com/api/docs/guides/agents-api/tools/plugins), [Vue Flow](https://vueflow.dev/), [Dagre](https://github.com/dagrejs/dagre), [Pinia](https://pinia.vuejs.org/), [Zod](https://zod.dev/).

**Không chứng minh được ở đợt này:** Chrome DevTools MCP gọi tool qua một MCP client; Context7 trả tài liệu qua MCP; hiệu quả của từng plugin Codex trong một coding task thật. Các mục này vẫn `NOT TESTED`, không được ghi thành “đã cài đặt thành công”. Những mục Canvas/AI/video/Desktop chỉ nằm ở kế hoạch giai đoạn sau ở phía dưới, không phát sinh dependency/cấu hình mới trong AC-01.

---

## Nhật ký đánh giá ban đầu AC-01 (14/11/2026, giữ làm lịch sử)

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
