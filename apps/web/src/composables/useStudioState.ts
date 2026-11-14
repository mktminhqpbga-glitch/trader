import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useVueFlow, type Connection, type EdgeMouseEvent } from "@vue-flow/core";
import StudioNode from "../components/StudioNode.vue";
import type {
  CanvasEdge, CanvasNode, CanvasNodeData, CanvasNodeType, CanvasResponse,
  CanvasState, ProjectListResponse, ProjectMutationResponse, ProjectResponse, ProjectSummary,
} from "../types/canvas";

type CanvasPayload = Pick<CanvasState, "nodes" | "edges" | "viewport">;

class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options, headers: { "content-type": "application/json", ...(options.headers ?? {}) }, cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new ApiError(body.message ?? `Máy chủ phản hồi HTTP ${response.status}`, response.status);
  return body as T;
}

function checkRevision(canvas: CanvasState) {
  if (!Number.isSafeInteger(canvas.revision) || canvas.revision < 0) {
    throw new Error("Máy chủ không cung cấp revision hợp lệ để bảo vệ dữ liệu");
  }
}

export function useStudioState() {
  const nodeTypes = { text: markRaw(StudioNode), image: markRaw(StudioNode), video: markRaw(StudioNode) };
  const initialViewport = { x: 0, y: 0, zoom: 1 };
  const nodeMeta: Record<CanvasNodeType, CanvasNodeData> = {
    text: { label: "Text Node", icon: "Ab", content: "" },
    image: { label: "Image Node", icon: "▧", content: "" },
    video: { label: "Video Node", icon: "▶", content: "" },
  };
  const nodes = ref<CanvasNode[]>([]);
  const edges = ref<CanvasEdge[]>([]);
  const { viewport, setViewport, zoomIn: flowZoomIn, zoomOut: flowZoomOut, fitView, screenToFlowCoordinate } = useVueFlow();
  const projects = ref<ProjectSummary[]>([]);
  const deletedProjects = ref<ProjectSummary[]>([]);
  const showDeletedProjects = ref(false);
  const isLoadingDeletedProjects = ref(false);
  const deletedProjectsError = ref("");
  const isMutatingProject = ref(false);
  const openProjectMenuId = ref<string | null>(null);
  const renameProjectVisible = ref(false);
  const renameProjectName = ref("");
  const deleteProjectVisible = ref(false);
  const targetProject = ref<ProjectSummary | null>(null);
  const projectActionError = ref("");
  const activeProject = ref<ProjectSummary | null>(null);
  const newProjectVisible = ref(false);
  const newProjectName = ref("");
  const isCreatingProject = ref(false);
  const isNavigating = ref(false);
  const isSaving = ref(false);
  const isHydrating = ref(false);
  const showNodeMenu = ref(false);
  const selectedEdgeId = ref("");
  const connectionWarning = ref("");
  const apiStatus = ref<"online" | "offline" | "checking">("offline");
  const apiError = ref("");
  const saveError = ref("");
  const saveConflict = ref(false);
  const lastSaved = ref("");
  const revision = ref<number | null>(null);
  const lastAckSignature = ref<string | null>(null);
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let healthTimer: ReturnType<typeof setInterval> | undefined;
  let pendingSave: Promise<boolean> | null = null;
  let activeProjectListVersion = 0;
  let deletedProjectListVersion = 0;
  type ConnectionOrigin = { nodeId: string; handleId: string | null; handleType: "source" | "target"; x: number; y: number };
  let dragOrigin: ConnectionOrigin | null = null;
  let clickOrigin: ConnectionOrigin | null = null;
  let connectionCompleted = false;

  // Ignore Vue Flow's transient selection, dimensions and dragging flags.
  function canvasPayload(): CanvasPayload {
    return {
      nodes: nodes.value.map((node) => ({
        id: node.id,
        type: node.type,
        position: { x: node.position.x, y: node.position.y },
        data: { ...nodeMeta[node.type], content: node.data.content },
      })),
      edges: edges.value.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
      })),
      viewport: { x: viewport.value.x, y: viewport.value.y, zoom: viewport.value.zoom },
    };
  }
  function canvasSignature() { return JSON.stringify(canvasPayload()); }
  const hasUnsaved = computed(() =>
    !!activeProject.value && lastAckSignature.value !== null && canvasSignature() !== lastAckSignature.value);
  const saveState = computed(() => {
    if (saveConflict.value) return "conflict";
    if (saveError.value) return "error";
    if (isSaving.value) return "saving";
    if (hasUnsaved.value) return "dirty";
    return lastAckSignature.value === null ? "idle" : "saved";
  });
  const saveStateText = computed(() => {
    if (saveState.value === "conflict") return "Xung đột phiên bản";
    if (saveState.value === "error") return "Chưa lưu được";
    if (saveState.value === "saving") return "Đang lưu...";
    if (saveState.value === "dirty") return "Có thay đổi chưa lưu";
    if (saveState.value === "saved") return lastSaved.value ? `Đã lưu ${lastSaved.value}` : "Đã đồng bộ";
    return "Đang tải Canvas...";
  });

  function clearSaveTimer() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = undefined;
  }
  async function loadProjects() {
    const version = activeProjectListVersion;
    const result = await request<ProjectListResponse>("/api/projects");
    if (version === activeProjectListVersion && !isMutatingProject.value) projects.value = result.projects;
  }
  async function loadDeletedProjects() {
    if (isLoadingDeletedProjects.value) return;
    const version = ++deletedProjectListVersion;
    isLoadingDeletedProjects.value = true;
    deletedProjectsError.value = "";
    try {
      const response = await request<ProjectListResponse>("/api/projects?status=deleted");
      if (version === deletedProjectListVersion) deletedProjects.value = response.projects;
    } catch (error) {
      if (version === deletedProjectListVersion) {
        deletedProjectsError.value = error instanceof Error ? error.message : "Không tải được dự án đã xóa";
      }
    } finally {
      isLoadingDeletedProjects.value = false;
    }
  }
  async function toggleDeletedProjects() {
    if (isNavigating.value || isMutatingProject.value) return;
    showDeletedProjects.value = !showDeletedProjects.value;
    openProjectMenuId.value = null;
    if (showDeletedProjects.value) await loadDeletedProjects();
  }
  function toggleProjectMenu(projectId: string) {
    if (isNavigating.value || isMutatingProject.value) return;
    openProjectMenuId.value = openProjectMenuId.value === projectId ? null : projectId;
  }
  function startRenameProject(project: ProjectSummary) {
    if (isMutatingProject.value || isNavigating.value) return;
    openProjectMenuId.value = null;
    targetProject.value = project;
    renameProjectName.value = project.name;
    projectActionError.value = "";
    renameProjectVisible.value = true;
  }
  function cancelRenameProject() {
    if (isMutatingProject.value) return;
    renameProjectVisible.value = false;
    targetProject.value = null;
    projectActionError.value = "";
  }
  function beforeCloseRename(done: () => void) {
    if (isMutatingProject.value) return;
    cancelRenameProject();
    done();
  }
  function startDeleteProject(project: ProjectSummary) {
    if (isMutatingProject.value || isNavigating.value) return;
    openProjectMenuId.value = null;
    targetProject.value = project;
    projectActionError.value = "";
    deleteProjectVisible.value = true;
  }
  function cancelDeleteProject() {
    if (isMutatingProject.value) return;
    deleteProjectVisible.value = false;
    targetProject.value = null;
    projectActionError.value = "";
  }
  function beforeCloseDelete(done: () => void) {
    if (isMutatingProject.value) return;
    cancelDeleteProject();
    done();
  }
  function updateConfirmedProject(project: ProjectSummary) {
    projects.value = projects.value.map((item) => item.id === project.id ? project : item)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (activeProject.value?.id === project.id) activeProject.value = project;
  }
  function displayMutationError(error: unknown) {
    projectActionError.value = error instanceof Error ? error.message : "Thao tác dự án thất bại";
    ElMessage.error(projectActionError.value);
  }
  async function flushCanvasBeforeProjectMutation(): Promise<boolean> {
    // Even an operation on another project's card pauses this Canvas while
    // pending. Flush first so a debounce firing during the operation cannot
    // silently abandon the current project's unsaved edits.
    if (!activeProject.value) return true;
    if (await flushSave()) return true;
    projectActionError.value = "Canvas đang có thay đổi chưa lưu. Hãy lưu lại hoặc xử lý lỗi lưu trước khi tiếp tục.";
    ElMessage.warning(projectActionError.value);
    return false;
  }
  async function confirmRenameProject() {
    const target = targetProject.value;
    if (!target || !renameProjectVisible.value || isMutatingProject.value || isNavigating.value) return;
    const name = renameProjectName.value.trim();
    if (!name || name.length > 100) {
      projectActionError.value = "Tên dự án phải dài từ 1 đến 100 ký tự.";
      return;
    }
    if (name === target.name) { cancelRenameProject(); return; }
    projectActionError.value = "";
    isMutatingProject.value = true;
    isNavigating.value = true;
    activeProjectListVersion++;
    try {
      if (!(await flushCanvasBeforeProjectMutation())) return;
      const response = await request<ProjectMutationResponse>(`/api/projects/${encodeURIComponent(target.id)}`, {
        method: "PATCH", body: JSON.stringify({ name }),
      });
      if (!response.ok || response.project?.id !== target.id || response.project.name !== name) {
        throw new Error("Máy chủ chưa xác nhận tên dự án mới");
      }
      activeProjectListVersion++;
      updateConfirmedProject(response.project);
      renameProjectVisible.value = false;
      targetProject.value = null;
      ElMessage.success("Đã đổi tên dự án");
    } catch (error) {
      displayMutationError(error);
    } finally {
      isMutatingProject.value = false;
      isNavigating.value = false;
    }
  }
  function clearCurrentCanvas() {
    clearSaveTimer();
    activeProject.value = null;
    revision.value = null;
    lastAckSignature.value = null;
    lastSaved.value = "";
    showNodeMenu.value = false;
    selectedEdgeId.value = "";
    connectionWarning.value = "";
    saveError.value = "";
    saveConflict.value = false;
    nodes.value = [];
    edges.value = [];
  }
  async function confirmDeleteProject() {
    const target = targetProject.value;
    if (!target || !deleteProjectVisible.value || isMutatingProject.value || isNavigating.value) return;
    projectActionError.value = "";
    isMutatingProject.value = true;
    isNavigating.value = true;
    activeProjectListVersion++;
    try {
      if (!(await flushCanvasBeforeProjectMutation())) return;
      const response = await request<ProjectMutationResponse>(`/api/projects/${encodeURIComponent(target.id)}`, { method: "DELETE" });
      if (!response.ok || response.project?.id !== target.id || !response.project.deletedAt) {
        throw new Error("Máy chủ chưa xác nhận đã xóa dự án");
      }
      activeProjectListVersion++;
      deletedProjectListVersion++;
      projects.value = projects.value.filter((project) => project.id !== target.id);
      deletedProjectsError.value = "";
      deletedProjects.value = [response.project, ...deletedProjects.value.filter((project) => project.id !== target.id)];
      if (activeProject.value?.id === target.id) clearCurrentCanvas();
      deleteProjectVisible.value = false;
      targetProject.value = null;
      ElMessage.success("Đã chuyển dự án vào mục Đã xóa");
    } catch (error) {
      displayMutationError(error);
    } finally {
      isMutatingProject.value = false;
      isNavigating.value = false;
    }
  }
  async function restoreProject(projectId: string) {
    if (isMutatingProject.value || isNavigating.value || isLoadingDeletedProjects.value) return;
    isMutatingProject.value = true;
    isNavigating.value = true;
    deletedProjectsError.value = "";
    activeProjectListVersion++;
    deletedProjectListVersion++;
    try {
      if (!(await flushCanvasBeforeProjectMutation())) {
        deletedProjectsError.value = projectActionError.value;
        return;
      }
      const response = await request<ProjectMutationResponse>(`/api/projects/${encodeURIComponent(projectId)}/restore`, {
        method: "POST",
      });
      if (!response.ok || response.project?.id !== projectId || response.project.deletedAt !== null) {
        throw new Error("Máy chủ chưa xác nhận khôi phục dự án");
      }
      activeProjectListVersion++;
      deletedProjectListVersion++;
      deletedProjects.value = deletedProjects.value.filter((project) => project.id !== projectId);
      projects.value = [response.project, ...projects.value.filter((project) => project.id !== projectId)]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      ElMessage.success("Đã khôi phục dự án");
    } catch (error) {
      deletedProjectsError.value = error instanceof Error ? error.message : "Khôi phục dự án thất bại";
      ElMessage.error(deletedProjectsError.value);
    } finally {
      isMutatingProject.value = false;
      isNavigating.value = false;
    }
  }
  async function retryHealth() {
    if (apiStatus.value === "checking") return;
    apiStatus.value = "checking";
    try {
      const health = await request<{ ok: boolean; database: string }>("/api/health");
      if (!health.ok || health.database !== "connected") throw new Error("SQLite chưa sẵn sàng");
      apiStatus.value = "online";
      apiError.value = "";
      await loadProjects();
    } catch (error) {
      apiError.value = error instanceof Error ? error.message : "Không kết nối được Backend";
      apiStatus.value = "offline";
    }
  }
  function openNewProject() {
    if (isNavigating.value) return;
    newProjectName.value = "";
    newProjectVisible.value = true;
    showNodeMenu.value = false;
  }
  function toggleNodeMenu() { if (!isNavigating.value) showNodeMenu.value = !showNodeMenu.value; }

  // Keep a frozen snapshot and an exact revision per request. While one PUT
  // is awaiting ACK, subsequent changes remain dirty until the next PUT.
  async function persistSnapshot(): Promise<boolean> {
    const projectId = activeProject.value?.id;
    const expectedRevision = revision.value;
    if (!projectId || expectedRevision === null || saveConflict.value || isHydrating.value) return false;
    const payload = canvasPayload();
    const signature = JSON.stringify(payload);
    isSaving.value = true;
    const operation = (async () => {
      try {
        const result = await request<ProjectResponse>(`/api/projects/${encodeURIComponent(projectId)}/canvas`, {
          method: "PUT", body: JSON.stringify({ ...payload, revision: expectedRevision }),
        });
        checkRevision(result.canvas);
        if (activeProject.value?.id !== projectId) return false;
        revision.value = result.canvas.revision;
        lastAckSignature.value = signature;
        lastSaved.value = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        activeProject.value = result.project;
        projects.value = projects.value.map((project) => project.id === projectId ? result.project : project)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        apiStatus.value = "online";
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          saveConflict.value = true;
        } else {
          saveError.value = error instanceof Error ? error.message : "Không lưu được Canvas";
          if (!(error instanceof ApiError) || error.status >= 500) apiStatus.value = "offline";
        }
        return false;
      } finally {
        isSaving.value = false;
        pendingSave = null;
      }
    })();
    pendingSave = operation;
    return operation;
  }
  async function flushSave(): Promise<boolean> {
    clearSaveTimer();
    if (!activeProject.value || isHydrating.value) return !activeProject.value;
    if (revision.value === null || saveError.value || saveConflict.value) return false;
    while (hasUnsaved.value || pendingSave) {
      if (saveError.value || saveConflict.value) return false;
      const succeeded = await (pendingSave ?? persistSnapshot());
      if (!succeeded) return false;
    }
    return true;
  }
  async function saveNow(): Promise<boolean> {
    if (saveConflict.value) return false;
    saveError.value = "";
    const saved = await flushSave();
    if (!saved && !saveConflict.value) ElMessage.error(saveError.value || "Chưa lưu được Canvas, bản nháp vẫn ở đây");
    return saved;
  }
  function scheduleSave() {
    if (isHydrating.value || isNavigating.value || !activeProject.value || lastAckSignature.value === null) return;
    clearSaveTimer();
    if (!hasUnsaved.value || saveError.value || saveConflict.value) return;
    saveTimer = setTimeout(() => { void flushSave(); }, 700);
  }

  async function hydrateProject(projectId: string) {
    const url = `/api/projects/${encodeURIComponent(projectId)}`;
    const [projectResult, canvasResult] = await Promise.all([
      request<ProjectResponse>(url),
      request<CanvasResponse>(`${url}/canvas`),
    ]);
    checkRevision(canvasResult.canvas);
    isHydrating.value = true;
    clearSaveTimer();
    try {
      activeProject.value = projectResult.project;
      nodes.value = canvasResult.canvas.nodes.map((node) => ({
        ...node, data: { ...nodeMeta[node.type], ...node.data }, dragHandle: ".node-drag-handle",
      }));
      edges.value = canvasResult.canvas.edges.map((edge) => ({ ...edge, type: "smoothstep" }));
      revision.value = canvasResult.canvas.revision;
      selectedEdgeId.value = "";
      connectionWarning.value = "";
      showNodeMenu.value = false;
      saveError.value = "";
      saveConflict.value = false;
      lastAckSignature.value = null;
      await nextTick();
      await setViewport(canvasResult.canvas.viewport);
      await nextTick();
      lastAckSignature.value = canvasSignature();
      lastSaved.value = "";
    } finally {
      isHydrating.value = false;
    }
  }
  async function openProject(projectId: string) {
    if (isNavigating.value || isMutatingProject.value || activeProject.value?.id === projectId) return;
    openProjectMenuId.value = null;
    isNavigating.value = true;
    try {
      if (activeProject.value && !(await flushSave())) {
        ElMessage.warning("Chưa thể chuyển dự án. Hãy lưu hoặc xử lý xung đột trước.");
        return;
      }
      await hydrateProject(projectId);
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : "Không thể mở dự án");
    } finally {
      isNavigating.value = false;
    }
  }
  async function goHome() {
    if (isNavigating.value || isMutatingProject.value) return;
    isNavigating.value = true;
    try {
      if (activeProject.value && !(await flushSave())) {
        ElMessage.warning("Canvas chưa lưu. Hãy thử lưu lại hoặc tải bản nháp trước khi rời dự án.");
        return;
      }
      openProjectMenuId.value = null;
      clearCurrentCanvas();
    } finally {
      isNavigating.value = false;
    }
  }
  async function createProject() {
    const name = newProjectName.value.trim();
    if (!name) { ElMessage.warning("Hãy nhập tên dự án"); return; }
    if (isCreatingProject.value || isNavigating.value || isMutatingProject.value) return;
    isCreatingProject.value = true;
    try {
      if (activeProject.value && !(await saveNow())) return;
      const result = await request<ProjectResponse>("/api/projects", {
        method: "POST", body: JSON.stringify({ name }),
      });
      activeProjectListVersion++;
      projects.value = [result.project, ...projects.value];
      newProjectVisible.value = false;
      await openProject(result.project.id);
      ElMessage.success("Đã tạo dự án mới");
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : "Không thể tạo dự án");
    } finally {
      isCreatingProject.value = false;
    }
  }
  async function resolveConflict() {
    if (!activeProject.value || !saveConflict.value) return;
    try {
      await ElMessageBox.confirm(
        "Phiên bản trên máy chủ đã thay đổi. Ghi phiên bản trên màn hình sẽ thay thế các thay đổi đó. Bạn có thể tải bản nháp trước khi tiếp tục.",
        "Ghi phiên bản trên màn hình?",
        { type: "warning", confirmButtonText: "Ghi phiên bản của tôi", cancelButtonText: "Hủy" },
      );
      const response = await request<CanvasResponse>(`/api/projects/${encodeURIComponent(activeProject.value.id)}/canvas`);
      checkRevision(response.canvas);
      revision.value = response.canvas.revision;
      saveConflict.value = false;
      await saveNow();
    } catch (error) {
      if (error !== "cancel" && error !== "close") ElMessage.error(error instanceof Error ? error.message : "Không thể xử lý xung đột");
    }
  }
  async function reloadServerCanvas() {
    if (!activeProject.value) return;
    try {
      await ElMessageBox.confirm(
        "Mọi thay đổi chưa lưu trên màn hình sẽ bị bỏ. Hãy chọn ‘Tải bản nháp’ trước nếu muốn giữ lại.",
        "Nạp Canvas từ máy chủ?",
        { type: "warning", confirmButtonText: "Nạp lại", cancelButtonText: "Hủy" },
      );
      await hydrateProject(activeProject.value.id);
    } catch (error) {
      if (error !== "cancel" && error !== "close") ElMessage.error(error instanceof Error ? error.message : "Không tải được Canvas");
    }
  }
  function downloadDraft() {
    if (!activeProject.value) return;
    const draft = {
      project: activeProject.value,
      canvas: { ...canvasPayload(), revision: revision.value },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `canvas-draft-${activeProject.value.id}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function addNode(type: CanvasNodeType) {
    if (!activeProject.value || isNavigating.value) return;
    const canvas = document.querySelector(".canvasViewport") as HTMLElement | null;
    const bounds = canvas?.getBoundingClientRect();
    const center = bounds
      ? screenToFlowCoordinate({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })
      : { x: 300, y: 220 };
    const index = nodes.value.length;
    const node: CanvasNode = {
      id: `node_${Date.now().toString(36)}_${index + 1}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      position: {
        x: center.x - 420 + (index % 3) * 360,
        y: center.y - 150 + Math.floor(index / 3) * 260,
      },
      data: { ...nodeMeta[type] },
      dragHandle: ".node-drag-handle",
    };
    nodes.value.push(node);
    showNodeMenu.value = false;
  }
  function connectionProblem(connection: Connection): string | null {
    if (!connection.source || !connection.target) return "Cần chọn đủ hai cổng của node để nối.";
    if (connection.source === connection.target) return "Không thể nối một node với chính nó.";
    const sourceType = nodes.value.find((node) => node.id === connection.source)?.type;
    const targetType = nodes.value.find((node) => node.id === connection.target)?.type;
    if (!sourceType || !targetType) return "Không tìm thấy node đầu hoặc cuối kết nối.";
    // Existing edges are allowed to retain historical null handle IDs. The
    // backend preserves these, so validating incoming data must not erase it.
    const candidateId = "id" in connection && typeof connection.id === "string" ? connection.id : null;
    if (candidateId && edges.value.some((edge) => edge.id === candidateId)) return null;
    const allowed = (sourceType === "text" && (targetType === "image" || targetType === "video")) ||
      (sourceType === "image" && targetType === "video");
    if (!allowed) return "Chỉ nối Text → Image, Text → Video hoặc Image → Video.";
    if (connection.sourceHandle !== "output" || connection.targetHandle !== "input") {
      return "Hãy kéo từ cổng ra (bên phải) tới cổng vào (bên trái).";
    }
    // A preexisting null-handle edge still counts as the same logical route.
    if (edges.value.some((edge) => edge.source === connection.source && edge.target === connection.target)) {
      return "Hai node này đã được nối với nhau.";
    }
    return null;
  }
  function isValidConnection(connection: Connection) { return connectionProblem(connection) === null; }

  type ConnectStart = {
    nodeId?: string;
    handleId: string | null;
    handleType?: "source" | "target";
    event?: MouseEvent;
  };
  function eventPoint(event?: MouseEvent | TouchEvent): { x: number; y: number } | null {
    if (!event) return null;
    if ("changedTouches" in event) {
      const touch = event.changedTouches.item(0);
      return touch ? { x: touch.clientX, y: touch.clientY } : null;
    }
    return { x: event.clientX, y: event.clientY };
  }
  function handleAt(point: { x: number; y: number }) {
    const element = document.elementFromPoint(point.x, point.y);
    const handle = element?.closest<HTMLElement>(".vue-flow__handle");
    if (!handle) return null;
    const nodeId = handle.dataset.nodeid;
    if (!nodeId) return null;
    const handleType = handle.classList.contains("source") ? "source" : handle.classList.contains("target") ? "target" : null;
    return handleType ? { nodeId, handleId: handle.dataset.handleid ?? null, handleType } : null;
  }
  function originFrom(start: ConnectStart, fallbackPoint?: { x: number; y: number } | null): ConnectionOrigin | null {
    if (!start.nodeId) return null;
    const pointer = eventPoint(start.event) ?? fallbackPoint ?? { x: 0, y: 0 };
    const handleType = start.handleType ?? (start.handleId === "output" ? "source" : "target");
    return { nodeId: start.nodeId, handleId: start.handleId, handleType, x: pointer.x, y: pointer.y };
  }
  function warnRejectedConnection(origin: ConnectionOrigin, point: { x: number; y: number }) {
    const target = handleAt(point);
    if (!target) {
      connectionWarning.value = "Kết nối chưa được tạo. Hãy thả đầu dây vào cổng tròn của node đích.";
      return;
    }
    if (origin.handleType === target.handleType) {
      connectionWarning.value = "Hai cổng cùng chiều không thể nối. Sử dụng một cổng ra và một cổng vào.";
      return;
    }
    const connection: Connection = origin.handleType === "source"
      ? { source: origin.nodeId, sourceHandle: origin.handleId, target: target.nodeId, targetHandle: target.handleId }
      : { source: target.nodeId, sourceHandle: target.handleId, target: origin.nodeId, targetHandle: origin.handleId };
    connectionWarning.value = connectionProblem(connection) ?? "Không thể tạo kết nối này. Hãy thử kéo lại vào cổng phù hợp.";
  }
  function onConnectStart(start: ConnectStart) {
    dragOrigin = originFrom(start);
    connectionCompleted = false;
    connectionWarning.value = "";
  }
  function onConnectEnd(event?: MouseEvent | TouchEvent) {
    const origin = dragOrigin;
    dragOrigin = null;
    const point = eventPoint(event);
    if (!origin || !point || connectionCompleted) return;
    // Vue Flow emits connectEnd for a normal click as well. A click can start
    // the alternate click-to-connect interaction and is not a failed drag.
    if (Math.hypot(point.x - origin.x, point.y - origin.y) < 8) return;
    warnRejectedConnection(origin, point);
  }
  function onClickConnectStart(start: ConnectStart) {
    clickOrigin = originFrom(start);
    connectionCompleted = false;
    connectionWarning.value = "";
  }
  function onClickConnectEnd(event?: MouseEvent) {
    const origin = clickOrigin;
    clickOrigin = null;
    const point = eventPoint(event);
    if (origin && point && !connectionCompleted) warnRejectedConnection(origin, point);
  }
  function onConnect(connection: Connection) {
    const problem = connectionProblem(connection);
    if (problem) { connectionWarning.value = problem; return; }
    connectionCompleted = true;
    connectionWarning.value = "";
    edges.value = [...edges.value, {
      ...connection,
      sourceHandle: "output",
      targetHandle: "input",
      id: `edge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      type: "smoothstep",
    }];
  }
  function onEdgeClick({ edge }: EdgeMouseEvent) { selectedEdgeId.value = edge.id; }
  function deleteSelectedEdge() {
    if (selectedEdgeId.value) edges.value = edges.value.filter((edge) => edge.id !== selectedEdgeId.value);
    selectedEdgeId.value = "";
  }
  function onNodeDragStop() { scheduleSave(); }
  function onViewportChange() { scheduleSave(); }
  function zoomIn() { void flowZoomIn({ duration: 180 }); }
  function zoomOut() { void flowZoomOut({ duration: 180 }); }
  function fitCanvas() { void fitView({ padding: 0.22, duration: 220 }); }
  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  }
  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (!hasUnsaved.value && !isSaving.value) return;
    event.preventDefault();
    event.returnValue = "";
  }
  watch([nodes, edges, viewport], scheduleSave, { deep: true });
  onMounted(() => {
    window.addEventListener("beforeunload", onBeforeUnload);
    void retryHealth();
    healthTimer = setInterval(() => { void retryHealth(); }, 30000);
  });
  onBeforeUnmount(() => {
    clearSaveTimer();
    if (healthTimer) clearInterval(healthTimer);
    window.removeEventListener("beforeunload", onBeforeUnload);
  });
  return {
    nodeTypes, initialViewport, nodes, edges, projects, activeProject, newProjectVisible,
    deletedProjects, showDeletedProjects, isLoadingDeletedProjects, deletedProjectsError,
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
  };
}
