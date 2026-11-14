import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useVueFlow, type Connection, type EdgeMouseEvent } from "@vue-flow/core";
import StudioNode from "../components/StudioNode.vue";
import type {
  CanvasEdge, CanvasNode, CanvasNodeData, CanvasNodeType, CanvasResponse,
  CanvasState, ProjectListResponse, ProjectResponse, ProjectSummary,
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
  const activeProject = ref<ProjectSummary | null>(null);
  const newProjectVisible = ref(false);
  const newProjectName = ref("");
  const isCreatingProject = ref(false);
  const isNavigating = ref(false);
  const isSaving = ref(false);
  const isHydrating = ref(false);
  const showNodeMenu = ref(false);
  const selectedEdgeId = ref("");
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
    const result = await request<ProjectListResponse>("/api/projects");
    projects.value = result.projects;
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
    if (isNavigating.value || activeProject.value?.id === projectId) return;
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
    if (isNavigating.value) return;
    isNavigating.value = true;
    try {
      if (activeProject.value && !(await flushSave())) {
        ElMessage.warning("Canvas chưa lưu. Hãy thử lưu lại hoặc tải bản nháp trước khi rời dự án.");
        return;
      }
      clearSaveTimer();
      activeProject.value = null;
      revision.value = null;
      lastAckSignature.value = null;
      showNodeMenu.value = false;
      selectedEdgeId.value = "";
      nodes.value = [];
      edges.value = [];
    } finally {
      isNavigating.value = false;
    }
  }
  async function createProject() {
    const name = newProjectName.value.trim();
    if (!name) { ElMessage.warning("Hãy nhập tên dự án"); return; }
    if (isCreatingProject.value || isNavigating.value) return;
    isCreatingProject.value = true;
    try {
      if (activeProject.value && !(await saveNow())) return;
      const result = await request<ProjectResponse>("/api/projects", {
        method: "POST", body: JSON.stringify({ name }),
      });
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
  function isValidConnection(connection: Connection) {
    if (!connection.source || !connection.target || connection.source === connection.target) return false;
    // Vue Flow calls this validator twice: while drawing a connection, and
    // while accepting an already-added edge from v-model. Ignore the edge's
    // own id during the second call or every new edge rejects itself.
    const candidateId = "id" in connection && typeof connection.id === "string" ? connection.id : null;
    if (edges.value.some((edge) => edge.id !== candidateId && edge.source === connection.source &&
      edge.target === connection.target && edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle)) return false;
    const source = nodes.value.find((node) => node.id === connection.source)?.type;
    const target = nodes.value.find((node) => node.id === connection.target)?.type;
    return (source === "text" && (target === "image" || target === "video")) ||
      (source === "image" && target === "video");
  }
  function onConnect(connection: Connection) {
    if (!isValidConnection(connection)) { ElMessage.warning("Kết nối này không tương thích hoặc đã tồn tại"); return; }
    edges.value = [...edges.value, {
      ...connection, id: `edge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
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
    newProjectName, isCreatingProject, isNavigating, isSaving, isHydrating, showNodeMenu,
    selectedEdgeId, apiStatus, apiError, saveError, saveConflict, saveState, saveStateText,
    hasUnsaved, openNewProject, toggleNodeMenu, retryHealth, createProject, openProject,
    goHome, saveNow, resolveConflict, reloadServerCanvas, downloadDraft, addNode,
    isValidConnection, onConnect, onEdgeClick, deleteSelectedEdge, onNodeDragStop,
    onViewportChange, zoomIn, zoomOut, fitCanvas, formatDate,
  };
}
