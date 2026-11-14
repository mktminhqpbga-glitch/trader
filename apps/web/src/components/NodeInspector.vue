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
  >
    <header class="inspectorHeader">
      <div class="headerTitle">
        <span class="headerEyebrow">NODE INSPECTOR</span>
        <strong>Thuộc tính</strong>
      </div>
      <button
        type="button"
        class="closeButton"
        data-map-id="AC.UI.INSPECTOR.CLOSE"
        aria-label="Đóng bảng thuộc tính"
        title="Đóng Inspector"
        @click="emit('close')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </header>

    <div class="inspectorBody">
      <section class="selectedNodeCard" :class="`type-${selectedNode.type}`">
        <div class="nodeIdentity">
          <div class="nodeGlyph" aria-hidden="true">
            <svg v-if="selectedNode.type === 'text'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h12M4 18h8" />
            </svg>
            <svg v-else-if="selectedNode.type === 'image'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
              <circle cx="9" cy="9.5" r="1.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 17 5.4-4.8 3.3 2.7 2.6-2.4 4.2 4" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
              <path stroke-linejoin="round" d="m10 8 6 4-6 4V8Z" />
            </svg>
          </div>
          <div class="nodeIdentityText">
            <strong>{{ nodeTitle }}</strong>
            <span>{{ nodeDescription }}</span>
          </div>
        </div>
        <div class="nodeTypeRow">
          <span class="typeLabel">LOẠI NODE</span>
          <span class="nodeTypeBadge">{{ nodeTypeName }}</span>
        </div>
      </section>

      <section class="inspectorSection">
        <div class="sectionHeading">
          <div>
            <span class="sectionEyebrow">NỘI DUNG</span>
            <h3>{{ promptHeading }}</h3>
          </div>
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
          rows="7"
          spellcheck="false"
          @input="onPromptInput"
          @pointerdown.stop
          @mousedown.stop
          @touchstart.stop
          @wheel.stop
          @keydown.stop
        />
        <p class="fieldHint">Thay đổi được chuyển tới Canvas để lưu cùng dự án.</p>
      </section>

      <section class="inspectorSection">
        <div class="sectionHeading">
          <div>
            <span class="sectionEyebrow">WORKFLOW</span>
            <h3>Kết nối</h3>
          </div>
        </div>
        <div class="connectionGrid">
          <div v-if="hasInput" class="connectionStat" data-map-id="AC.UI.INSPECTOR.INPUTS">
            <div class="connectionStatTop">
              <span class="connectionDot dotInput" aria-hidden="true"></span>
              <span>Đầu vào</span>
            </div>
            <strong>{{ safeIncomingCount }}</strong>
            <small>kết nối đến</small>
          </div>
          <div v-if="hasOutput" class="connectionStat" data-map-id="AC.UI.INSPECTOR.OUTPUTS">
            <div class="connectionStatTop">
              <span class="connectionDot dotOutput" aria-hidden="true"></span>
              <span>Đầu ra</span>
            </div>
            <strong>{{ safeOutgoingCount }}</strong>
            <small>kết nối đi</small>
          </div>
        </div>
        <p v-if="selectedNode.type !== 'text'" class="mediaNote">
          Chưa kết nối AI. Node này hiện dùng để biên soạn prompt và nối workflow.
        </p>
      </section>

      <section v-if="saveStateText" class="saveNotice" data-map-id="AC.UI.INSPECTOR.SAVE.STATUS" role="status">
        <span class="saveIcon" :class="saveTone" aria-hidden="true">
          <svg v-if="saveTone === 'saved'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 12.5 9 17l11-11" />
          </svg>
          <span v-else class="statusIndicator"></span>
        </span>
        <div>
          <strong>Trạng thái Canvas</strong>
          <p>{{ saveStateText }}</p>
        </div>
      </section>

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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
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

// CanvasNodeData.content is the existing persisted prompt/text field. The
// parent must apply update-prompt to node.data.content via updateNodeData.
const prompt = computed(() => props.selectedNode?.data.content ?? "");
const nodeTitle = computed(() => ({
  text: "Văn bản",
  image: "Hình ảnh",
  video: "Video",
})[props.selectedNode?.type ?? "text"]);
const nodeDescription = computed(() => ({
  text: "Nội dung và ý tưởng",
  image: "Mô tả hình ảnh cần tạo",
  video: "Mô tả cảnh quay và chuyển động",
})[props.selectedNode?.type ?? "text"]);
const nodeTypeName = computed(() => ({
  text: "Text Node",
  image: "Image Node",
  video: "Video Node",
})[props.selectedNode?.type ?? "text"]);
const promptHeading = computed(() => props.selectedNode?.type === "text" ? "Nội dung văn bản" : "Prompt");
const promptLabel = computed(() => props.selectedNode?.type === "text" ? "Văn bản" : "Mô tả");
const promptPlaceholder = computed(() => ({
  text: "Nhập nội dung muốn sử dụng trong workflow...",
  image: "Mô tả khung hình, bối cảnh, nhân vật, ánh sáng...",
  video: "Mô tả cảnh quay, chuyển động, góc máy, nhịp điệu...",
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
  const id = props.selectedNode.id;
  try {
    await navigator.clipboard.writeText(id);
    copyFeedback.value = "Đã sao chép ID";
  } catch {
    copyFeedback.value = "Không sao chép được ID";
  }
}
</script>

<style scoped>
.nodeInspector {
  --inspector-text: var(--ac-text, #e7edff);
  --inspector-muted: var(--ac-muted, #8d9ab3);
  --inspector-border: var(--ac-line, #2b3850);
  --inspector-accent: var(--ac-accent, #8494ff);
  position: absolute;
  z-index: 24;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: min(300px, calc(100% - 32px));
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--inspector-border);
  border-radius: 16px;
  background: var(--ac-surface, #111a29);
  color: var(--inspector-text);
  box-shadow: 0 20px 72px rgb(0 0 0 / 36%), 0 0 0 1px rgb(255 255 255 / 2%) inset;
  font-family: inherit;
  font-size: 12px;
  text-align: left;
  pointer-events: auto;
  box-sizing: border-box;
}
.nodeInspector *, .nodeInspector *::before, .nodeInspector *::after { box-sizing: border-box; }
.inspectorHeader {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 70px;
  padding: 16px 16px 15px;
  border-bottom: 1px solid var(--inspector-border);
  background: linear-gradient(135deg, rgb(131 149 255 / 10%), transparent 75%);
}
.headerTitle { display: grid; gap: 5px; }
.headerEyebrow, .sectionEyebrow, .typeLabel, .technicalLabel {
  color: var(--inspector-muted);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: .13em;
}
.headerTitle strong { font-size: 15px; letter-spacing: -.025em; }
.closeButton, .copyButton {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 29px;
  height: 29px;
  padding: 6px;
  border: 1px solid var(--inspector-border);
  border-radius: 9px;
  background: var(--ac-surface-2, #19263a);
  color: #9daecb;
  cursor: pointer;
}
.closeButton svg, .copyButton svg { display: block; width: 100%; height: 100%; }
.closeButton:hover, .copyButton:hover { border-color: var(--inspector-accent); color: #fff; }
.closeButton:focus-visible, .copyButton:focus-visible, .technicalDetails summary:focus-visible {
  outline: 2px solid var(--inspector-accent);
  outline-offset: 2px;
}
.inspectorBody {
  flex: 1;
  min-height: 0;
  padding: 15px 14px 18px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #3d4d68 transparent;
}
.selectedNodeCard {
  --type-color: #929bff;
  --type-tint: rgb(126 138 255 / 13%);
  padding: 13px 12px 11px;
  border: 1px solid var(--inspector-border);
  border-radius: 12px;
  background: linear-gradient(145deg, var(--type-tint), rgb(24 31 46 / 35%) 67%);
}
.selectedNodeCard.type-image { --type-color: #6ad4c9; --type-tint: rgb(66 200 185 / 10%); }
.selectedNodeCard.type-video { --type-color: #d4a0f4; --type-tint: rgb(186 113 237 / 10%); }
.nodeIdentity { display: flex; align-items: center; gap: 11px; min-width: 0; }
.nodeGlyph { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border: 1px solid rgb(255 255 255 / 7%); border-radius: 12px; background: var(--type-tint); color: var(--type-color); }
.nodeGlyph svg { width: 21px; height: 21px; }
.nodeIdentityText { display: grid; gap: 4px; min-width: 0; }
.nodeIdentityText strong { font-size: 13px; font-weight: 700; }
.nodeIdentityText span { overflow: hidden; color: var(--inspector-muted); font-size: 10px; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; }
.nodeTypeRow { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 13px; padding-top: 11px; border-top: 1px solid rgb(160 178 216 / 12%); }
.nodeTypeBadge { padding: 4px 7px; border: 1px solid rgb(175 190 224 / 12%); border-radius: 6px; background: var(--type-tint); color: var(--type-color); font-size: 10px; font-weight: 650; }
.inspectorSection { margin-top: 24px; }
.sectionHeading { display: flex; align-items: end; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
.sectionHeading h3 { margin: 5px 0 0; color: var(--inspector-text); font-size: 13px; font-weight: 700; letter-spacing: -.015em; }
.characterCount { padding-bottom: 1px; color: #7688a5; font-size: 10px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fieldLabel { display: inline-block; margin-bottom: 9px; color: #b7c4da; font-size: 11px; font-weight: 650; }
.promptField {
  display: block;
  width: 100%;
  min-height: 134px;
  max-height: 340px;
  resize: vertical;
  padding: 11px 12px;
  border: 1px solid var(--inspector-border);
  border-radius: 10px;
  outline: none;
  background: var(--ac-surface-3, #0b1423);
  color: var(--inspector-text);
  font: inherit;
  font-size: 12px;
  line-height: 1.6;
  caret-color: var(--inspector-accent);
  overflow: auto;
  overscroll-behavior: contain;
}
.promptField::placeholder { color: #64738c; }
.promptField:hover { border-color: #425370; }
.promptField:focus { border-color: var(--inspector-accent); box-shadow: 0 0 0 3px rgb(126 144 255 / 12%); }
.fieldHint { margin: 9px 0 0; color: var(--inspector-muted); font-size: 10px; line-height: 1.6; }
.connectionGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.connectionStat { min-width: 0; padding: 11px 10px 12px; border: 1px solid var(--inspector-border); border-radius: 10px; background: var(--ac-surface-2, #172236); }
.connectionStatTop { display: flex; align-items: center; gap: 6px; color: #b2bfd4; font-size: 10px; }
.connectionDot { width: 7px; height: 7px; border-radius: 50%; }
.dotInput { background: #6bd9c4; box-shadow: 0 0 0 3px rgb(107 217 196 / 12%); }
.dotOutput { background: #a2a1ff; box-shadow: 0 0 0 3px rgb(162 161 255 / 12%); }
.connectionStat strong { display: block; margin-top: 10px; color: var(--inspector-text); font-size: 21px; font-weight: 700; line-height: 1.2; font-variant-numeric: tabular-nums; }
.connectionStat small { display: block; margin-top: 4px; color: var(--inspector-muted); font-size: 10px; }
.mediaNote { margin: 12px 0 0; padding: 10px; border: 1px solid var(--inspector-border); border-radius: 9px; color: var(--inspector-muted); background: rgb(255 255 255 / 2%); font-size: 10px; line-height: 1.6; }
.saveNotice { display: flex; align-items: flex-start; gap: 9px; margin-top: 22px; padding: 11px 10px; border: 1px solid var(--inspector-border); border-radius: 10px; background: rgb(123 152 203 / 5%); }
.saveIcon { display: grid; place-items: center; flex: 0 0 20px; width: 20px; height: 20px; border-radius: 7px; background: var(--ac-accent-soft, rgb(128 145 255 / 12%)); color: var(--inspector-accent); }
.saveIcon.saved { background: rgb(91 194 156 / 12%); color: var(--ac-success, #72d4b2); }
.saveIcon.pending { background: rgb(244 180 90 / 12%); color: #e9b769; }
.saveIcon.error { background: rgb(244 108 132 / 12%); color: var(--ac-danger, #ff738b); }
.saveIcon svg { width: 13px; height: 13px; }
.statusIndicator { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.saveNotice strong { font-size: 10px; }
.saveNotice p { margin: 4px 0 0; color: var(--inspector-muted); font-size: 10px; line-height: 1.45; }
.technicalDetails { margin-top: 21px; padding-top: 13px; border-top: 1px solid var(--inspector-border); }
.technicalDetails summary { display: flex; align-items: center; justify-content: space-between; cursor: pointer; color: #8e9fbb; font-size: 11px; list-style: none; }
.technicalDetails summary::-webkit-details-marker { display: none; }
.technicalDetails[open] summary span { transform: rotate(180deg); }
.technicalDetails summary span { transition: transform .2s ease; }
.technicalContent { display: grid; gap: 8px; padding-top: 13px; }
.nodeIdLine { display: flex; align-items: center; gap: 7px; }
.nodeIdLine code { flex: 1; min-width: 0; overflow: hidden; padding: 9px 8px; border: 1px solid var(--inspector-border); border-radius: 8px; color: #c0cde3; background: #0b1423; font: 10px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
.copyButton { width: 30px; height: 30px; padding: 7px; }
.copyFeedback { color: #9ddcc7; font-size: 10px; }
@media (max-width: 480px) {
  .nodeInspector { top: 10px; right: 10px; bottom: 10px; width: min(300px, calc(100% - 20px)); }
}
</style>
