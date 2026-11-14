<template>
  <article
    class="studioNode"
    :class="[`node-${type}`, { selected }]"
    :data-map-id="mapId"
    :data-node-id="id"
  >
    <Handle v-if="type !== 'text'" id="input" type="target" :position="Position.Left" class="nodeHandle inputHandle" :data-map-id="`AC.${type.toUpperCase()}.INPUT`" />
    <header class="nodeHeader node-drag-handle">
      <div class="nodeIdentity">
        <span class="nodeIcon" aria-hidden="true">{{ type === "text" ? "T" : type === "image" ? "▧" : "▤" }}</span>
        <div class="nodeTitle">
          <strong>{{ nodeTitle }}</strong>
          <span class="nodeSubtitle">{{ nodeSubtitle }}</span>
        </div>
      </div>
      <button class="nodeDelete nodrag" type="button" :aria-label="`Xóa ${nodeTitle}`" title="Xóa node" data-map-id="AC.CANVAS.NODE.DELETE" @click.stop="requestDelete">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
          <path d="M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </header>
    <div class="nodeBody">
      <div class="promptHeading">
        <label class="nodeLabel" :for="promptId">{{ promptLabel }}</label>
        <span class="promptKind">{{ type === "text" ? "TEXT" : "PROMPT" }}</span>
      </div>
      <textarea
        :id="promptId"
        class="nodePrompt nodrag nowheel"
        :data-map-id="promptMapId"
        :data-node-id="id"
        :value="data.content"
        :placeholder="placeholder"
        :rows="type === 'text' ? 5 : 3"
        @input="updateContent"
        @wheel.stop
        @mousedown.stop
        @touchstart.stop
      />
      <section v-if="type !== 'text'" class="nodeResult" :data-map-id="`AC.${type.toUpperCase()}.RESULT`" aria-label="Trạng thái tạo nội dung">
        <div class="resultHeading">
          <span>Kết quả</span>
          <span class="resultFormat">{{ type === "image" ? "Ảnh" : "Video" }}</span>
        </div>
        <div class="resultPreview">
          <span class="previewIcon" aria-hidden="true">
            <svg v-if="type === 'image'" viewBox="0 0 48 48" width="42" height="42" fill="none">
              <rect x="7.5" y="11.5" width="33" height="25" rx="4.5" stroke="currentColor" stroke-width="1.5" />
              <circle cx="18.5" cy="20" r="3" stroke="currentColor" stroke-width="1.5" />
              <path d="M11 32.5 21 24l6.5 5 5-4.5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else viewBox="0 0 48 48" width="42" height="42" fill="none">
              <rect x="7.5" y="11.5" width="33" height="25" rx="4.5" stroke="currentColor" stroke-width="1.5" />
              <path d="M14 12v24M34 12v24M8 19h6M8 29h6M34 19h6M34 29h6" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </span>
          <p>Chưa có kết quả — Chưa kết nối AI</p>
        </div>
      </section>
    </div>
    <footer class="nodeFooter">
      <span class="footerDot" aria-hidden="true"></span>
      <span>{{ type === "text" ? "Nội dung văn bản" : type === "image" ? "Mô tả hình ảnh" : "Mô tả chuyển động" }}</span>
      <span class="footerHint">{{ type === "video" ? "Đầu vào" : "Đầu ra" }}</span>
    </footer>
    <Handle v-if="type !== 'video'" id="output" type="source" :position="Position.Right" class="nodeHandle outputHandle" :data-map-id="`AC.${type.toUpperCase()}.OUTPUT`" />
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElMessageBox } from "element-plus";
import { Handle, Position, type NodeProps } from "@vue-flow/core";
import { useVueFlow } from "@vue-flow/core";
import type { CanvasNodeData, CanvasNodeType } from "../types/canvas";

const props = defineProps<NodeProps<CanvasNodeData, Record<string, never>, CanvasNodeType>>();
const { removeNodes, updateNodeData } = useVueFlow();

const type = computed(() => props.type as CanvasNodeType);
const mapId = computed(() => `AC.${type.value.toUpperCase()}.NODE`);
const promptMapId = computed(() => `AC.${type.value.toUpperCase()}.PROMPT`);
const promptId = computed(() => `${props.id}-prompt`);
const nodeTitle = computed(() => type.value === "text" ? "Văn bản" : type.value === "image" ? "Tạo ảnh" : "Tạo video");
const nodeSubtitle = computed(() => type.value === "text" ? "Text" : type.value === "image" ? "Image" : "Video");
const promptLabel = computed(() => type.value === "text" ? "Văn bản đầu vào" : "Prompt");
const placeholder = computed(() => type.value === "text" ? "Nhập nội dung để truyền sang node khác..." : type.value === "image" ? "Mô tả hình ảnh cần tạo..." : "Mô tả chuyển động và bối cảnh video...");

function updateContent(event: Event) {
  updateNodeData(props.id, { content: (event.target as HTMLTextAreaElement).value });
}

async function requestDelete() {
  try {
    await ElMessageBox.confirm("Node và các kết nối liên quan sẽ bị xóa khỏi Canvas.", "Xóa node?", { type: "warning", confirmButtonText: "Xóa", cancelButtonText: "Hủy" });
    removeNodes([props.id]);
  } catch {
    // Người dùng hủy thao tác.
  }
}
</script>

<style scoped>
.studioNode {
  --node-accent: #a18acb;
  position: relative;
  width: 328px;
  overflow: visible;
  border: 1px solid var(--ac-line, #3b3945);
  border-radius: 16px;
  background: var(--ac-surface-2, #222127);
  color: var(--ac-text, #eae8ef);
  box-shadow: 0 16px 36px rgb(0 0 0 / 24%), 0 2px 8px rgb(0 0 0 / 16%);
  transition: border-color .18s ease, box-shadow .18s ease;
}
.studioNode:hover { border-color: #6a6078; box-shadow: 0 20px 44px rgb(0 0 0 / 30%); }
.studioNode.selected { border-color: var(--ac-accent, #a790d5); box-shadow: 0 0 0 2px rgb(167 144 213 / 25%), 0 20px 44px rgb(0 0 0 / 34%); }
.studioNode:focus-within { border-color: #9281b5; }
.node-image { --node-accent: #ac94d7; }
.node-video { --node-accent: #9c8abf; }
.nodeHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 57px;
  padding: 9px 13px;
  gap: 12px;
  border-bottom: 1px solid var(--ac-line, #34323c);
  border-radius: 16px 16px 0 0;
  background: var(--ac-surface-3, #292830);
  cursor: grab;
  user-select: none;
}
.nodeHeader:active { cursor: grabbing; }
.nodeIdentity { display: flex; align-items: center; gap: 10px; min-width: 0; pointer-events: none; }
.nodeIcon {
  display: grid;
  place-items: center;
  flex: 0 0 34px;
  height: 34px;
  border: 1px solid rgb(173 152 218 / 18%);
  border-radius: 10px;
  background: rgb(160 138 205 / 13%);
  color: #c2abe9;
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -.02em;
}
.nodeTitle { display: grid; gap: 2px; min-width: 0; }
.nodeTitle strong { overflow: hidden; color: var(--ac-text, #eae8ef); font-size: 13px; font-weight: 650; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
.nodeSubtitle { color: var(--ac-muted, #95909f); font-size: 10px; line-height: 1.25; letter-spacing: .02em; }
.nodeDelete {
  display: grid;
  place-items: center;
  flex: 0 0 27px;
  height: 27px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #a6a0b0;
  cursor: pointer;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.nodeDelete:hover { border-color: #634551; background: #423038; color: #f4b6c5; }
.nodeDelete:focus-visible { outline: 2px solid var(--ac-accent, #a790d5); outline-offset: 2px; }
.nodeBody { padding: 14px 13px; }
.promptHeading, .resultHeading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.nodeLabel, .resultHeading > span:first-child { color: #c6c0d0; font-size: 11px; font-weight: 600; line-height: 1.3; }
.promptKind, .resultFormat { color: var(--ac-muted, #898391); font-size: 10px; letter-spacing: .075em; }
.nodePrompt {
  display: block;
  width: 100%;
  min-height: 90px;
  margin-top: 10px;
  padding: 11px 12px;
  resize: vertical;
  border: 1px solid var(--ac-line, #403e49);
  border-radius: 10px;
  outline: none;
  background: var(--ac-surface, #19191e);
  color: var(--ac-text, #eae8ef);
  font-family: inherit;
  font-size: 12px;
  line-height: 1.65;
  caret-color: #c6a9ff;
  transition: border-color .16s ease, box-shadow .16s ease;
}
.node-text .nodePrompt { min-height: 122px; }
.nodePrompt::placeholder { color: #797483; opacity: 1; }
.nodePrompt:focus { border-color: #9f8bc5; box-shadow: 0 0 0 3px rgb(158 136 196 / 13%); }
.nodeResult { margin-top: 15px; }
.resultHeading { margin-bottom: 9px; }
.resultPreview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 170px;
  padding: 18px 16px;
  border: 1px solid #39373f;
  border-radius: 12px;
  background: radial-gradient(ellipse at 50% 35%, #28262f 0%, #201f25 60%, #1d1c22 100%);
  text-align: center;
}
.previewIcon { display: grid; place-items: center; color: #77717f; opacity: .85; }
.resultPreview p { max-width: 270px; margin: 12px 0 0; color: #a19aa8; font-size: 11px; line-height: 1.5; }
.nodeFooter {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 13px;
  border-top: 1px solid var(--ac-line, #34323c);
  border-radius: 0 0 16px 16px;
  color: var(--ac-muted, #95909f);
  font-size: 10px;
  line-height: 1.4;
}
.footerDot { flex: 0 0 6px; height: 6px; border-radius: 50%; background: var(--node-accent); opacity: .9; }
.footerHint { margin-left: auto; color: #b6a5d1; }
.nodeHandle {
  width: 13px;
  height: 13px;
  border: 2px solid #24222b;
  border-radius: 50%;
  background: var(--node-accent);
  box-shadow: 0 0 0 1px #8d79ae;
  transition: background .15s ease, box-shadow .15s ease;
}
.nodeHandle:hover, .nodeHandle:focus-visible { background: #d0b6ff; box-shadow: 0 0 0 4px rgb(177 152 229 / 25%); }
</style>
