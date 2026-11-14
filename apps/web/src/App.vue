<template>
  <div class="studioShell" data-map-id="AC.APP" @keydown.esc="dismissOverlays">
    <header class="topbar" data-map-id="AC.UI.TOPBAR">
      <div class="topbarStart">
        <button type="button" class="brandButton" data-map-id="AC.HOME.PROJECTS" :disabled="isNavigating" title="Về thư viện dự án" @click="goHome"><span class="brandMark">✦</span><strong>AI Canvas <span>Studio</span></strong></button>
        <span class="topbarSeparator"></span>
        <span class="topbarProjectName" :title="activeProject?.name || 'Thư viện dự án'">{{ activeProject?.name || 'Không gian sáng tạo' }}</span>
        <span v-if="activeProject" class="topbarProjectType">CANVAS</span>
      </div>
      <div class="topbarRight">
        <span v-if="activeProject" class="saveStatus" :class="saveState" data-map-id="AC.CANVAS.SAVE.STATUS" role="status"><i></i>{{ saveStateText }}</span>
        <span class="headerConnection" data-map-id="AC.SYSTEM.HEALTH" :title="apiError || 'Kết nối máy chủ SQLite'"><span class="statusDot" :class="apiStatus"></span><span>{{ apiStatus === 'online' ? 'Đã kết nối' : apiStatus === 'checking' ? 'Đang kiểm tra' : 'Mất kết nối' }}</span></span>
        <button type="button" class="topbarIconButton" data-map-id="AC.SYSTEM.HEALTH.RETRY" title="Kiểm tra lại kết nối" aria-label="Kiểm tra lại kết nối" :disabled="apiStatus === 'checking'" @click="retryHealth">↻</button>
        <button v-if="activeProject" type="button" class="saveButton" data-map-id="AC.CANVAS.SAVE" :disabled="isSaving || isHydrating || isNavigating || !hasUnsaved || saveConflict" @click="saveNow">{{ isSaving ? 'Đang lưu...' : saveError ? 'Thử lưu lại' : 'Lưu Canvas' }}</button>
      </div>
    </header>
    <div class="appBody">
      <aside class="sidebar toolRail" data-map-id="AC.UI.LEFT.RAIL" aria-label="Công cụ Studio">
        <button type="button" class="railButton" :class="{active: libraryOpen || !activeProject}" data-map-id="AC.UI.PANEL.TOGGLE" :aria-expanded="libraryOpen || !activeProject" aria-label="Mở hoặc đóng thư viện dự án" title="Thư viện dự án" @click="toggleLibrary"><span class="railSymbol">▦</span></button>
        <button type="button" class="railButton railCreate" data-map-id="AC.HOME.NEW" :disabled="isNavigating" aria-label="Tạo dự án mới" title="Tạo dự án mới" @click="openNewProject"><span class="railSymbol">＋</span></button>
        <span class="railDivider"></span>
        <button type="button" class="railButton" :class="{active: !!activeProject && !libraryOpen}" data-map-id="AC.CANVAS.OPEN" :disabled="!activeProject" aria-label="Canvas hiện tại" :title="activeProject ? 'Đóng bảng và về Canvas' : 'Mở dự án để xem Canvas'" @click="libraryOpen = false"><span class="railSymbol">⌗</span></button>
        <button type="button" class="railButton" disabled title="Kho tài sản — Sắp phát triển" aria-label="Kho tài sản (sắp phát triển)"><span class="railSymbol">▧</span></button>
        <button type="button" class="railButton" disabled title="Storyboard — Sắp phát triển" aria-label="Storyboard (sắp phát triển)"><span class="railSymbol">▤</span></button>
        <button type="button" class="railButton" disabled title="Camera Studio — Sắp phát triển" aria-label="Camera Studio (sắp phát triển)"><span class="railSymbol">◉</span></button>
        <button type="button" class="railButton" disabled title="Hậu kỳ — Sắp phát triển" aria-label="Hậu kỳ (sắp phát triển)"><span class="railSymbol">◷</span></button>
        <button type="button" class="railButton" disabled title="Hàng chờ — Sắp phát triển" aria-label="Hàng chờ (sắp phát triển)"><span class="railSymbol">≡</span></button>
        <div class="railBottom"><button type="button" class="railButton" disabled title="Cài đặt nâng cao — Sắp phát triển" aria-label="Cài đặt (sắp phát triển)"><span class="railSymbol">⚙</span></button></div>
      </aside>

      <main v-if="!activeProject" class="homeMain" data-map-id="AC.HOME">
        <div class="homeHero"><span class="eyebrow">AI CREATIVE WORKSPACE · STUDIO</span><h1>Ý tưởng bắt đầu từ <em>một Canvas.</em></h1><p>Không gian sáng tạo tự do cho hình ảnh, chuyển động và câu chuyện của bạn. Mọi thay đổi được lưu trực tiếp vào dự án.</p></div>
        <ProjectLibrary :projects="projects" :deleted-projects="deletedProjects" :active-project-id="null" :open-project-menu-id="openProjectMenuId" :show-deleted-projects="showDeletedProjects" :is-loading-deleted-projects="isLoadingDeletedProjects" :deleted-projects-error="deletedProjectsError" :busy="isNavigating || isMutatingProject" :format-date="formatDate" @new-project="openNewProject" @open-project="handleOpenProject" @toggle-menu="toggleProjectMenu" @rename="startRenameProject" @delete="startDeleteProject" @toggle-trash="toggleDeletedProjects" @retry-trash="loadDeletedProjects" @restore="restoreProject" />
      </main>

      <main v-else class="canvasMain" data-map-id="AC.CANVAS">
        <div v-if="saveConflict" class="saveAlert" data-map-id="AC.CANVAS.SAVE.CONFLICT"><span>Canvas đã thay đổi ở nơi khác. Bản nháp trên màn hình vẫn được giữ nguyên.</span><button type="button" data-map-id="AC.CANVAS.SAVE.DOWNLOAD" @click="downloadDraft">Tải bản nháp</button><button type="button" data-map-id="AC.CANVAS.SAVE.OVERWRITE" @click="resolveConflict">Xác nhận ghi phiên bản này</button><button type="button" data-map-id="AC.CANVAS.SAVE.RELOAD" @click="reloadServerCanvas">Nạp bản máy chủ</button></div>
        <div v-else-if="saveError" class="saveAlert" data-map-id="AC.CANVAS.SAVE.ERROR"><span>{{ saveError }} — mọi chỉnh sửa vẫn còn trên Canvas.</span><button type="button" data-map-id="AC.CANVAS.SAVE.RETRY" @click="saveNow">Thử lại</button><button type="button" data-map-id="AC.CANVAS.SAVE.DOWNLOAD" @click="downloadDraft">Tải bản nháp</button></div>
        <section class="canvasViewport" :class="{canvasNavigating:isNavigating}" data-map-id="AC.CANVAS.CONNECT">
          <VueFlow :key="activeProject.id" v-model:nodes="nodes" v-model:edges="edges" :node-types="nodeTypes" :default-viewport="initialViewport" :min-zoom="0.2" :max-zoom="2" :delete-key-code="null" :connect-on-click="true" :is-valid-connection="isValidConnection" :fit-view-on-init="false" @connect-start="onConnectStart" @connect-end="onConnectEnd" @click-connect-start="onClickConnectStart" @click-connect-end="onClickConnectEnd" @connect="onConnect" @edge-click="onEdgeClick" @pane-click="handlePaneClick" @node-click="handleNodeClick" @node-drag-stop="onNodeDragStop" @viewport-change="onViewportChange" />
          <div class="canvasTitle" aria-live="polite"><span class="canvasTitleIcon">⌗</span><div><strong>{{ activeProject.name }}</strong><small>{{ nodes.length }} node <span>·</span> {{ edges.length }} kết nối</small></div></div>
          <div class="canvasToolbar" data-map-id="AC.UI.CANVAS.TOOLBAR"><div class="toolbarSurface" data-map-id="AC.CANVAS.TOOLBAR">
            <div class="toolGroup"><button type="button" data-map-id="AC.CANVAS.ZOOM.OUT" aria-label="Thu nhỏ" title="Thu nhỏ" @click="zoomOut">−</button><button type="button" data-map-id="AC.CANVAS.ZOOM.IN" aria-label="Phóng to" title="Phóng to" @click="zoomIn">＋</button><button type="button" data-map-id="AC.CANVAS.FIT" aria-label="Vừa khung nhìn" title="Vừa khung nhìn" @click="fitCanvas">⌗</button></div>
            <span class="toolDivider"></span><div class="addNodeWrap"><button type="button" class="addNodeButton" data-map-id="AC.CANVAS.ADD.NODE" aria-haspopup="dialog" :aria-expanded="showNodeMenu" @click.stop="toggleNodeMenu">＋ <span>Thêm node</span></button><NodePalette v-if="showNodeMenu" @create="handleAddNode" @close="showNodeMenu=false" /></div>
          </div></div>
          <span class="canvasHint">Kéo nền để di chuyển <b>·</b> Lăn chuột để zoom <b>·</b> Kéo cổng để nối node</span>
          <div v-if="!nodes.length" class="canvasEmpty"><span class="emptyCanvasIcon">◇</span><h2>Canvas của bạn đã sẵn sàng</h2><p>Tạo một node để bắt đầu hành trình sáng tạo.</p><button type="button" class="primaryButton" data-map-id="AC.CANVAS.ADD.NODE.EMPTY" @click="showNodeMenu=true">＋ Thêm node đầu tiên</button></div>
          <div v-if="connectionWarning" class="connectionWarning" role="alert" data-map-id="AC.CANVAS.CONNECT.ERROR"><span>{{ connectionWarning }}</span><button type="button" aria-label="Đóng cảnh báo" @click="connectionWarning=''">×</button></div>
          <div v-if="selectedEdgeId" class="edgeAction"><span>Đã chọn kết nối</span><button type="button" data-map-id="AC.CANVAS.EDGE.DELETE" @click="deleteSelectedEdge">Xóa dây</button></div>
          <NodeInspector v-if="selectedNode && !inspectorClosed" :selected-node="selectedNode" :incoming-count="edges.filter(e => e.target === selectedNode?.id).length" :outgoing-count="edges.filter(e => e.source === selectedNode?.id).length" :save-state-text="saveStateText" @close="closeInspector" @update-prompt="updateInspectorPrompt" />
          <div v-if="libraryOpen" class="canvasLibraryDrawer"><div class="drawerHeading"><span>THƯ VIỆN</span><button type="button" aria-label="Đóng thư viện" @click="libraryOpen=false">×</button></div><ProjectLibrary :projects="projects" :deleted-projects="deletedProjects" :active-project-id="activeProject.id" :open-project-menu-id="openProjectMenuId" :show-deleted-projects="showDeletedProjects" :is-loading-deleted-projects="isLoadingDeletedProjects" :deleted-projects-error="deletedProjectsError" :busy="isNavigating || isMutatingProject" :format-date="formatDate" @new-project="openNewProject" @open-project="handleOpenProject" @toggle-menu="toggleProjectMenu" @rename="startRenameProject" @delete="startDeleteProject" @toggle-trash="toggleDeletedProjects" @retry-trash="loadDeletedProjects" @restore="restoreProject" /></div>
        </section>
      </main>
    </div>
    <el-dialog v-model="newProjectVisible" title="Tạo dự án mới" width="420px" :close-on-click-modal="false" data-map-id="AC.HOME.NEW.DIALOG">
      <p class="dialogIntro">Mỗi dự án có Canvas và dữ liệu riêng được lưu trong SQLite.</p>
      <el-input v-model="newProjectName" data-map-id="AC.HOME.NEW.NAME" placeholder="Ví dụ: Storyboard mùa hè" maxlength="100" show-word-limit @keyup.enter="createProject" />
      <template #footer><el-button data-map-id="AC.HOME.NEW.CANCEL" @click="newProjectVisible = false">Hủy</el-button><el-button type="primary" data-map-id="AC.HOME.NEW.CREATE" :loading="isCreatingProject" @click="createProject">Tạo dự án</el-button></template>
    </el-dialog>
    <el-dialog v-model="renameProjectVisible" title="Đổi tên dự án" width="420px" :close-on-click-modal="false" :close-on-press-escape="!isMutatingProject" :show-close="!isMutatingProject" :before-close="beforeCloseRename" data-map-id="AC.HOME.PROJECT.RENAME.DIALOG">
      <p class="dialogIntro">Đổi tên dự án không ảnh hưởng đến Canvas hoặc các node đã lưu.</p>
      <el-input v-model="renameProjectName" data-map-id="AC.HOME.PROJECT.RENAME.NAME" placeholder="Tên dự án" maxlength="100" show-word-limit :disabled="isMutatingProject" @keyup.enter="confirmRenameProject" />
      <p v-if="projectActionError" class="projectActionError" role="alert">{{ projectActionError }}</p>
      <template #footer>
        <el-button data-map-id="AC.HOME.PROJECT.RENAME.CANCEL" :disabled="isMutatingProject" @click="cancelRenameProject">Hủy</el-button>
        <el-button type="primary" data-map-id="AC.HOME.PROJECT.RENAME.CONFIRM" :loading="isMutatingProject" @click="confirmRenameProject">Lưu tên</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="deleteProjectVisible" title="Xóa dự án?" width="420px" :close-on-click-modal="false" :close-on-press-escape="!isMutatingProject" :show-close="!isMutatingProject" :before-close="beforeCloseDelete" data-map-id="AC.HOME.PROJECT.DELETE.DIALOG">
      <p class="dialogIntro">Chuyển <strong>{{ targetProject?.name }}</strong> vào mục Đã xóa. Bạn có thể khôi phục dự án sau này.</p>
      <p v-if="projectActionError" class="projectActionError" role="alert">{{ projectActionError }}</p>
      <template #footer>
        <el-button data-map-id="AC.HOME.PROJECT.DELETE.CANCEL" :disabled="isMutatingProject" @click="cancelDeleteProject">Hủy</el-button>
        <el-button type="danger" data-map-id="AC.HOME.PROJECT.DELETE.CONFIRM" :loading="isMutatingProject" @click="confirmDeleteProject">Xóa dự án</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VueFlow } from '@vue-flow/core';
import ProjectLibrary from './components/ProjectLibrary.vue';
import NodePalette from './components/NodePalette.vue';
import NodeInspector from './components/NodeInspector.vue';
import { useStudioState } from './composables/useStudioState';
import type { CanvasNodeType } from './types/canvas';
const {
  nodeTypes, initialViewport, nodes, edges, projects, activeProject, newProjectVisible,
  deletedProjects, deletedProjectsError, showDeletedProjects, isLoadingDeletedProjects,
  isMutatingProject, openProjectMenuId, renameProjectVisible, renameProjectName,
  deleteProjectVisible, targetProject, projectActionError,
  newProjectName, isCreatingProject, isNavigating, isSaving, isHydrating, showNodeMenu,
  selectedEdgeId, connectionWarning, apiStatus, apiError, saveError, saveConflict, saveState, saveStateText,
  hasUnsaved, openNewProject, toggleNodeMenu, retryHealth, createProject, openProject,
  toggleProjectMenu, startRenameProject, cancelRenameProject, confirmRenameProject,
  beforeCloseRename, startDeleteProject, cancelDeleteProject, confirmDeleteProject,
  beforeCloseDelete, toggleDeletedProjects, loadDeletedProjects, restoreProject,
  goHome, saveNow, resolveConflict, reloadServerCanvas, downloadDraft, addNode,
  isValidConnection, onConnect, onConnectStart, onConnectEnd, onClickConnectStart,
  onClickConnectEnd, onEdgeClick, deleteSelectedEdge, onNodeDragStop,
  onViewportChange, zoomIn, zoomOut, fitCanvas, formatDate,
}=useStudioState();
const libraryOpen=ref(false);
const selectedNodeId=ref<string|null>(null);
const inspectorClosed=ref(false);
const selectedNode=computed(()=>nodes.value.find(n=>n.id===selectedNodeId.value)??null);
watch(()=>activeProject.value?.id,()=>{libraryOpen.value=false;selectedNodeId.value=null;inspectorClosed.value=false;showNodeMenu.value=false;});
function toggleLibrary(){if(!activeProject.value){return;}libraryOpen.value=!libraryOpen.value;showNodeMenu.value=false;}
async function handleOpenProject(id:string){await openProject(id);if(activeProject.value?.id===id) libraryOpen.value=false;}
function handleAddNode(type:CanvasNodeType){addNode(type);showNodeMenu.value=false;}
function handleNodeClick({node}:{node:{id:string}}){selectedNodeId.value=node.id;inspectorClosed.value=false;selectedEdgeId.value='';showNodeMenu.value=false;}
function handlePaneClick(){selectedEdgeId.value='';selectedNodeId.value=null;inspectorClosed.value=false;showNodeMenu.value=false;}
function closeInspector(){inspectorClosed.value=true;}
function updateInspectorPrompt(content:string){const node=selectedNode.value;if(node)node.data.content=content;}
function dismissOverlays(){if(showNodeMenu.value)showNodeMenu.value=false;else if(libraryOpen.value)libraryOpen.value=false;else if(selectedNode.value)closeInspector();}
</script>
<style src="./styles/studio.css"></style>
