<template>
  <article ref="root" class="previewNode" :class="['type-' + type, { selected: selected, expanded: expanded }]" :data-preview-node="id" :data-map-id="'AC.UI02.PREVIEW.NODE.' + type.toUpperCase()">
    <Handle v-if="type !== 'text'" id="input" type="target" :position="Position.Left" class="previewHandle previewInput" />
    <div v-if="selected" class="previewContextToolbar nodrag nowheel" data-map-id="AC.UI02.PREVIEW.NODE.TOOLBAR" @pointerdown.stop @mousedown.stop @click.stop>
      <button type="button" title="Chỉnh sửa prompt" aria-label="Chỉnh sửa prompt" data-map-id="AC.UI02.PREVIEW.NODE.EDIT" @click.stop="focusPrompt">✎ <span>Sửa prompt</span></button>
      <button type="button" title="Mở Inspector" data-map-id="AC.UI02.PREVIEW.NODE.INSPECT" aria-label="Mở Inspector" data-map-id="AC.UI02.PREVIEW.NODE.INSPECT" @click.stop="emit('inspect', id)">☷</button>
      <button type="button" data-map-id="AC.UI02.PREVIEW.NODE.MENU.TOGGLE" :aria-expanded="menuOpen" title="Tùy chọn node" aria-label="Tùy chọn node" @click.stop="toggleMenu">···</button>
    </div>

    <header class="previewNodeHeader node-drag-handle">
      <span class="previewNodeGlyph" aria-hidden="true">{{ type === 'text' ? '✎' : type === 'image' ? '▧' : '▣' }}</span>
      <div class="previewNodeTitle"><strong>{{ nodeTitle }}</strong><small>{{ data.shot || (type === 'text' ? 'Ý tưởng' : type === 'image' ? 'Khung hình' : 'Chuyển động') }}</small></div>
      <button type="button" class="nodeMore nodrag" data-map-id="AC.UI02.PREVIEW.NODE.MENU.TOGGLE" :aria-expanded="menuOpen" title="Mở menu node" :aria-label="'Tùy chọn ' + nodeTitle" @pointerdown.stop @mousedown.stop @click.stop="toggleMenu">···</button>
      <div v-if="menuOpen" class="previewNodeMenu nodrag nowheel" role="menu" @pointerdown.stop @click.stop @keydown.esc.stop="menuOpen = false">
        <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.NODE.MENU.EDIT" @click.stop="focusPrompt">Chỉnh sửa prompt</button>
        <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.NODE.MENU.INSPECT" @click.stop="menuOpen = false; emit('inspect', id)">Mở Inspector</button>
        <button type="button" role="menuitem" class="dangerItem" data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE" @click.stop="menuOpen = false; emit('delete', id)">Xóa node khỏi bản xem trước</button>
      </div>
    </header>

    <div v-if="type === 'text'" class="previewTextBody">
      <p class="previewNoteMeta">GHI CHÚ SÁNG TẠO</p>
      <textarea ref="input" v-model="prompt" class="previewTextInput nodrag nowheel" data-map-id="AC.UI02.PREVIEW.NODE.TEXT.INPUT" aria-label="Nội dung ghi chú" rows="2" spellcheck="false" @pointerdown.stop @mousedown.stop @wheel.stop />
      <span class="previewTextFoot">Ý tưởng → cảnh quay</span>
    </div>

    <div v-else class="previewMediaBody">
      <div v-if="data.demo" class="previewMedia" :class="{ videoMedia: type === 'video' }">
        <img v-if="type === 'image'" :src="data.poster" :alt="'Ảnh minh họa cho ' + nodeTitle" draggable="false" />
        <video v-else :src="data.videoSrc" :poster="data.poster" preload="metadata" controls playsinline aria-label="Video DEMO CC0, phát và tạm dừng" class="nodrag nowheel" @pointerdown.stop @mousedown.stop @dblclick.stop @wheel.stop>
          Trình duyệt không hỗ trợ phát video DEMO.
        </video>
        <span class="demoWatermark">DEMO — DESIGN PREVIEW</span>
        <span class="mediaCorner">{{ type === 'video' ? '16:9 • CC0' : 'FRAME ' + (data.shot || '01') }}</span>
      </div>
      <div class="previewMediaDetails">
        <div class="previewMediaHeading">
          <div><span class="previewEyebrow">{{ type === 'image' ? 'KHUNG HÌNH' : 'CẢNH CHUYỂN ĐỘNG' }}</span><strong>{{ nodeTitle }}</strong></div>
          <button type="button" class="previewExpand nodrag" data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND" :aria-expanded="expanded" :aria-label="expanded ? 'Thu gọn prompt' : 'Mở rộng prompt'" @pointerdown.stop @mousedown.stop @click.stop="expanded = !expanded">{{ expanded ? 'Thu gọn' : 'Mở prompt' }} <span aria-hidden="true">{{ expanded ? '⌃' : '⌄' }}</span></button>
        </div>
        <textarea v-if="expanded" ref="input" v-model="prompt" class="previewPromptInput nodrag nowheel" data-map-id="AC.UI02.PREVIEW.NODE.MEDIA.INPUT" rows="4" spellcheck="false" :aria-label="'Mô tả ' + nodeTitle" @pointerdown.stop @mousedown.stop @wheel.stop />
        <button v-else type="button" class="previewPromptSummary nodrag" data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EDIT" :title="prompt" :aria-label="'Mở sửa prompt ' + nodeTitle" @click.stop="focusPrompt">{{ prompt }}</button>
        <div v-if="!data.demo" class="previewMediaUnavailable"><span aria-hidden="true"></span>Chưa kết nối AI · Chưa có media thật</div>
        <div v-else class="previewMediaFoot"><span>● Khung hình xem trước</span><span>{{ type === 'video' ? 'Phát / tạm dừng' : 'Sẵn sàng làm tham chiếu' }}</span></div>
      </div>
    </div>
    <Handle v-if="type !== 'video'" id="output" type="source" :position="Position.Right" class="previewHandle previewOutput" />
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { Handle, Position, useVueFlow, type NodeProps } from "@vue-flow/core";

type DemoNodeData = {
  title?: string;
  shot?: string;
  prompt?: string;
  demo?: boolean;
  poster?: string;
  videoSrc?: string;
};
const props = defineProps<NodeProps<DemoNodeData>>();
const emit = defineEmits<{ inspect: [id: string]; delete: [id: string] }>();
const { updateNodeData } = useVueFlow();
const root = ref<HTMLElement>();
const input = ref<HTMLTextAreaElement>();
const menuOpen = ref(false);
const expanded = ref(false);
const nodeTitle = computed(() => String(props.data.title || (props.type === "text" ? "Văn bản" : props.type === "image" ? "Tạo ảnh" : "Tạo video")));
const prompt = computed({
  get: () => String(props.data.prompt || ""),
  set: (value: string) => updateNodeData(props.id, { prompt: value }),
});
async function focusPrompt() {
  menuOpen.value = false;
  expanded.value = true;
  await nextTick();
  input.value?.focus();
}
function toggleMenu() { menuOpen.value = !menuOpen.value; }
function outsideClick(event: PointerEvent) {
  if (menuOpen.value && !root.value?.contains(event.target as Node)) menuOpen.value = false;
}
watch(() => props.selected, value => { if (!value) menuOpen.value = false; });
watch(menuOpen, value => {
  if (value) document.addEventListener("pointerdown", outsideClick, true);
  else document.removeEventListener("pointerdown", outsideClick, true);
});
onBeforeUnmount(() => document.removeEventListener("pointerdown", outsideClick, true));
</script>
