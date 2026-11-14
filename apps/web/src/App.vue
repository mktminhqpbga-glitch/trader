<template>
  <div class="appShell" data-map-id="AC.APP">
    <header class="header">
      <div class="brand"><span class="brandIcon">✳</span><div><strong>AI Canvas Studio</strong><small>Ứng dụng AI Canvas độc lập</small></div></div>
      <span class="phase">Giai đoạn 1 · Nền tảng</span>
    </header>
    <main class="main" data-map-id="AC.HOME">
      <div class="eyebrow">THIẾT LẬP ỨNG DỤNG MỚI</div>
      <h1>Sáng tạo không giới hạn.</h1>
      <p class="intro">Trước khi xây Canvas và kết nối AI, hãy xác minh backend và cơ sở dữ liệu thật. Mỗi nút xuất hiện trong ứng dụng phải có chức năng hoạt động.</p>
      <section class="health" data-map-id="AC.SYSTEM.HEALTH" aria-labelledby="healthTitle">
        <div class="healthTop">
          <div><span class="sectionLabel">TRẠNG THÁI HỆ THỐNG</span><h2 id="healthTitle">Máy chủ và SQLite</h2></div>
          <span :class="['status', state]" role="status" aria-live="polite">{{ stateText }}</span>
        </div>
        <p v-if="state === 'connected'">API đã phản hồi và truy vấn SQLite thành công.</p>
        <p v-else-if="state === 'checking'">Đang kiểm tra kết nối thật...</p>
        <p v-else class="errorText">{{ errorMessage }}</p>
        <div class="healthFoot"><code>GET /api/health</code><el-button data-map-id="AC.SYSTEM.HEALTH.RETRY" :loading="state === 'checking'" @click="checkHealth">Kiểm tra lại</el-button></div>
      </section>
      <div class="next"><div class="nextNumber">01</div><div><strong>Bước đang triển khai</strong><p>Web, Bun, SQLite và tài liệu hệ thống. Canvas, node ảnh/video, AI và Chrome Extension chưa được triển khai; không có nút giả.</p></div></div>
    </main>
    <footer class="footer">AI Canvas Studio · Bản nền tảng · Chỉ hiển thị trạng thái đã xác minh</footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
type HealthState = "checking" | "connected" | "failed";
type HealthResponse = { ok?: boolean; database?: string; message?: string };
const state = ref<HealthState>("checking");
const errorMessage = ref("");
const stateText = computed(() => state.value === "connected" ? "Đã kết nối" : state.value === "checking" ? "Đang kiểm tra" : "Không kết nối");
let checkId = 0;
let timer: ReturnType<typeof setInterval> | undefined;
async function checkHealth() {
  const id = ++checkId;
  state.value = "checking";
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    const body = response.headers.get("content-type")?.includes("application/json")
      ? await response.json() as HealthResponse : undefined;
    if (!response.ok || !body?.ok || body.database !== "connected") {
      throw new Error(body?.message ?? "Máy chủ phản hồi HTTP " + response.status);
    }
    if (id === checkId) { state.value = "connected"; errorMessage.value = ""; }
  } catch (error) {
    if (id === checkId) {
      state.value = "failed";
      errorMessage.value = error instanceof Error ? error.message : "Lỗi kết nối không xác định";
    }
  }
}
onMounted(() => {
  void checkHealth();
  timer = setInterval(() => { void checkHealth(); }, 30000);
});
onUnmounted(() => { checkId++; if (timer) clearInterval(timer); });
</script>

<style>
:root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0a101d;color:#eef2ff}
*{box-sizing:border-box}html,body,#app{margin:0;min-height:100%}
.appShell{min-height:100vh;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% -20%,#1b2750 0%,#0a101d 52%)}
.header{height:76px;padding:0 max(24px,calc((100vw - 1240px)/2));display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #283349;background:#0f1728}
.brand{display:flex;align-items:center;gap:12px}.brandIcon{width:42px;height:42px;border-radius:13px;background:linear-gradient(120deg,#516afa,#9e74fa);display:grid;place-items:center;font-size:26px;color:white}
.brand strong{display:block;font-size:16px}.brand small{display:block;margin-top:3px;color:#8592ac;font-size:12px}
.phase{padding:8px 12px;border-radius:50px;border:1px solid #3a435b;color:#b2bdd5;font-size:12px}
.main{width:100%;max-width:880px;margin:0 auto;padding:88px 24px 60px;flex:1}
.eyebrow{color:#899dff;font-size:11px;font-weight:800;letter-spacing:.15em}h1{font-size:clamp(34px,5vw,54px);letter-spacing:-.045em;margin:16px 0}
.intro{color:#a3afc8;max-width:690px;line-height:1.8;margin-bottom:36px}
.health{border-radius:20px;border:1px solid #2d3b59;background:#151f34;padding:27px;box-shadow:0 15px 45px #03081375}
.healthTop{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}.sectionLabel{font-size:11px;color:#839bff;letter-spacing:.1em;font-weight:700}
h2{font-size:21px;margin:8px 0 0}.health p{color:#a8b5ca;min-height:25px;margin:22px 0}.health .errorText{color:#ff9da7}
.status{font-size:12px;border-radius:100px;padding:8px 12px;border:1px solid #48536a;color:#aab9d5}.status.connected{border-color:#317657;color:#7adfae}.status.failed{border-color:#803b4f;color:#ff96a5}
.healthFoot{display:flex;align-items:center;justify-content:space-between;gap:14px;border-top:1px solid #293752;padding-top:18px}.healthFoot code{color:#9baac3;font-size:12px}
.healthFoot .el-button{background:#596dff;border-color:#596dff;color:white}.healthFoot .el-button:hover{background:#7888ff}
.next{display:flex;align-items:flex-start;gap:15px;margin-top:28px;color:#98a6c2}.nextNumber{min-width:40px;height:40px;border:1px solid #344365;display:grid;place-items:center;border-radius:12px;color:#8299fe}
.next strong{color:#d7e3fd;font-size:14px}.next p{font-size:13px;line-height:1.7;margin-top:7px}.footer{text-align:center;padding:20px;color:#66768e;border-top:1px solid #273147;font-size:12px}
@media(max-width:560px){.header{padding:0 18px}.phase{display:none}.main{padding-top:54px}.health{padding:20px}}
</style>
