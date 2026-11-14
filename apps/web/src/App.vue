<template>
  <div class="studioShell" data-map-id="AC.APP" @keydown.esc="dismissOverlays">
    <header class="topbar" data-map-id="AC.UI.TOPBAR">
      <div class="topbarStart">
        <button class="brandButton" type="button" data-map-id="AC.HOME.PROJECTS" title="Trở về thư viện" :disabled="isNavigating" @click="goHome"><span class="brandMark"><StudioIcon name="layers" /></span><strong>FRAME<span>SPACE</span></strong></button>
        <span class="topbarSeparator"></span>
        <span class="topbarProjectName" :title="activeProject?.name || 'Thư viện dự án'">{{ activeProject?.name || 'Thư viện dự án' }}</span>
      </div>
      <div class="topbarRight">
        <span v-if="activeProject" class="saveStatus" :class="saveState" data-map-id="AC.CANVAS.SAVE.STATUS" role="status"><i></i>{{ saveStateText }}</span>
        <span class="headerConnection" data-map-id="AC.SYSTEM.HEALTH" :title="apiError || 'Kết nối máy chủ SQLite'"><span class="statusDot" :class="apiStatus"></span><span>{{ apiStatus === 'online' ? 'Đã kết nối' : apiStatus === 'checking' ? 'Đang kiểm tra' : 'Mất kết nối' }}</span></span>
        <button type="button" class="topbarIconButton" data-map-id="AC.SYSTEM.HEALTH.RETRY" title="Kiểm tra kết nối" aria-label="Kiểm tra lại kết nối" :disabled="apiStatus === 'checking'" @click="retryHealth"><StudioIcon name="refresh" /></button>
        <button v-if="activeProject" type="button" class="saveButton" data-map-id="AC.CANVAS.SAVE" :disabled="isSaving || isHydrating || isNavigating || !hasUnsaved || saveConflict" @click="saveNow">{{ isSaving ? 'Đang lưu...' : saveError ? 'Thử lưu lại' : 'Lưu' }}</button>
      </div>
    </header>
    <div class="appBody">
      <aside class="sidebar toolRail" data-map-id="AC.UI.LEFT.RAIL" aria-label="Công cụ Studio">
        <div class="railActiveActions">
          <button type="button" class="railButton railCreate" data-map-id="AC.HOME.NEW" :disabled="isNavigating" aria-label="Tạo dự án mới" title="Tạo dự án mới" @click="openNewProject"><StudioIcon name="plus" /></button>
          <span class="railDivider"></span>
          <button type="button" class="railButton" :class="{active: libraryOpen || !activeProject}" data-map-id="AC.UI.PANEL.TOGGLE" :aria-expanded="libraryOpen || !activeProject" aria-label="Mở hoặc đóng thư viện dự án" title="Thư viện dự án" @click="toggleLibrary"><StudioIcon name="projects" /></button>
          <button type="button" class="railButton" :class="{active: !!activeProject && !libraryOpen}" data-map-id="AC.CANVAS.OPEN" :disabled="!activeProject" aria-label="Canvas hiện tại" title="Canvas hiện tại" @click="libraryOpen = false"><StudioIcon name="canvas" /></button>
        </div>
        <div class="railBottom">
          <button type="button" class="railButton" data-map-id="AC.UI.ROADMAP.TOGGLE" :aria-expanded="roadmapOpen" title="Tính năng sắp phát triển" aria-label="Xem các tính năng sắp phát triển" @click="roadmapOpen = !roadmapOpen"><StudioIcon name="more" /></button>
          <div v-if="roadmapOpen" class="roadmapPopover" data-map-id="AC.UI.ROADMAP" role="note"><strong>Sắp phát triển</strong><p>Kho tài sản · Storyboard · Camera Studio · Hậu kỳ · Hàng chờ</p><small>Hiện chưa có các chức năng này.</small></div>
        </div>
      </aside>

      <main v-if="!activeProject" class="homeMain" data-map-id="AC.HOME">
        <ProjectLibrary :projects="projects" :deleted-projects="deletedProjects" :active-project-id="null" :open-project-menu-id="openProjectMenuId" :show-deleted-projects="showDeletedProjects" :is-loading-deleted-projects="isLoadingDeletedProjects" :deleted-projects-error="deletedProjectsError" :busy="isNavigating || isMutatingProject" :format-date="formatDate" @new-project="openNewProject" @open-project="handleOpenProject" @toggle-menu="toggleProjectMenu" @rename="startRenameProject" @delete="startDeleteProject" @toggle-trash="toggleDeletedProjects" @retry-trash="loadDeletedProjects" @restore="restoreProject" />
      </main>

      <main v-else class="canvasMain" data-map-id="AC.CANVAS">
        <div v-if="saveConflict" class="saveAlert" data-map-id="AC.CANVAS.SAVE.CONFLICT"><span>Canvas đã thay đổi ở nơi khác. Bản nháp trên màn hình vẫn được giữ nguyên.</span><button type="button" data-map-id="AC.CANVAS.SAVE.DOWNLOAD" @click="downloadDraft">Tải bản nháp</button><button type="button" data-map-id="AC.CANVAS.SAVE.OVERWRITE" @click="resolveConflict">Xác nhận ghi phiên bản này</button><button type="button" data-map-id="AC.CANVAS.SAVE.RELOAD" @click="reloadServerCanvas">Nạp bản máy chủ</button></div>
        <div v-else-if="saveError" class="saveAlert" data-map-id="AC.CANVAS.SAVE.ERROR"><span>{{ saveError }} — mọi chỉnh sửa vẫn còn trên Canvas.</span><button type="button" data-map-id="AC.CANVAS.SAVE.RETRY" @click="saveNow">Thử lại</button><button type="button" data-map-id="AC.CANVAS.SAVE.DOWNLOAD" @click="downloadDraft">Tải bản nháp</button></div>
        <section class="canvasViewport" :class="{canvasNavigating:isNavigating}" data-map-id="AC.CANVAS.CONNECT">
          <div class="canvasStage" data-map-id="AC.UI.CANVAS.STAGE">
          <VueFlow :key="activeProject.id" v-model:nodes="nodes" v-model:edges="edges" :node-types="nodeTypes" :default-viewport="initialViewport" :min-zoom="0.2" :max-zoom="2" :delete-key-code="null" :connect-on-click="true" :is-valid-connection="isValidConnection" :fit-view-on-init="false" @connect-start="onConnectStart" @connect-end="onConnectEnd" @click-connect-start="onClickConnectStart" @click-connect-end="onClickConnectEnd" @connect="onConnect" @edge-click="onEdgeClick" @pane-click="handlePaneClick" @node-click="handleNodeClick" @node-drag-stop="onNodeDragStop" @viewport-change="onViewportChange" />
          <div v-if="nodes.length" class="canvasMeta" aria-live="polite"><span class="canvasMetaDot"></span>{{ nodes.length }} node <span class="canvasMetaSep">/</span> {{ edges.length }} dây nối</div>
          <div class="canvasToolbar" data-map-id="AC.UI.CANVAS.TOOLBAR"><div class="toolbarSurface" data-map-id="AC.CANVAS.TOOLBAR">
            <div class="toolGroup"><button type="button" data-map-id="AC.CANVAS.ZOOM.OUT" aria-label="Thu nhỏ" title="Thu nhỏ" @click="zoomOut"><StudioIcon name="minus" /></button><button type="button" data-map-id="AC.CANVAS.ZOOM.IN" aria-label="Phóng to" title="Phóng to" @click="zoomIn"><StudioIcon name="plus" /></button><button type="button" data-map-id="AC.CANVAS.FIT" aria-label="Vừa khung nhìn" title="Vừa khung nhìn" @click="fitCanvas"><StudioIcon name="fit" /></button></div>
            <span class="toolDivider"></span><div class="addNodeWrap"><button type="button" class="addNodeButton" data-map-id="AC.CANVAS.ADD.NODE" aria-label="Thêm node" title="Thêm node vào Canvas" aria-haspopup="dialog" :aria-expanded="showNodeMenu" @click.stop="toggleNodeMenu"><StudioIcon name="plus" /><span>Thêm</span></button><NodePalette v-if="showNodeMenu" @create="handleAddNode" @close="showNodeMenu=false" /></div>
          </div></div>
          <div v-if="!nodes.length" class="canvasEmpty"><span class="emptyCanvasIcon"><StudioIcon name="layers" /></span><h2>Một Canvas, mọi ý tưởng.</h2><p>Bắt đầu với văn bản, hình ảnh hoặc video.</p><button type="button" class="primaryButton" data-map-id="AC.CANVAS.ADD.NODE.EMPTY" @click="showNodeMenu=true"><StudioIcon name="plus" /> Thêm node đầu tiên</button></div>
          <div v-if="connectionWarning" class="connectionWarning" role="alert" data-map-id="AC.CANVAS.CONNECT.ERROR"><span>{{ connectionWarning }}</span><button type="button" aria-label="Đóng cảnh báo" @click="connectionWarning=''">×</button></div>
          <div v-if="selectedEdgeId" class="edgeAction"><span>Đã chọn kết nối</span><button type="button" data-map-id="AC.CANVAS.EDGE.DELETE" @click="deleteSelectedEdge">Xóa dây</button></div>
          </div><!-- canvasStage: Inspector is a sibling, never overlays workflow nodes -->
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
import { computed, nextTick, ref, watch } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import ProjectLibrary from './components/ProjectLibrary.vue';
import NodePalette from './components/NodePalette.vue';
import NodeInspector from './components/NodeInspector.vue';
import StudioIcon from './components/StudioIcon.vue';
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
const { getViewport, setViewport } = useVueFlow();
const libraryOpen=ref(false);
const roadmapOpen=ref(false);
const selectedNodeId=ref<string|null>(null);
const inspectorClosed=ref(false);
const selectedNode=computed(()=>nodes.value.find(n=>n.id===selectedNodeId.value)??null);
watch(()=>activeProject.value?.id,()=>{libraryOpen.value=false;selectedNodeId.value=null;inspectorClosed.value=false;showNodeMenu.value=false;});
function toggleLibrary(){if(!activeProject.value){return;}libraryOpen.value=!libraryOpen.value;showNodeMenu.value=false;}
async function handleOpenProject(id:string){await openProject(id);if(activeProject.value?.id===id) libraryOpen.value=false;}
function handleAddNode(type:CanvasNodeType){addNode(type);showNodeMenu.value=false;}
async function handleNodeClick({node}:{node:{id:string}}){
  selectedNodeId.value=node.id;
  inspectorClosed.value=false;
  selectedEdgeId.value='';
  showNodeMenu.value=false;
  // A reserved Inspector must never crop the node being edited. Adjust only
  // the visible Vue Flow viewport when needed; stored node coordinates remain unchanged.
  await nextTick();
  requestAnimationFrame(()=>{
    const stage=document.querySelector<HTMLElement>('.canvasStage');
    const selected=Array.from(stage?.querySelectorAll<HTMLElement>('.studioNode') ?? [])
      .find(element=>element.dataset.nodeId===node.id);
    if(!stage||!selected||inspectorClosed.value||selectedNodeId.value!==node.id) return;
    const bounds=stage.getBoundingClientRect();
    const rect=selected.getBoundingClientRect();
    const margin=30;
    let dx=0,dy=0;
    if(rect.right>bounds.right-margin) dx=bounds.right-margin-rect.right;
    else if(rect.left<bounds.left+margin) dx=bounds.left+margin-rect.left;
    if(rect.bottom>bounds.bottom-margin) dy=bounds.bottom-margin-rect.bottom;
    else if(rect.top<bounds.top+margin) dy=bounds.top+margin-rect.top;
    if(Math.abs(dx)>2||Math.abs(dy)>2){
      const current=getViewport();
      void setViewport({x:current.x+dx,y:current.y+dy,zoom:current.zoom},{duration:180});
    }
  });
}
function handlePaneClick(){selectedEdgeId.value='';selectedNodeId.value=null;inspectorClosed.value=false;showNodeMenu.value=false;}
function closeInspector(){inspectorClosed.value=true;}
function updateInspectorPrompt(content:string){const node=selectedNode.value;if(node)node.data.content=content;}
function dismissOverlays(){if(showNodeMenu.value)showNodeMenu.value=false;else if(roadmapOpen.value)roadmapOpen.value=false;else if(libraryOpen.value)libraryOpen.value=false;else if(selectedNode.value)closeInspector();}
</script>
<style src="./styles/studio.css"></style>
<style src="./styles/studio-ui02.css"></style>
