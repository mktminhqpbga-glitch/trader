<template>
  <aside
    v-if="selectedNode"
    class="nodeInspector nodrag nowheel"
    data-map-id="AC.UI.INSPECTOR"
    :data-node-id="selectedNode.id"
    :data-node-type="selectedNode.type"
    aria-label="Thuộc tính node đang chọn"
    @pointerdown.stop
    @mousedown.stop
    @touchstart.stop
    @wheel.stop
    @keydown.esc.stop="emit('close')"
  >
    <header class="inspectorHeader">
      <div class="headerTitle">
        <span class="headerEyebrow">THUỘC TÍNH NODE</span>
        <strong>Inspector</strong>
      </div>
      <button
        type="button"
        class="closeButton"
        data-map-id="AC.UI.INSPECTOR.CLOSE"
        aria-label="Đóng bảng thuộc tính"
        title="Đóng Inspector"
        @click="emit('close')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </header>

    <div class="inspectorBody">
      <div class="nodeIdentity" :class="`type-${selectedNode.type}`">
        <span class="nodeGlyph" aria-hidden="true">
          <svg v-if="selectedNode.type === 'text'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" d="M5 7h14M5 12h12M5 17h8" />
          </svg>
          <svg v-else-if="selectedNode.type === 'image'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.4" />
            <path stroke-linejoin="round" d="m5 17 5-4.5 3 2.5 3-3 3 3" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <path stroke-linejoin="round" d="m10 9 5 3-5 3V9Z" />
          </svg>
        </span>
        <div class="nodeIdentityText">
          <strong>{{ nodeTitle }}</strong>
          <span>{{ nodeDescription }}</span>
        </div>
        <span class="nodeTypeBadge">{{ nodeTypeName }}</span>
      </div>

      <section class="inspectorSection promptSection">
        <div class="sectionHeading">
          <h3>{{ promptHeading }}</h3>
          <span class="characterCount">{{ prompt.length.toLocaleString('vi-VN') }} ký tự</span>
        </div>
        <label class="fieldLabel" :for="promptInputId">{{ promptLabel }}</label>
        <textarea
          :id="promptInputId"
          class="promptField nodrag nowheel"
          data-map-id="AC.UI.INSPECTOR.PROMPT"
          :data-node-id="selectedNode.id"
          :value="prompt"
          :placeholder="promptPlaceholder"
          maxlength="65536"
          rows="3"
          spellcheck="false"
          @input="onPromptInput"
          @pointerdown.stop
          @mousedown.stop
          @touchstart.stop
          @wheel.stop
          @keydown.esc.stop="emit('close')"
          @keydown.stop
        />
        <p class="fieldHint">Nội dung dùng chung với node trên Canvas.</p>
      </section>

      <section class="inspectorSection">
        <div class="sectionHeading"><h3>Kết nối</h3></div>
        <div class="connectionGrid">
          <div v-if="hasInput" class="connectionStat" data-map-id="AC.UI.INSPECTOR.INPUTS">
            <span class="connectionLabel"><i class="connectionDot dotInput" aria-hidden="true"></i> Đầu vào</span>
            <strong>{{ safeIncomingCount }}</strong>
          </div>
          <div v-if="hasOutput" class="connectionStat" data-map-id="AC.UI.INSPECTOR.OUTPUTS">
            <span class="connectionLabel"><i class="connectionDot dotOutput" aria-hidden="true"></i> Đầu ra</span>
            <strong>{{ safeOutgoingCount }}</strong>
          </div>
        </div>
        <p v-if="selectedNode.type !== 'text'" class="mediaNote">Chưa kết nối AI · Chỉ soạn prompt và nối workflow.</p>
      </section>

      <div v-if="saveStateText" class="saveNotice" data-map-id="AC.UI.INSPECTOR.SAVE.STATUS" role="status">
        <span class="saveIcon" :class="saveTone" aria-hidden="true"></span>
        <span>{{ saveStateText }}</span>
      </div>

      <details class="technicalDetails" data-map-id="AC.UI.INSPECTOR.DETAILS">
        <summary>Thông tin kỹ thuật <span aria-hidden="true">⌄</span></summary>
        <div class="technicalContent">
          <span class="technicalLabel">NODE ID</span>
          <div class="nodeIdLine">
            <code :title="selectedNode.id">{{ selectedNode.id }}</code>
            <button
              type="button"
              class="copyButton"
              data-map-id="AC.UI.INSPECTOR.COPY.ID"
              :title="copyFeedback || 'Sao chép ID node'"
              :aria-label="copyFeedback || 'Sao chép ID node'"
              @click="copyNodeId"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                <rect x="8" y="8" width="11" height="11" rx="2" />
                <path stroke-linecap="round" d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
              </svg>
            </button>
          </div>
          <small v-if="copyFeedback" class="copyFeedback" role="status">{{ copyFeedback }}</small>
        </div>
      </details>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { CanvasNode } from "../types/canvas";

const props = withDefaults(defineProps<{
  selectedNode: CanvasNode | null;
  incomingCount?: number;
  outgoingCount?: number;
  saveStateText?: string;
}>(), {
  incomingCount: 0,
  outgoingCount: 0,
  saveStateText: "",
});

const emit = defineEmits<{
  (event: "close"): void;
  (event: "update-prompt", newPrompt: string): void;
}>();

// CanvasNodeData.content is the existing serialized prompt, not a new field.
// The parent applies this event to selectedNode.data.content for autosave.
const prompt = computed(() => props.selectedNode?.data.content ?? "");
const nodeTitle = computed(() => ({
  text: "Văn bản",
  image: "Tạo ảnh",
  video: "Tạo video",
})[props.selectedNode?.type ?? "text"]);
const nodeDescription = computed(() => ({
  text: "Nội dung và ý tưởng",
  image: "Prompt hình ảnh",
  video: "Prompt chuyển động",
})[props.selectedNode?.type ?? "text"]);
const nodeTypeName = computed(() => ({
  text: "Text",
  image: "Image",
  video: "Video",
})[props.selectedNode?.type ?? "text"]);
const promptHeading = computed(() => props.selectedNode?.type === "text" ? "Văn bản" : "Prompt");
const promptLabel = computed(() => props.selectedNode?.type === "text" ? "Nội dung" : "Mô tả");
const promptPlaceholder = computed(() => ({
  text: "Nhập nội dung cho workflow...",
  image: "Mô tả hình ảnh cần tạo...",
  video: "Mô tả khung hình, chuyển động...",
})[props.selectedNode?.type ?? "text"]);
const promptInputId = computed(() => `ac-inspector-prompt-${props.selectedNode?.id ?? "none"}`);
const hasInput = computed(() => props.selectedNode?.type !== "text");
const hasOutput = computed(() => props.selectedNode?.type !== "video");
const safeIncomingCount = computed(() => Number.isFinite(props.incomingCount) ? Math.max(0, Math.trunc(props.incomingCount)) : 0);
const safeOutgoingCount = computed(() => Number.isFinite(props.outgoingCount) ? Math.max(0, Math.trunc(props.outgoingCount)) : 0);
const saveTone = computed(() => {
  if (/xung đột|chưa lưu được|lỗi/i.test(props.saveStateText)) return "error";
  if (/đang lưu|thay đổi chưa lưu/i.test(props.saveStateText)) return "pending";
  if (/đã lưu|đã đồng bộ/i.test(props.saveStateText)) return "saved";
  return "neutral";
});
const copyFeedback = ref("");
watch(() => props.selectedNode?.id, () => { copyFeedback.value = ""; });

function onPromptInput(event: Event) {
  emit("update-prompt", (event.target as HTMLTextAreaElement).value);
}

async function copyNodeId() {
  if (!props.selectedNode) return;
  try {
    await navigator.clipboard.writeText(props.selectedNode.id);
    copyFeedback.value = "Đã sao chép ID";
  } catch {
    copyFeedback.value = "Không sao chép được ID";
  }
}
</script>

<style scoped>
.nodeInspector{
  --inspector-text:var(--ac-text,#f1eff5);
  --inspector-muted:var(--ac-muted,#95949f);
  --inspector-border:var(--ac-line,#303039);
  position:relative;z-index:auto;top:auto;right:auto;bottom:auto;
  display:flex;flex-direction:column;box-sizing:border-box;
  width:100%;max-width:290px;height:100%;min-height:0;
  overflow:hidden;border:0;border-left:1px solid var(--inspector-border);
  border-radius:0;background:var(--ac-surface,#18191d);color:var(--inspector-text);
  box-shadow:none;font-family:var(--ac-font,inherit);font-size:11px;pointer-events:auto;text-align:left;
}
.nodeInspector *,.nodeInspector *::before,.nodeInspector *::after{box-sizing:border-box}
.inspectorHeader{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:none;min-height:56px;padding:12px 13px;border-bottom:1px solid var(--inspector-border)}
.headerTitle{display:grid;gap:3px}
.headerEyebrow{color:var(--inspector-muted);font-size:9px;font-weight:650;letter-spacing:.10em}
.headerTitle strong{font-size:13px;font-weight:650;line-height:1.2}
.closeButton,.copyButton{display:grid;place-items:center;flex:none;width:27px;height:27px;padding:5px;border:1px solid var(--inspector-border);border-radius:7px;background:transparent;color:var(--inspector-muted);cursor:pointer}
.closeButton:hover,.copyButton:hover{border-color:var(--ac-accent,#a69af6);color:var(--inspector-text)}
.closeButton svg,.copyButton svg{display:block;width:100%;height:100%}
.closeButton:focus-visible,.copyButton:focus-visible,.technicalDetails summary:focus-visible{outline:2px solid var(--ac-accent,#a69af6);outline-offset:2px}
.inspectorBody{flex:1;min-height:0;padding:13px 13px 20px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#4a4652 transparent}
.nodeIdentity{--node-accent:#a69af6;display:flex;align-items:center;gap:9px;min-width:0;padding:0 0 13px;border-bottom:1px solid var(--inspector-border)}
.nodeIdentity.type-image{--node-accent:#8bc9c0}
.nodeIdentity.type-video{--node-accent:#c6a5da}
.nodeGlyph{display:grid;place-items:center;flex:none;width:31px;height:31px;border:1px solid #4e485b;border-radius:8px;background:#292533;color:var(--node-accent)}
.nodeGlyph svg{width:16px;height:16px}
.nodeIdentityText{display:grid;flex:1;gap:3px;min-width:0}
.nodeIdentityText strong{font-size:12px;font-weight:650;line-height:1.3}
.nodeIdentityText span{overflow:hidden;color:var(--inspector-muted);font-size:10px;text-overflow:ellipsis;white-space:nowrap}
.nodeTypeBadge{flex:none;padding:4px 6px;border:1px solid #494354;border-radius:5px;color:var(--node-accent);background:#2b2733;font-size:9px;font-weight:650}
.inspectorSection{margin-top:17px}
.sectionHeading{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:10px}
.sectionHeading h3{margin:0;font-size:11px;font-weight:680;letter-spacing:.01em}
.characterCount{color:var(--inspector-muted);font-size:9px;font-variant-numeric:tabular-nums;white-space:nowrap}
.fieldLabel{display:inline-block;margin-bottom:7px;color:#bdb7c7;font-size:10px;font-weight:550}
.promptField{display:block;width:100%;height:80px;min-height:76px;max-height:124px;resize:vertical;overflow:auto;overscroll-behavior:contain;padding:9px 10px;border:1px solid #4a4551;border-radius:8px;background:var(--ac-bg,#101113);color:var(--inspector-text);outline:0;font:11px/1.55 var(--ac-font,inherit);caret-color:var(--ac-accent,#a69af6)}
.promptField::placeholder{color:#817a88}
.promptField:hover{border-color:#686071}
.promptField:focus{border-color:var(--ac-accent,#a69af6);box-shadow:0 0 0 2px #a69af620}
.fieldHint{margin:6px 0 0;color:var(--inspector-muted);font-size:9px;line-height:1.5}
.connectionGrid{display:flex;align-items:stretch;gap:7px}
.connectionStat{display:flex;align-items:center;justify-content:space-between;gap:7px;flex:1;min-width:0;padding:9px;border:1px solid var(--inspector-border);border-radius:8px;background:var(--ac-surface-2,#202126)}
.connectionLabel{display:flex;align-items:center;gap:5px;color:var(--inspector-muted);font-size:10px;white-space:nowrap}
.connectionDot{display:inline-block;flex:none;width:6px;height:6px;border-radius:99px;background:#a0a0a0}
.dotInput{background:#8bc9c0}.dotOutput{background:#b6a4e2}
.connectionStat strong{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}
.mediaNote{margin:9px 0 0;color:var(--inspector-muted);font-size:9px;line-height:1.55}
.saveNotice{display:flex;align-items:center;gap:8px;margin-top:17px;padding:9px 2px;border-top:1px solid var(--inspector-border);color:var(--inspector-muted);font-size:10px;line-height:1.45}
.saveIcon{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:var(--ac-accent,#a69af6)}
.saveIcon.saved{background:var(--ac-success,#83c9a8)}.saveIcon.pending{background:#e8c184}.saveIcon.error{background:var(--ac-danger,#e99caa)}
.technicalDetails{margin-top:7px;padding:8px 0 0;border-top:1px solid var(--inspector-border)}
.technicalDetails summary{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--inspector-muted);cursor:pointer;font-size:10px;list-style:none}
.technicalDetails summary::-webkit-details-marker{display:none}
.technicalDetails summary span{transition:transform .18s ease}
.technicalDetails[open] summary span{transform:rotate(180deg)}
.technicalContent{display:grid;gap:7px;padding-top:12px}
.technicalLabel{color:var(--inspector-muted);font-size:9px;letter-spacing:.08em}
.nodeIdLine{display:flex;align-items:center;gap:6px}
.nodeIdLine code{flex:1;min-width:0;overflow:hidden;padding:8px;border:1px solid var(--inspector-border);border-radius:6px;background:var(--ac-bg,#101113);color:#ccc5d4;font:9px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;text-overflow:ellipsis;white-space:nowrap}
.copyButton{height:28px;width:28px}
.copyFeedback{color:var(--ac-success,#83c9a8);font-size:9px}
@media(max-width:760px){.nodeInspector{max-width:none}.inspectorBody{padding:11px}}
</style>
