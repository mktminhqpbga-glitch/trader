<template>
  <div class="studioShell" data-map-id="AC.APP">
    <header class="topbar">
      <button class="brandButton" type="button" data-map-id="AC.HOME.PROJECTS" :disabled="isNavigating" @click="goHome">
        <span class="brandMark">✳</span>
        <span><strong>AI Canvas Studio</strong><small>Canvas workflow foundation</small></span>
      </button>
      <div class="topbarRight">
        <span class="phasePill">Giai đoạn 1 · Canvas</span>
          <button v-if="activeProject" class="newTopButton" type="button" data-map-id="AC.HOME.NEW" :disabled="isNavigating" @click="openNewProject">＋ Dự án mới</button>
      </div>
    </header>

    <div class="appBody">
      <aside class="sidebar" data-map-id="AC.HOME.PROJECTS">
        <div class="sidebarHeading"><div><span class="eyebrow">WORKSPACE</span><h2>Dự án</h2></div><button class="iconButton" type="button" aria-label="Tạo dự án mới" data-map-id="AC.HOME.NEW" @click="openNewProject">＋</button></div>
        <button class="newProjectButton" type="button" data-map-id="AC.HOME.NEW" @click="openNewProject">＋ Tạo dự án mới</button>
        <div v-if="projects.length" class="projectList">
          <button v-for="project in projects" :key="project.id" type="button" class="projectItem" :disabled="isNavigating" :class="{ active: activeProject?.id === project.id }" data-map-id="AC.HOME.OPEN" :data-project-id="project.id" @click="openProject(project.id)">
            <span class="projectDot" :class="{ active: activeProject?.id === project.id }"></span><span class="projectName">{{ project.name }}</span><span class="projectDate">{{ formatDate(project.updatedAt) }}</span>
          </button>
        </div>
        <div v-else class="emptyProjects"><span class="emptyGlyph">◇</span><p>Chưa có dự án</p><small>Tạo dự án đầu tiên để bắt đầu Canvas.</small></div>
        <div class="sidebarFooter" data-map-id="AC.SYSTEM.HEALTH"><span class="statusDot" :class="apiStatus"></span><span role="status" aria-live="polite" :title="apiError">{{ apiStatus === "online" ? "Đã kết nối · SQLite" : apiStatus === "checking" ? "Đang kiểm tra..." : "Không kết nối" }}</span><button type="button" class="retryHealth" data-map-id="AC.SYSTEM.HEALTH.RETRY" :disabled="apiStatus === 'checking'" @click="retryHealth">Kiểm tra lại</button></div>
      </aside>

      <main v-if="!activeProject" class="homeMain" data-map-id="AC.HOME">
        <div class="homeContent">
          <span class="eyebrow">AI CANVAS STUDIO · AC-02A</span>
          <h1>Xây dựng ý tưởng<br /><em>trên không gian vô hạn.</em></h1>
          <p class="homeLead">Tạo dự án, nhập nội dung vào Text Node và sắp xếp trên Canvas vô hạn. Mọi thay đổi được tự động lưu vào SQLite để tiếp tục sau khi mở lại.</p>
          <button class="primaryButton heroButton" type="button" data-map-id="AC.HOME.NEW" @click="openNewProject">＋ Tạo dự án đầu tiên</button>
          <div class="featureRow"><div><span>01</span><strong>Canvas vô hạn</strong><small>Pan, zoom và sắp xếp tự do</small></div><div><span>02</span><strong>Text Node</strong><small>Nhập nội dung và kéo thả</small></div><div><span>03</span><strong>Lưu thật</strong><small>SQLite và autosave</small></div></div>
        </div>
        <div class="homeOrb" aria-hidden="true"><div class="orbGrid"></div><div class="orbNode orbNodeA">✦</div><div class="orbNode orbNodeB">Aa</div><div class="orbLine"></div></div>
      </main>

      <main v-else class="canvasMain" data-map-id="AC.CANVAS">
        <div class="canvasHeader">
          <div><button type="button" class="backButton" data-map-id="AC.HOME.PROJECTS" :disabled="isNavigating" @click="goHome">← Dự án</button><h1>{{ activeProject.name }}</h1><span class="canvasMeta">{{ nodes.length }} node · {{ edges.length }} kết nối</span></div>
          <div class="canvasHeaderActions"><span class="saveStatus" :class="saveState" data-map-id="AC.CANVAS.SAVE.STATUS"><i></i>{{ saveStateText }}</span><button class="saveButton" type="button" data-map-id="AC.CANVAS.SAVE" :disabled="isSaving || isHydrating || isNavigating || !hasUnsaved || saveConflict" @click="saveNow">{{ isSaving ? "Đang lưu..." : saveError ? "Thử lưu lại" : "Lưu Canvas" }}</button></div>
        </div>
        <div v-if="saveConflict" class="saveAlert" data-map-id="AC.CANVAS.SAVE.CONFLICT"><span>Canvas đã thay đổi ở nơi khác. Bản nháp trên màn hình vẫn được giữ nguyên.</span><button type="button" data-map-id="AC.CANVAS.SAVE.DOWNLOAD" @click="downloadDraft">Tải bản nháp</button><button type="button" data-map-id="AC.CANVAS.SAVE.OVERWRITE" @click="resolveConflict">Xác nhận ghi phiên bản này</button><button type="button" data-map-id="AC.CANVAS.SAVE.RELOAD" @click="reloadServerCanvas">Nạp bản trên máy chủ</button></div>
        <div v-else-if="saveError" class="saveAlert" data-map-id="AC.CANVAS.SAVE.ERROR"><span>{{ saveError }} — các chỉnh sửa vẫn còn trên Canvas.</span><button type="button" data-map-id="AC.CANVAS.SAVE.RETRY" @click="saveNow">Thử lại</button><button type="button" data-map-id="AC.CANVAS.SAVE.DOWNLOAD" @click="downloadDraft">Tải bản nháp</button></div>
        <section class="canvasViewport" :class="{ canvasNavigating: isNavigating }" data-map-id="AC.CANVAS.CONNECT">
          <div class="canvasToolbar" data-map-id="AC.CANVAS.TOOLBAR">
            <div class="toolGroup"><button type="button" data-map-id="AC.CANVAS.ZOOM.IN" aria-label="Phóng to" title="Phóng to" @click="zoomIn">＋</button><button type="button" data-map-id="AC.CANVAS.ZOOM.OUT" aria-label="Thu nhỏ" title="Thu nhỏ" @click="zoomOut">−</button><button type="button" data-map-id="AC.CANVAS.FIT" title="Vừa khung nhìn" @click="fitCanvas">⌗</button></div>
            <div class="toolDivider"></div>
            <div class="addNodeWrap"><button type="button" class="addNodeButton" data-map-id="AC.CANVAS.ADD.NODE" @click="toggleNodeMenu">＋ Thêm Node <span>⌄</span></button><div v-if="showNodeMenu" class="nodeMenu"><button type="button" data-map-id="AC.CANVAS.ADD.NODE.TEXT" @click="addNode('text')"><span>Ab</span><div><strong>Text Node</strong><small>Văn bản và ý tưởng</small></div></button></div></div>
          </div>
          <div class="canvasHint"><span>⌘</span><span>Kéo nền để di chuyển · Lăn chuột để zoom · Kéo cổng để nối node</span></div>
          <VueFlow :key="activeProject.id" v-model:nodes="nodes" v-model:edges="edges" :node-types="nodeTypes" :default-viewport="initialViewport" :min-zoom="0.2" :max-zoom="2" :delete-key-code="null" :connect-on-click="true" :is-valid-connection="isValidConnection" :fit-view-on-init="false" @connect="onConnect" @edge-click="onEdgeClick" @pane-click="selectedEdgeId = ''" @node-drag-stop="onNodeDragStop" @viewport-change="onViewportChange">
          </VueFlow>
          <div v-if="selectedEdgeId" class="edgeAction"><span>Đã chọn kết nối</span><button type="button" data-map-id="AC.CANVAS.EDGE.DELETE" @click="deleteSelectedEdge">Xóa dây</button></div>
          <div v-if="!nodes.length" class="canvasEmpty"><div class="emptyCanvasIcon">✦</div><h2>Canvas đang trống</h2><p>Thêm node đầu tiên để bắt đầu xây dựng workflow.</p><button type="button" class="primaryButton" data-map-id="AC.CANVAS.ADD.NODE.EMPTY" @click="toggleNodeMenu">＋ Thêm Node</button></div>
        </section>
      </main>
    </div>

    <el-dialog v-model="newProjectVisible" title="Tạo dự án mới" width="420px" :close-on-click-modal="false" data-map-id="AC.HOME.NEW.DIALOG">
      <p class="dialogIntro">Mỗi dự án có Canvas và dữ liệu riêng được lưu trong SQLite.</p>
      <el-input v-model="newProjectName" data-map-id="AC.HOME.NEW.NAME" placeholder="Ví dụ: Storyboard mùa hè" maxlength="100" show-word-limit @keyup.enter="createProject" />
      <template #footer><el-button data-map-id="AC.HOME.NEW.CANCEL" @click="newProjectVisible = false">Hủy</el-button><el-button type="primary" data-map-id="AC.HOME.NEW.CREATE" :loading="isCreatingProject" @click="createProject">Tạo dự án</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { VueFlow } from "@vue-flow/core";
import { useStudioState } from "./composables/useStudioState";

const {
  nodeTypes, initialViewport, nodes, edges, projects, activeProject, newProjectVisible,
  newProjectName, isCreatingProject, isNavigating, isSaving, isHydrating, showNodeMenu,
  selectedEdgeId, apiStatus, apiError, saveError, saveConflict, saveState, saveStateText,
  hasUnsaved, openNewProject, toggleNodeMenu, retryHealth, createProject, openProject,
  goHome, saveNow, resolveConflict, reloadServerCanvas, downloadDraft, addNode,
  isValidConnection, onConnect, onEdgeClick, deleteSelectedEdge, onNodeDragStop,
  onViewportChange, zoomIn, zoomOut, fitCanvas, formatDate,
} = useStudioState();
</script>

<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#090f1c;color:#edf2ff;font-synthesis:none}*{box-sizing:border-box}html,body,#app{width:100%;height:100%;margin:0}button,input,textarea{font:inherit}.studioShell{height:100%;min-height:680px;background:#090f1c;color:#edf2ff}.topbar{height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid #202d45;background:#0d1525}.brandButton{display:flex;align-items:center;gap:11px;padding:0;border:0;background:transparent;color:#edf2ff;text-align:left;cursor:pointer}.brandMark{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:linear-gradient(135deg,#5a72ff,#a66cf2);font-size:20px}.brandButton strong{display:block;font-size:14px}.brandButton small{display:block;margin-top:3px;color:#7584a2;font-size:10px}.topbarRight{display:flex;align-items:center;gap:14px}.phasePill{padding:7px 11px;border:1px solid #2c3a54;border-radius:999px;color:#9aa9c5;font-size:11px}.newTopButton,.backButton,.iconButton,.newProjectButton,.toolGroup button,.addNodeButton,.saveButton{border:1px solid #2e3d59;background:#152139;color:#c8d4ed;cursor:pointer}.newTopButton{padding:8px 13px;border-radius:9px;font-size:12px}.newTopButton:hover,.saveButton:hover,.newProjectButton:hover{border-color:#7084ff;color:#fff}.appBody{display:flex;height:calc(100% - 70px)}.sidebar{display:flex;flex:0 0 248px;flex-direction:column;padding:22px 16px 16px;border-right:1px solid #202d45;background:#0c1423}.sidebarHeading{display:flex;align-items:flex-start;justify-content:space-between;padding:0 8px 18px}.eyebrow{color:#758aff;font-size:9px;font-weight:800;letter-spacing:.17em}.sidebar h2{margin:7px 0 0;font-size:19px;letter-spacing:-.02em}.iconButton{width:30px;height:30px;border-radius:8px;font-size:17px}.newProjectButton{width:100%;margin-bottom:15px;padding:10px;border-radius:9px;font-size:12px}.projectList{display:grid;gap:5px}.projectItem{display:grid;grid-template-columns:9px minmax(0,1fr) auto;align-items:center;gap:9px;width:100%;padding:11px 9px;border:1px solid transparent;border-radius:9px;background:transparent;color:#b5c2dc;text-align:left;cursor:pointer}.projectItem:hover{background:#121e33}.projectItem.active{border-color:#34466c;background:#182643;color:#fff}.projectDot{width:7px;height:7px;border-radius:99px;background:#4b5b78}.projectDot.active{background:#7d91ff;box-shadow:0 0 0 4px rgb(125 145 255 / 12%)}.projectName{overflow:hidden;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.projectDate{color:#657794;font-size:10px}.emptyProjects{padding:35px 12px;color:#7383a1;text-align:center}.emptyGlyph{font-size:28px;color:#6478b5}.emptyProjects p{margin:10px 0 4px;color:#bac7de;font-size:12px}.emptyProjects small{font-size:10px;line-height:1.5}.sidebarFooter{display:flex;align-items:center;gap:7px;margin-top:auto;padding:13px 8px 0;border-top:1px solid #202d45;color:#7383a0;font-size:10px}.statusDot{width:7px;height:7px;border-radius:99px;background:#d68791}.statusDot.online{background:#62d9a5;box-shadow:0 0 0 4px rgb(98 217 165 / 10%)}.homeMain{position:relative;display:flex;flex:1;align-items:center;justify-content:space-between;overflow:hidden;padding:7vw 9vw;background:radial-gradient(circle at 70% 43%,#17254b 0,#0b1426 34%,#090f1c 72%)}.homeContent{position:relative;z-index:1;max-width:560px}.homeMain h1{margin:18px 0 20px;font-size:clamp(38px,5vw,70px);letter-spacing:-.06em;line-height:1.02}.homeMain h1 em{color:#889bff;font-style:normal}.homeLead{max-width:450px;margin:0 0 30px;color:#8e9db8;font-size:14px;line-height:1.8}.primaryButton{border:0;border-radius:9px;padding:12px 17px;background:linear-gradient(135deg,#6278ff,#826de8);box-shadow:0 12px 26px rgb(77 86 210 / 28%);color:#fff;font-size:12px;cursor:pointer}.primaryButton:hover{filter:brightness(1.08);transform:translateY(-1px)}.heroButton{margin-bottom:55px}.featureRow{display:flex;gap:25px}.featureRow div{display:grid;gap:4px}.featureRow span{color:#667eff;font:11px ui-monospace,SFMono-Regular,Menlo,monospace}.featureRow strong{font-size:11px}.featureRow small{color:#6d7e9c;font-size:10px}.homeOrb{position:absolute;right:9%;width:33vw;height:33vw;max-width:490px;max-height:490px;border:1px solid #26365d;border-radius:50%;background:radial-gradient(circle,#1b2d5b 0,#111f40 48%,transparent 70%);box-shadow:inset 0 0 50px rgb(89 116 255 / 9%),0 0 100px rgb(47 71 146 / 12%)}.orbGrid{position:absolute;inset:13%;border:1px dashed #415a8c;border-radius:50%;opacity:.35}.orbNode{position:absolute;display:grid;place-items:center;width:64px;height:64px;border:1px solid #536fbe;border-radius:16px;background:#182953;box-shadow:0 12px 28px rgb(0 0 0 / 28%);color:#bcc9ff;font-size:22px}.orbNodeA{top:25%;left:23%}.orbNodeB{right:21%;bottom:24%;font-size:16px}.orbLine{position:absolute;top:43%;left:34%;width:36%;border-top:1px dashed #7c8dca;transform:rotate(28deg)}.canvasMain{display:flex;flex:1;flex-direction:column;min-width:0;background:#0a111f}.canvasHeader{display:flex;align-items:center;justify-content:space-between;gap:20px;height:76px;padding:0 24px;border-bottom:1px solid #202d45;background:#0d1525}.backButton{margin-bottom:8px;padding:0;border:0;background:transparent;color:#7487aa;font-size:11px}.backButton:hover{color:#b8c6e2}.canvasHeader h1{display:inline;margin:0 10px 0 0;font-size:18px;letter-spacing:-.02em}.canvasMeta{color:#687996;font-size:11px}.canvasHeaderActions{display:flex;align-items:center;gap:15px}.saveStatus{display:flex;align-items:center;gap:7px;color:#7584a1;font-size:11px}.saveStatus i{width:7px;height:7px;border-radius:99px;background:#687996}.saveStatus.saved{color:#7ddcae}.saveStatus.saved i{background:#62d9a5}.saveStatus.saving i{background:#f0bd72;animation:pulse 1s ease-in-out infinite}.saveStatus.error{color:#ff9ba9}.saveStatus.error i{background:#ff7689}.saveButton{padding:9px 14px;border-radius:8px;font-size:11px}.saveButton:disabled{cursor:wait;opacity:.7}@keyframes pulse{50%{opacity:.4}}.canvasViewport{position:relative;flex:1;min-height:0;background-color:#0c1423;background-image:radial-gradient(circle at 1px 1px,#25324b 1px,transparent 0);background-size:28px 28px}.vue-flow{background:transparent}.canvasToolbar{position:absolute;z-index:10;top:18px;left:20px;display:flex;align-items:center;gap:9px}.toolGroup{display:flex;padding:3px;border:1px solid #2d3e5d;border-radius:10px;background:#111d32;box-shadow:0 10px 25px rgb(0 0 0 / 22%)}.toolGroup button{width:34px;height:32px;border:0;border-radius:7px;background:transparent;font-size:18px}.toolGroup button:hover{background:#253657;color:#fff}.toolDivider{width:1px;height:30px;background:#30415f}.addNodeWrap{position:relative}.addNodeButton{display:flex;align-items:center;gap:12px;padding:10px 13px;border-radius:9px;background:#5e72f0;color:#fff;box-shadow:0 8px 20px rgb(72 86 211 / 28%);font-size:11px}.addNodeButton span{font-size:13px}.nodeMenu{position:absolute;top:47px;left:0;z-index:30;width:220px;padding:6px;border:1px solid #334463;border-radius:11px;background:#101b30;box-shadow:0 18px 42px rgb(0 0 0 / 36%)}.nodeMenu button{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border:0;border-radius:8px;background:transparent;color:#d7e2f9;text-align:left;cursor:pointer}.nodeMenu button:hover{background:#1d2c4a}.nodeMenu button>span{display:grid;place-items:center;width:29px;height:29px;border-radius:8px;background:#283963;color:#a8b8ff;font-size:11px}.nodeMenu strong,.nodeMenu small{display:block}.nodeMenu strong{font-size:11px}.nodeMenu small{margin-top:3px;color:#7385a7;font-size:9px}.canvasHint{position:absolute;z-index:5;right:20px;top:22px;display:flex;align-items:center;gap:7px;color:#5e7091;font-size:10px}.canvasHint span:first-child{display:grid;place-items:center;width:18px;height:18px;border:1px solid #334663;border-radius:5px;color:#90a2c7;font-size:10px}.canvasEmpty{position:absolute;z-index:4;top:50%;left:50%;width:280px;text-align:center;transform:translate(-50%,-40%);pointer-events:none}.canvasEmpty>*{pointer-events:auto}.emptyCanvasIcon{margin:auto;width:48px;height:48px;border:1px solid #3d5080;border-radius:15px;background:#172746;color:#8299ff;display:grid;place-items:center;font-size:23px}.canvasEmpty h2{margin:15px 0 7px;font-size:16px}.canvasEmpty p{margin:0 0 18px;color:#7182a1;font-size:11px}.edgeAction{position:absolute;z-index:11;right:20px;bottom:18px;display:flex;align-items:center;gap:10px;padding:8px 11px;border:1px solid #334463;border-radius:9px;background:#101a2d;color:#9eafd0;font-size:10px}.edgeAction button{border:0;border-radius:6px;padding:6px 9px;background:#512d42;color:#ffb7c0;font-size:10px;cursor:pointer}.el-dialog{background:#111d31!important;border:1px solid #334463}.el-dialog__title{color:#edf3ff!important;font-size:17px}.el-dialog__body{color:#9eacc5}.dialogIntro{margin:0 0 17px;color:#8494b1;font-size:12px}.el-input__wrapper{background:#0b1425!important;box-shadow:0 0 0 1px #30415f inset!important}.el-input__inner{color:#edf3ff!important}.el-dialog__footer{border-top:1px solid #263652}.vue-flow__controls{display:none}.vue-flow__edge-path{stroke:#778cff;stroke-width:2}.vue-flow__edge.selected .vue-flow__edge-path{stroke:#ffca85;stroke-width:3}.vue-flow__connection-path{stroke:#95a6ff;stroke-width:2}.vue-flow__handle-connecting{background:#f0bd72}.vue-flow__handle-valid{background:#68e2ad}.vue-flow__handle-invalid{background:#ff7184}@media(max-width:900px){.homeOrb{right:-10%;width:45vw;height:45vw}.homeMain{padding-left:6vw}.canvasHint{display:none}}@media(max-width:680px){.sidebar{flex-basis:190px}.topbar{padding:0 14px}.phasePill{display:none}.canvasHeader{padding:0 14px}.canvasHeaderActions{gap:8px}.saveStatus{display:none}.canvasToolbar{left:10px;top:10px}.homeOrb{opacity:.35}.homeMain h1{font-size:38px}.featureRow{gap:12px}.featureRow div:last-child{display:none}}
</style>
<style>
.brandButton:disabled,.projectItem:disabled,.newTopButton:disabled,.backButton:disabled{opacity:.5;cursor:wait}
.canvasNavigating{pointer-events:none;opacity:.75}
.saveStatus.dirty{color:#f0c889}
.saveStatus.dirty i{background:#f0c889}
.saveStatus.conflict{color:#ffabb1}
.saveStatus.conflict i{background:#ff7184}
.sidebarFooter{gap:7px}
.sidebarFooter>span:nth-child(2){flex:1}
.retryHealth{padding:5px 7px;border:1px solid #334463;border-radius:6px;background:#142138;color:#b9c7e3;font-size:10px;cursor:pointer}
.retryHealth:disabled{opacity:.6;cursor:wait}
.saveAlert{display:flex;align-items:center;flex-wrap:wrap;gap:9px;padding:9px 22px;border-bottom:1px solid #644855;background:#2b1c2b;color:#ffccd0;font-size:11px}
.saveAlert span{flex:1;min-width:220px}
.saveAlert button{padding:6px 9px;border:1px solid #815e6e;border-radius:6px;background:#3d283b;color:#ffe4e5;font-size:10px;cursor:pointer}
.saveAlert button:hover{background:#593a51}
</style>
