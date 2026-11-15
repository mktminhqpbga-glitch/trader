<template>
  <div class="designPreviewRoot" :class="['variant' + variant, { showingLibrary: screen === 'library', inspectorShown: inspectorOpen && !!selectedNode }]" data-map-id="AC.UI02.PREVIEW.ROOT" @keydown.esc="dismissOverlays">
    <header class="previewTopbar">
      <button type="button" class="previewBrand" aria-label="Mở thư viện thiết kế" title="Thư viện dự án mẫu" data-map-id="AC.UI02.PREVIEW.HOME" @click="screen = 'library'; dismissOverlays()">
        <span class="previewBrandSymbol" aria-hidden="true">◈</span>
        <span class="previewBrandText">FRAME<span>SPACE</span></span>
      </button>
      <span class="previewTopDivider" aria-hidden="true"></span>
      <div class="previewBreadcrumb"><span>Studio</span><span aria-hidden="true">/</span><strong>{{ screen === 'library' ? 'Thư viện dự án' : activeProjectName }}</strong></div>
      <div class="previewTopSpacer"></div>
      <div class="variantSwitch" role="group" aria-label="Chọn phương án thiết kế">
        <button type="button" :aria-pressed="variant === 'A'" data-map-id="AC.UI02.PREVIEW.MODE.A" @click="selectVariant('A')">A <span>LibTV Canvas</span></button>
        <button type="button" :aria-pressed="variant === 'B'" data-map-id="AC.UI02.PREVIEW.MODE.B" @click="selectVariant('B')">B <span>Cinematic Pro</span></button>
      </div>
      <button type="button" class="previewTopAction" data-map-id="AC.UI02.PREVIEW.PROJECTS" :aria-pressed="screen === 'library'" @click="screen = screen === 'library' ? 'canvas' : 'library'; dismissOverlays()"><StudioIcon name="projects" /><span>Dự án</span></button>
      <span class="previewSavedState" title="Bản thiết kế chỉ lưu trong bộ nhớ tab; không gọi SQLite">● <span>Chế độ an toàn</span></span>
    </header>

    <div class="previewReviewStrip" role="note">
      <span class="reviewMarker">DEMO — DESIGN PREVIEW</span>
      <span class="reviewDisclaimer">Bản Vue tương tác · Dữ liệu chỉ ở bộ nhớ · Không gửi AI / SQLite</span>
      <div class="previewReviewControls">
        <label v-if="screen === 'canvas'">Workflow
          <select v-model="scenario" aria-label="Chọn workflow xem trước" data-map-id="AC.UI02.PREVIEW.SCENARIO"><option value="three">3 node</option><option value="seven">7 node</option><option value="empty">Canvas trống</option></select>
        </label>
        <label v-if="screen === 'canvas'">Media
          <select v-model="mediaMode" aria-label="Chọn trạng thái media" data-map-id="AC.UI02.PREVIEW.MEDIA"><option value="demo">Có DEMO</option><option value="compact">Chưa có kết quả</option></select>
        </label>
        <label v-if="screen === 'canvas'">Trạng thái
          <select v-model="previewStatus" aria-label="Chọn trạng thái UI giả lập" data-map-id="AC.UI02.PREVIEW.STATUS"><option value="normal">Bình thường</option><option value="offline">Offline</option><option value="save503">Lưu lỗi 503</option><option value="conflict409">Xung đột 409</option></select>
        </label>
        <label v-if="screen === 'library'">Thư viện
          <select v-model="libraryMode" data-map-id="AC.UI02.PREVIEW.LIBRARY.MODE" aria-label="Thư viện có dự án hay trống"><option value="projects">Có dự án</option><option value="empty">Trống</option></select>
        </label>
      </div>
    </div>

    <section v-if="screen === 'library'" class="previewLibrary" data-map-id="AC.UI02.PREVIEW.LIBRARY">
      <header class="previewLibraryHeader">
        <div><span class="previewEyebrow">BỘ SƯU TẬP WORKFLOW</span><h1>Dự án của bạn<span class="previewCount">{{ visibleProjects.length }}</span></h1><p>Khám phá ý tưởng, những khung hình và câu chuyện đang phát triển.</p></div>
        <button type="button" class="previewPrimaryButton" data-map-id="AC.UI02.PREVIEW.PROJECT.NEW" @click="openProjectDialog('create')"><StudioIcon name="plus" /> Tạo dự án mẫu</button>
      </header>
      <div class="libraryUtilityRow">
        <label class="previewSearch"><StudioIcon name="search" /><input v-model="libraryQuery" data-map-id="AC.UI02.PREVIEW.PROJECT.SEARCH" type="search" aria-label="Tìm dự án DEMO" placeholder="Tìm dự án, cảnh quay..." /></label>
        <span>{{ visibleProjects.length }} dự án mẫu</span>
      </div>
      <div v-if="visibleProjects.length" class="previewProjectGrid">
        <article v-for="(project, index) in visibleProjects" :key="project.id" class="previewProjectCard">
          <button type="button" class="projectPreviewCover" data-map-id="AC.UI02.PREVIEW.PROJECT.OPEN" :data-preview-project-id="project.id" :aria-label="'Mở dự án mẫu ' + project.name" @click="activeProjectName = project.name; screen = 'canvas'; scenario = 'three'; fitSoon()">
            <img :src="project.poster" alt="Minh họa do dự án tạo riêng cho giao diện xem trước" />
            <span class="previewProjectBadge">DEMO</span><span class="projectCoverIndex">0{{ index + 1 }} / FRAMESPACE</span>
          </button>
          <div class="projectPreviewInformation">
            <button type="button" class="projectPreviewTitle" data-map-id="AC.UI02.PREVIEW.PROJECT.OPEN" :data-preview-project-id="project.id" @click="activeProjectName = project.name; screen = 'canvas'; fitSoon()"><strong>{{ project.name }}</strong><small>{{ project.description }}</small></button>
            <div class="projectCardMenu">
              <button type="button" class="projectMoreButton" data-map-id="AC.UI02.PREVIEW.PROJECT.MENU" :data-preview-project-id="project.id" :aria-expanded="openProjectMenuId === project.id" :aria-label="'Tùy chọn dự án ' + project.name" @click.stop="openProjectMenuId = openProjectMenuId === project.id ? '' : project.id">···</button>
              <div v-if="openProjectMenuId === project.id" class="projectMoreMenu" role="menu">
                <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.PROJECT.RENAME" @click="openProjectDialog('rename', project.id)">Đổi tên dự án mẫu</button>
                <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.PROJECT.DELETE" @click="requestDelete('project', project.id)">Chuyển vào đã xóa</button>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="previewLibraryEmpty" data-map-id="AC.UI02.PREVIEW.LIBRARY.EMPTY">
        <div class="libraryEmptyGlyph" aria-hidden="true">◈</div>
        <h2>{{ libraryQuery ? 'Không tìm thấy dự án' : 'Không có dự án nào' }}</h2>
        <p>{{ libraryQuery ? 'Thử một tên khác trong thư viện mẫu.' : 'Bộ sưu tập đang trống. Tạo dự án demo để xem cách bố trí card.' }}</p>
        <button type="button" class="previewPrimaryButton" data-map-id="AC.UI02.PREVIEW.PROJECT.NEW" @click="openProjectDialog('create')">Tạo dự án đầu tiên</button>
      </div>
      <div class="previewTrashSection">
        <button type="button" data-map-id="AC.UI02.PREVIEW.PROJECT.TRASH" :aria-expanded="trashOpen" @click="trashOpen = !trashOpen">Đã xóa ({{ deletedProjects.length }}) <span aria-hidden="true">{{ trashOpen ? '⌃' : '⌄' }}</span></button>
        <div v-if="trashOpen" class="previewTrashList">
          <p v-if="!deletedProjects.length">Chưa có dự án trong thùng rác mẫu.</p>
          <div v-for="project in deletedProjects" :key="project.id" class="trashProject"><span>{{ project.name }}</span><button type="button" data-map-id="AC.UI02.PREVIEW.PROJECT.RESTORE" @click="restoreProject(project.id)">Khôi phục</button></div>
        </div>
      </div>
    </section>

    <main v-else class="previewWorkspace" data-map-id="AC.UI02.PREVIEW.CANVAS">
      <aside v-if="variant === 'B'" class="previewSceneRail" aria-label="Danh sách cảnh quay">
        <header><span class="previewEyebrow">BẢNG DỰNG</span><h2>Scenes <span>{{ nodes.length }}</span></h2></header>
        <button type="button" class="sceneCreate" data-map-id="AC.UI02.PREVIEW.ADD" @click="togglePalette"><StudioIcon name="plus" /> Thêm node</button>
        <div class="sceneRailList">
          <button v-for="(node, index) in nodes" :key="node.id" type="button" class="sceneRailItem" data-map-id="AC.UI02.PREVIEW.SCENE.SELECT" :data-preview-node-id="node.id" :class="{ active: selectedNodeId === node.id }" :title="String(node.data?.prompt || '')" @click="focusScene(node.id)">
            <span class="sceneNumber">{{ String(index + 1).padStart(2, '0') }}</span><span class="sceneLine"><strong>{{ String(node.data?.title || '') }}</strong><small>{{ node.type === 'text' ? 'Văn bản' : node.type === 'image' ? 'Khung hình' : 'Video' }}</small></span><span aria-hidden="true">›</span>
          </button>
        </div>
        <div class="sceneRailFooter"><span class="sceneRailDot"></span> Chế độ xem trước</div>
      </aside>

      <div class="previewCanvasArea" data-map-id="AC.UI02.PREVIEW.STAGE">
        <VueFlow
          v-if="flowReady"
          :key="scenarioVersion"
          id="design-preview-flow"
          v-model:nodes="nodes"
          v-model:edges="edges"
          :nodeTypes="nodeTypes"
          :minZoom="0.2"
          :maxZoom="2"
          :defaultViewport="{ x: 45, y: 45, zoom: 0.9 }"
          :fitViewOnInit="true"
          :isValidConnection="isValidConnection"
          :connectOnClick="true"
          :deleteKeyCode="null"
          @connect="onConnect"
          @nodeClick="onNodeClick"
          @paneClick="onPaneClick"
          @viewportChange="onViewportChange"
        >
          <template #node-text="props"><designPreviewNode v-bind="props" @inspect="openInspector" @delete="requestDelete('node', $event)" /></template>
          <template #node-image="props"><designPreviewNode v-bind="props" @inspect="openInspector" @delete="requestDelete('node', $event)" /></template>
          <template #node-video="props"><designPreviewNode v-bind="props" @inspect="openInspector" @delete="requestDelete('node', $event)" /></template>
        </VueFlow>

        <div v-if="!nodes.length" class="previewCanvasEmpty" data-map-id="AC.UI02.PREVIEW.EMPTY">
          <span class="canvasEmptySymbol" aria-hidden="true">✦</span><h2>Mọi câu chuyện bắt đầu từ một khung hình.</h2><p>Thêm văn bản, hình ảnh hoặc video để xây dựng workflow.</p>
          <button type="button" class="previewPrimaryButton" data-map-id="AC.UI02.PREVIEW.ADD" @click="togglePalette">+ Thêm node đầu tiên</button>
        </div>

        <div v-if="variant === 'A'" class="previewFloatDock" aria-label="Dock công cụ">
          <button type="button" class="dockCreate" title="Thêm node" aria-label="Thêm node" :aria-expanded="paletteOpen" data-map-id="AC.UI02.PREVIEW.ADD" @click.stop="togglePalette"><StudioIcon name="plus" /></button>
          <span class="dockDivider"></span>
          <button type="button" data-map-id="AC.UI02.PREVIEW.PROJECTS" title="Thư viện dự án" aria-label="Mở thư viện dự án" @click="screen = 'library'"><StudioIcon name="projects" /></button>
          <button type="button" data-map-id="AC.UI02.PREVIEW.FIT.DOCK" title="Vừa Canvas" aria-label="Vừa Canvas" @click="fitSoon"><StudioIcon name="fit" /></button>
        </div>

        <div class="previewCanvasInfo"><span>{{ variant === 'A' ? 'KHÔNG GIAN SÁNG TẠO' : 'CANVAS / SCENE BOARD' }}</span><strong>{{ nodes.length }} node · {{ edges.length }} kết nối</strong></div>

        <div class="previewCanvasToolbar" data-map-id="AC.UI02.PREVIEW.TOOLBAR">
          <button type="button" data-map-id="AC.UI02.PREVIEW.ZOOM.OUT" title="Thu nhỏ" aria-label="Thu nhỏ" @click="zoomOut({ duration: 160 })"><StudioIcon name="minus" /></button>
          <span class="previewZoom">{{ zoomLabel }}</span>
          <button type="button" data-map-id="AC.UI02.PREVIEW.ZOOM.IN" title="Phóng to" aria-label="Phóng to" @click="zoomIn({ duration: 160 })"><StudioIcon name="plus" /></button>
          <i aria-hidden="true"></i>
          <button type="button" title="Vừa khung nhìn" aria-label="Vừa khung nhìn" data-map-id="AC.UI02.PREVIEW.FIT" @click="fitSoon"><StudioIcon name="fit" /></button>
          <button type="button" class="previewCreateButton" data-map-id="AC.UI02.PREVIEW.ADD" title="Thêm node" aria-label="Mở bảng thêm node" :aria-expanded="paletteOpen" @click.stop="togglePalette"><StudioIcon name="plus" /><span>Thêm</span></button>
        </div>

        <section v-if="paletteOpen" class="previewPalette" data-map-id="AC.UI02.PREVIEW.PALETTE" role="dialog" aria-label="Chọn loại node" @pointerdown.stop @mousedown.stop @click.stop>
          <div class="paletteTop"><strong>Thêm vào Canvas</strong><button type="button" aria-label="Đóng Palette" data-map-id="AC.UI02.PREVIEW.PALETTE.CLOSE" @click="paletteOpen = false">×</button></div>
          <label class="previewSearch paletteSearch"><StudioIcon name="search" /><input ref="paletteInput" v-model="paletteQuery" type="search" placeholder="Tìm node..." aria-label="Tìm loại node" /></label>
          <p class="previewEyebrow">CÔNG CỤ ĐÃ CÓ</p>
          <button v-for="kind in visibleKinds" :key="kind.id" type="button" class="previewPaletteItem" :data-map-id="'AC.UI02.PREVIEW.ADD.' + kind.id.toUpperCase()" @click="addPreviewNode(kind.id)"><span>{{ kind.icon }}</span><span><strong>{{ kind.label }}</strong><small>{{ kind.description }}</small></span><b aria-hidden="true">+</b></button>
          <p v-if="!visibleKinds.length" class="paletteNoMatch">Không tìm thấy node phù hợp.</p>
        </section>

        <div v-if="previewStatus !== 'normal'" class="previewStateAlert" :class="previewStatus" data-map-id="AC.UI02.PREVIEW.SIMULATED.STATUS" role="alert">
          <span class="stateAlertIcon" aria-hidden="true">!</span><div><small>MÔ PHỎNG GIAO DIỆN · KHÔNG GỌI API</small><p>{{ statusText }}</p></div>
          <button type="button" data-map-id="AC.UI02.PREVIEW.STATUS.DISMISS" @click="previewStatus = 'normal'">Đóng mô phỏng</button>
        </div>
      </div>

      <aside v-if="inspectorOpen && selectedNode" ref="inspectorElement" class="previewInspector" data-map-id="AC.UI02.PREVIEW.INSPECTOR" aria-label="Inspector node">
        <div class="inspectorTop"><span class="previewEyebrow">CHI TIẾT CẢNH QUAY</span><button type="button" title="Đóng Inspector" aria-label="Đóng Inspector" data-map-id="AC.UI02.PREVIEW.INSPECTOR.CLOSE" @click="inspectorOpen = false">×</button></div>
        <div class="inspectorIdentity"><div class="inspectorIcon">{{ selectedNode.type === 'text' ? '✎' : selectedNode.type === 'image' ? '▧' : '▣' }}</div><div><h2>{{ String(selectedNode.data?.title || '') }}</h2><p>{{ selectedNode.type === 'text' ? 'Ý tưởng phân cảnh' : selectedNode.type === 'image' ? 'Khung hình tĩnh' : 'Khung hình động' }}</p></div></div>
        <label class="inspectorPromptLabel" for="design-preview-prompt">Mô tả sáng tạo</label>
        <textarea id="design-preview-prompt" v-model="selectedPrompt" class="inspectorTextarea" rows="7" spellcheck="false" data-map-id="AC.UI02.PREVIEW.INSPECTOR.PROMPT" @wheel.stop></textarea>
        <div class="inspectorMetadata"><span>Đầu vào <strong>{{ edges.filter(edge => edge.target === selectedNodeId).length }}</strong></span><span>Đầu ra <strong>{{ edges.filter(edge => edge.source === selectedNodeId).length }}</strong></span></div>
        <p class="inspectorNote">Thay đổi prompt được đồng bộ ngay trên node trong bản xem trước. Không ghi SQLite.</p>
        <details class="inspectorTechnical"><summary>Thông tin kỹ thuật mẫu</summary><code>{{ selectedNode.id }}</code></details>
        <button type="button" class="inspectorSecondaryButton" data-map-id="AC.UI02.PREVIEW.INSPECTOR.FOOTER.CLOSE" @click="inspectorOpen = false">Đóng bảng chi tiết</button>
      </aside>

      <div v-if="variant === 'B'" class="previewShotStrip" aria-label="Điều hướng các cảnh trong workflow">
        <div class="shotStripTitle"><span>SHOT OVERVIEW</span><strong>{{ nodes.length }} cảnh / node</strong></div>
        <div class="shotStripItems">
          <button v-for="(node, index) in nodes" :key="node.id" type="button" data-map-id="AC.UI02.PREVIEW.SCENE.SELECT" :data-preview-node-id="node.id" :class="{ current: selectedNodeId === node.id }" @click="focusScene(node.id)">
            <img v-if="node.type !== 'text' && mediaMode === 'demo'" :src="String(node.data?.poster || '')" alt="" /><span v-else class="shotTextGlyph" aria-hidden="true">{{ node.type === 'text' ? '✎' : node.type === 'image' ? '▧' : '▣' }}</span>
            <span>0{{ index + 1 }} · {{ String(node.data?.title || '') }}</span>
          </button>
        </div>
      </div>
    </main>

    <dialog ref="deleteDialog" class="previewDialog" aria-labelledby="preview-delete-title" @click="onDialogBackdrop($event, 'delete')">
      <h2 id="preview-delete-title">Xóa {{ deleteKind === 'node' ? 'node' : 'dự án mẫu' }}?</h2><p>Chỉ thay đổi dữ liệu xem trước trong tab hiện tại. Không gửi lệnh xóa đến server.</p>
      <div class="dialogButtons"><button type="button" data-map-id="AC.UI02.PREVIEW.DELETE.CANCEL" @click="deleteDialog?.close()">Hủy</button><button type="button" class="dangerButton" data-map-id="AC.UI02.PREVIEW.DELETE.CONFIRM" @click="confirmDelete">Xác nhận</button></div>
    </dialog>
    <dialog ref="projectDialog" class="previewDialog" aria-labelledby="preview-project-dialog-title" @click="onDialogBackdrop($event, 'project')">
      <h2 id="preview-project-dialog-title">{{ projectDialogMode === 'create' ? 'Tạo dự án mẫu' : 'Đổi tên dự án mẫu' }}</h2><p>Mọi thay đổi trong bản xem trước đều chỉ nằm trong bộ nhớ trình duyệt.</p>
      <label class="dialogField">Tên dự án <input v-model="projectDraft" type="text" maxlength="80" @keydown.enter.prevent="confirmProject" /></label>
      <div class="dialogButtons"><button type="button" data-map-id="AC.UI02.PREVIEW.PROJECT.DIALOG.CANCEL" @click="projectDialog?.close()">Hủy</button><button type="button" class="previewPrimaryButton" data-map-id="AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM" :disabled="!projectDraft.trim()" @click="confirmProject">Xác nhận</button></div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { VueFlow, useVueFlow, type Connection, type Edge, type Node } from "@vue-flow/core";
import StudioIcon from "../components/StudioIcon.vue";
import designPreviewNode from "./designPreviewNode.vue";

type Variant = "A" | "B";
type NodeKind = "text" | "image" | "video";
type LibraryProject = { id: string; name: string; description: string; poster: string; deleted: boolean };
const params = new URLSearchParams(window.location.search);
const variant = ref<Variant>(params.get("designPreview") === "B" ? "B" : "A");
const scenario = ref<"three" | "seven" | "empty">(params.get("scenario") === "seven" ? "seven" : params.get("scenario") === "empty" ? "empty" : "three");
const mediaMode = ref<"demo" | "compact">(params.get("media") === "compact" ? "compact" : "demo");
const screen = ref<"library" | "canvas">(params.get("screen") === "library" ? "library" : "canvas");
const previewStatus = ref<"normal" | "offline" | "save503" | "conflict409">("normal");
const libraryMode = ref<"projects" | "empty">(params.get("empty") === "1" ? "empty" : "projects");
const activeProjectName = ref("Phố đêm · Series 01");
const previewProjects = ref<LibraryProject[]>([
  { id: "preview-project-one", name: "Phố đêm · Series 01", description: "Phim ngắn • Cảnh phố dưới mưa", poster: "/designPreview/streetFrame.svg", deleted: false },
  { id: "preview-project-two", name: "Nhân vật và ánh sáng", description: "Bảng hình ảnh • Chân dung", poster: "/designPreview/portraitFrame.svg", deleted: false },
  { id: "preview-project-three", name: "Đêm neon Tokyo", description: "Chuỗi cảnh • Thiết kế chuyển động", poster: "/designPreview/alleyFrame.svg", deleted: false },
]);
const libraryQuery = ref("");
const trashOpen = ref(false);
const openProjectMenuId = ref("");
const visibleProjects = computed(() => libraryMode.value === "empty" ? [] : previewProjects.value.filter(p => !p.deleted && p.name.toLocaleLowerCase("vi-VN").includes(libraryQuery.value.toLocaleLowerCase("vi-VN"))));
const deletedProjects = computed(() => previewProjects.value.filter(p => p.deleted));
const paletteOpen = ref(false);
const paletteQuery = ref("");
const paletteInput = ref<HTMLInputElement>();
const inspectorOpen = ref(false);
const inspectorElement = ref<HTMLElement>();
const selectedNodeId = ref<string | null>(null);
const deleteDialog = ref<HTMLDialogElement>();
const projectDialog = ref<HTMLDialogElement>();
const deleteKind = ref<"node" | "project">("node");
const deleteTargetId = ref("");
const projectDialogMode = ref<"create" | "rename">("create");
const projectTargetId = ref("");
const projectDraft = ref("");
const nodeTypes = { text: markRaw(designPreviewNode), image: markRaw(designPreviewNode), video: markRaw(designPreviewNode) };
const kinds: { id: NodeKind; label: string; description: string; icon: string }[] = [
  { id: "text", label: "Văn bản", description: "Viết ý tưởng và câu chuyện", icon: "✎" },
  { id: "image", label: "Hình ảnh", description: "Bố cục khung hình sáng tạo", icon: "▧" },
  { id: "video", label: "Video", description: "Cảnh quay và chuyển động", icon: "▣" },
];
const visibleKinds = computed(() => kinds.filter(kind => (kind.label + " " + kind.description + " " + kind.id).toLocaleLowerCase("vi-VN").includes(paletteQuery.value.trim().toLocaleLowerCase("vi-VN"))));
const videoSrc = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm";
const initialNodes: Node[] = [
  { id: "preview-text-01", type: "text", position: { x: 40, y: 190 }, data: { title: "Ý tưởng mở đầu", shot: "CẢNH 01", prompt: "Một người đàn ông bước qua con phố về đêm. Ánh đèn neon phản chiếu trên mặt đường ướt, không gian tĩnh lặng.", demo: true } },
  { id: "preview-image-01", type: "image", position: { x: 390, y: 80 }, data: { title: "Phố đêm dưới mưa", shot: "01", prompt: "Khung hình điện ảnh. Một người cô độc bước dưới đèn đường, màu xanh đêm và cam ấm, ống kính 35mm.", poster: "/designPreview/streetFrame.svg", demo: true } },
  { id: "preview-video-01", type: "video", position: { x: 820, y: 50 }, data: { title: "Chuyển động nhẹ", shot: "01", prompt: "Máy quay dolly chậm, hình ảnh chuyển động tự nhiên. Clip CC0 hoa nở chỉ dùng để thử điều khiển phát video.", poster: "/designPreview/flowerFrame.svg", videoSrc, demo: true } },
  { id: "preview-text-02", type: "text", position: { x: 30, y: 600 }, data: { title: "Phân cảnh thứ hai", shot: "CẢNH 02", prompt: "Máy quay đổi góc nhìn. Giữ nhịp kể chuyện chậm, âm thanh mưa bên ngoài cửa kính.", demo: true } },
  { id: "preview-image-02", type: "image", position: { x: 395, y: 560 }, data: { title: "Chân dung trong đêm", shot: "02", prompt: "Chân dung điện ảnh, ánh sáng ngang gò má, biểu cảm tự nhiên, nền thành phố bokeh.", poster: "/designPreview/portraitFrame.svg", demo: true } },
  { id: "preview-image-03", type: "image", position: { x: 790, y: 560 }, data: { title: "Ngõ neon", shot: "03", prompt: "Con hẻm dưới trời mưa với biển hiệu phản chiếu, độ sâu phối cảnh rõ ràng, màu điện ảnh.", poster: "/designPreview/alleyFrame.svg", demo: true } },
  { id: "preview-video-02", type: "video", position: { x: 1210, y: 540 }, data: { title: "Cảnh thiên nhiên", shot: "02", prompt: "Clip hoa CC0 dùng để thử phát/tạm dừng, không phải video AI sinh ra từ cảnh phố đêm.", poster: "/designPreview/flowerFrame.svg", videoSrc, demo: true } },
];
const initialEdges: Edge[] = [
  { id: "preview-edge-01", source: "preview-text-01", sourceHandle: "output", target: "preview-image-01", targetHandle: "input" },
  { id: "preview-edge-02", source: "preview-image-01", sourceHandle: "output", target: "preview-video-01", targetHandle: "input" },
  { id: "preview-edge-03", source: "preview-text-01", sourceHandle: "output", target: "preview-video-01", targetHandle: "input" },
  { id: "preview-edge-04", source: "preview-text-02", sourceHandle: "output", target: "preview-image-02", targetHandle: "input" },
  { id: "preview-edge-05", source: "preview-image-03", sourceHandle: "output", target: "preview-video-02", targetHandle: "input" },
];
const nodes = shallowRef<Node[]>([]);
const edges = shallowRef<Edge[]>([]);
const viewport = ref({ x: 0, y: 0, zoom: 0.9 });
type PreviewFlowApi = {
  zoomIn: (options?: { duration?: number }) => void;
  zoomOut: (options?: { duration?: number }) => void;
  fitView: (options?: { padding?: number; maxZoom?: number; duration?: number }) => Promise<boolean>;
  getViewport: () => { x: number; y: number; zoom: number };
  setViewport: (viewport: { x: number; y: number; zoom: number }, options?: { duration?: number }) => Promise<boolean>;
  updateNodeData: (id: string, patch: { prompt?: string }) => void;
};
// Vue Flow's deep generic graph types exceed vue-tsc's inference depth in this preview.
// Only the six public methods used here are exposed to the local component.
const { zoomIn, zoomOut, fitView, getViewport, setViewport, updateNodeData } =
  useVueFlow({ id: "design-preview-flow" }) as unknown as PreviewFlowApi;
const zoomLabel = computed(() => Math.round(viewport.value.zoom * 100) + "%");
const selectedNode = computed(() => nodes.value.find(node => node.id === selectedNodeId.value));
const selectedPrompt = computed({
  get: () => String(selectedNode.value?.data?.prompt || ""),
  set: (value: string) => { if (selectedNodeId.value) updateNodeData(selectedNodeId.value, { prompt: value }); },
});
const statusText = computed(() => ({
  normal: "",
  offline: "Máy chủ mất kết nối. Đây chỉ là bản mô phỏng thiết kế trạng thái offline.",
  save503: "Lưu thất bại (503). Bản nháp vẫn đang hiển thị trong bộ nhớ của preview.",
  conflict409: "Xung đột phiên bản (409). Nội dung đang sửa được giữ nguyên để xem cách hiển thị.",
})[previewStatus.value]);

const flowReady = ref(false);
let scenarioVersion = 0;
async function applyScenario() {
  // Fully unmount the previous Vue Flow instance before replacing its graph.
  // Its pending v-model emits can otherwise overwrite edges during empty→populated transitions.
  const version = ++scenarioVersion;
  flowReady.value = false;
  await nextTick();
  if (version !== scenarioVersion) return;
  const count = scenario.value === "empty" ? 0 : scenario.value === "seven" ? 7 : 3;
  const nextNodes = initialNodes.slice(0, count).map(node => ({ ...node, position: { ...node.position }, data: { ...node.data, demo: mediaMode.value === "demo" } }));
  const nodeIds = new Set(nextNodes.map(node => node.id));
  nodes.value = nextNodes;
  edges.value = initialEdges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  selectedNodeId.value = null;
  inspectorOpen.value = false;
  flowReady.value = true;
  fitSoon();
}
function fitSoon() { void nextTick(() => { void fitView({ padding: 0.2, maxZoom: 1.05, duration: 240 }); }); }
function selectVariant(next: Variant) {
  variant.value = next;
  const url = new URL(window.location.href);
  url.searchParams.set("designPreview", next);
  history.replaceState(null, "", url.pathname + url.search);
  fitSoon();
}
function dismissOverlays() { paletteOpen.value = false; openProjectMenuId.value = ""; }
function togglePalette() {
  paletteOpen.value = !paletteOpen.value;
  if (paletteOpen.value) void nextTick(() => paletteInput.value?.focus());
}
function addPreviewNode(kind: NodeKind) {
  const number = nodes.value.length + 1;
  const id = "preview-" + kind + "-added-" + number;
  nodes.value = [...nodes.value, {
    id,
    type: kind,
    position: { x: 160 + (number % 4) * 240, y: 190 + Math.floor(number / 4) * 300 },
    data: { title: kind === "text" ? "Văn bản" : kind === "image" ? "Tạo ảnh" : "Tạo video", shot: "MỚI", prompt: "Nhập ý tưởng cho cảnh mới...", poster: kind === "video" ? "/designPreview/flowerFrame.svg" : "/designPreview/streetFrame.svg", videoSrc, demo: mediaMode.value === "demo" && kind !== "text" },
  }];
  paletteOpen.value = false;
  focusScene(id);
}
function isValidConnection(connection: Connection) {
  if (!connection.source || !connection.target || connection.source === connection.target) return false;
  const source = nodes.value.find(node => node.id === connection.source);
  const target = nodes.value.find(node => node.id === connection.target);
  const allowed = (source?.type === "text" && (target?.type === "image" || target?.type === "video")) || (source?.type === "image" && target?.type === "video");
  return !!allowed && !edges.value.some(edge => edge.source === connection.source && edge.target === connection.target);
}
function onConnect(connection: Connection) {
  if (!isValidConnection(connection)) return;
  edges.value = [...edges.value, { id: "preview-edge-" + Math.random().toString(36).slice(2), source: connection.source, target: connection.target, sourceHandle: "output", targetHandle: "input" }];
}
function onNodeClick(event: { node: Node }) { focusScene(event.node.id, false); }
function onPaneClick() { paletteOpen.value = false; }
function onViewportChange(value: { x: number; y: number; zoom: number }) { viewport.value = { ...value }; }
function focusScene(id: string, inspect = true) {
  selectedNodeId.value = id;
  nodes.value = nodes.value.map(node => ({ ...node, selected: node.id === id }));
  inspectorOpen.value = inspect;
  if (inspect) void nextTick(ensureNodeVisible);
}
function openInspector(id: string) { focusScene(id); }
async function ensureNodeVisible() {
  if (variant.value !== "A" || !inspectorOpen.value || !selectedNodeId.value) return;
  const nodeElement = document.querySelector<HTMLElement>('[data-preview-node="' + selectedNodeId.value + '"]');
  const inspector = inspectorElement.value;
  if (!nodeElement || !inspector) return;
  const nodeRect = nodeElement.getBoundingClientRect(), panelRect = inspector.getBoundingClientRect();
  if (nodeRect.right > panelRect.left - 16 && nodeRect.left < panelRect.right && nodeRect.bottom > panelRect.top && nodeRect.top < panelRect.bottom) {
    const current = getViewport();
    await setViewport({ ...current, x: current.x - (nodeRect.right - panelRect.left + 24) }, { duration: 180 });
  }
}
function requestDelete(kind: "node" | "project", id: string) {
  deleteKind.value = kind;
  deleteTargetId.value = id;
  deleteDialog.value?.showModal();
}
function confirmDelete() {
  if (deleteKind.value === "node") {
    nodes.value = nodes.value.filter(node => node.id !== deleteTargetId.value);
    edges.value = edges.value.filter(edge => edge.source !== deleteTargetId.value && edge.target !== deleteTargetId.value);
    if (selectedNodeId.value === deleteTargetId.value) { selectedNodeId.value = null; inspectorOpen.value = false; }
  } else {
    const target = previewProjects.value.find(project => project.id === deleteTargetId.value);
    if (target) target.deleted = true;
    openProjectMenuId.value = "";
  }
  deleteDialog.value?.close();
}
function openProjectDialog(mode: "create" | "rename", id = "") {
  projectDialogMode.value = mode;
  projectTargetId.value = id;
  projectDraft.value = mode === "rename" ? previewProjects.value.find(project => project.id === id)?.name || "" : "";
  openProjectMenuId.value = "";
  projectDialog.value?.showModal();
}
function confirmProject() {
  const name = projectDraft.value.trim();
  if (!name) return;
  if (projectDialogMode.value === "rename") {
    const target = previewProjects.value.find(project => project.id === projectTargetId.value);
    if (target) target.name = name;
  } else {
    previewProjects.value.unshift({ id: "preview-project-" + Date.now(), name, description: "Dự án xem trước vừa tạo", poster: "/designPreview/streetFrame.svg", deleted: false });
    libraryMode.value = "projects";
    libraryQuery.value = "";
  }
  projectDialog.value?.close();
}
function restoreProject(id: string) { const target = previewProjects.value.find(project => project.id === id); if (target) target.deleted = false; }
function onDialogBackdrop(event: MouseEvent, kind: "delete" | "project") {
  if (event.target !== event.currentTarget) return;
  if (kind === "delete") deleteDialog.value?.close();
  else projectDialog.value?.close();
}
function outsideClick(event: PointerEvent) {
  const element = event.target as Element;
  if (paletteOpen.value && !element.closest(".previewPalette,.previewCreateButton,.dockCreate,.sceneCreate")) paletteOpen.value = false;
  if (openProjectMenuId.value && !element.closest(".projectCardMenu")) openProjectMenuId.value = "";
}
watch(scenario, applyScenario);
watch(mediaMode, () => { nodes.value = nodes.value.map(node => ({ ...node, data: { ...node.data, demo: mediaMode.value === "demo" && node.type !== "text" } })); fitSoon(); });
watch([inspectorOpen, variant, selectedNodeId], () => { void nextTick(ensureNodeVisible); });
onMounted(() => { applyScenario(); document.addEventListener("pointerdown", outsideClick, true); });
onBeforeUnmount(() => document.removeEventListener("pointerdown", outsideClick, true));
</script>

<style src="./designPreview.css"></style>
