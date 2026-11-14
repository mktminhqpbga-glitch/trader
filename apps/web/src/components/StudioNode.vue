<template>
  <article
    class="studioNode"
    :class="[`node-${type}`, { selected }]"
    :data-map-id="mapId"
    :data-node-id="id"
  >
    <Handle v-if="type !== 'text'" id="input" type="target" :position="Position.Left" class="nodeHandle inputHandle" :data-map-id="`AC.${type.toUpperCase()}.INPUT`" />
    <header class="nodeHeader node-drag-handle">
      <div class="nodeTitle">
        <span class="nodeIcon">{{ data.icon }}</span>
        <div>
          <strong>{{ data.label }}</strong>
          <small>{{ id }}</small>
        </div>
      </div>
      <button class="nodeDelete nodrag" type="button" :aria-label="`Xóa ${data.label}`" data-map-id="AC.CANVAS.NODE.DELETE" @click.stop="requestDelete">×</button>
    </header>
    <label class="nodeLabel" :for="promptId">{{ promptLabel }}</label>
    <textarea
      :id="promptId"
      class="nodePrompt nodrag nowheel"
      :data-map-id="promptMapId"
      :data-node-id="id"
      :value="data.content"
      :placeholder="placeholder"
      rows="4"
      @input="updateContent"
    />
    <footer class="nodeFooter">
      <span>{{ type === "text" ? "Nội dung" : type === "image" ? "Prompt ảnh" : "Prompt video" }}</span>
      <span class="handleHint">{{ type === "text" ? "Văn bản" : "Media" }}</span>
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
.studioNode { position:relative; width:280px; overflow:visible; border:1px solid #34445f; border-radius:16px; background:#131d31; color:#e6edff; box-shadow:0 18px 40px rgb(2 7 20 / 35%); transition:border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.studioNode.selected { border-color:#8da0ff; box-shadow:0 0 0 2px rgb(108 126 255 / 28%),0 18px 44px rgb(2 7 20 / 45%); }
.node-image { border-color:#356b70; }.node-video { border-color:#6b4c78; }
.nodeHeader { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 13px; border-bottom:1px solid #2a3852; cursor:grab; }
.nodeHeader:active { cursor:grabbing; }.nodeTitle { display:flex; align-items:center; gap:9px; min-width:0; }.nodeIcon { display:grid; place-items:center; width:30px; height:30px; border-radius:10px; background:#2a3865; font-size:16px; }.node-image .nodeIcon { background:#1d5559; }.node-video .nodeIcon { background:#553363; }
.nodeTitle strong { display:block; font-size:13px; }.nodeTitle small { display:block; max-width:190px; overflow:hidden; color:#7485a5; font:10px ui-monospace,SFMono-Regular,Menlo,monospace; text-overflow:ellipsis; white-space:nowrap; }
.nodeDelete { width:24px; height:24px; border:0; border-radius:7px; background:transparent; color:#91a0bc; font-size:19px; line-height:1; cursor:pointer; }.nodeDelete:hover { background:#3a243a; color:#ff9eaf; }
.nodeLabel { display:block; padding:12px 13px 6px; color:#8d9dbc; font-size:10px; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }.nodePrompt { display:block; width:calc(100% - 26px); min-height:78px; margin:0 13px; resize:vertical; border:1px solid #2d3c58; border-radius:10px; padding:10px; outline:0; background:#0d1526; color:#e7edff; font:12px/1.5 inherit; }.nodePrompt::placeholder { color:#596985; }.nodePrompt:focus { border-color:#778dff; box-shadow:0 0 0 3px rgb(119 141 255 / 12%); }
.nodeFooter { display:flex; justify-content:space-between; padding:10px 13px 12px; color:#7283a2; font-size:10px; }.handleHint { color:#9aa9c7; }.nodeHandle { width:12px; height:12px; border:2px solid #0d1526; background:#7e91ff; }.node-image .nodeHandle { background:#5bc5c2; }.node-video .nodeHandle { background:#d28aef; }
</style>
