<template>
  <article
    ref="root"
    class="previewNode"
    :class="['type-' + type, { selected, expanded, mediaModeDemo: !!data.demo }]"
    :data-preview-node="id"
    :data-map-id="'AC.UI02.PREVIEW.NODE.' + type.toUpperCase()"
  >
    <Handle v-if="type !== 'text'" id="input" type="target" :position="Position.Left" class="previewHandle previewInput" />

    <div v-if="selected" class="previewContextToolbar nodrag nowheel" role="toolbar" aria-label="Tác vụ node đang chọn" data-map-id="AC.UI02.PREVIEW.NODE.TOOLBAR" @pointerdown.stop @mousedown.stop @click.stop>
      <button type="button" title="Chỉnh sửa prompt" aria-label="Chỉnh sửa prompt" data-map-id="AC.UI02.PREVIEW.NODE.EDIT" @click.stop="focusPrompt"><StudioIcon name="text" /><span>Sửa prompt</span></button>
      <button type="button" title="Mở Inspector" aria-label="Mở Inspector" data-map-id="AC.UI02.PREVIEW.NODE.INSPECT" @click.stop="emit('inspect', id)"><StudioIcon name="info" /><span>Inspector</span></button>
      <button type="button" title="Tùy chọn node" aria-label="Tùy chọn node" aria-haspopup="menu" :aria-expanded="menuOpen" data-map-id="AC.UI02.PREVIEW.NODE.MENU.TOGGLE" @click.stop="toggleMenu"><StudioIcon name="more" /></button>
    </div>

    <header class="previewNodeHeader node-drag-handle" data-map-id="AC.UI02.PREVIEW.NODE.HEADER">
      <span class="previewNodeGlyph" aria-hidden="true"><StudioIcon :name="type === 'text' ? 'text' : type === 'image' ? 'image' : 'video'" /></span>
      <div class="previewNodeTitle"><strong>{{ nodeTitle }}</strong><small>{{ typeLabel }}</small></div>
      <span v-if="data.demo && type !== 'text'" class="previewNodeTypeBadge" title="Chỉ là media minh họa, không phải kết quả AI">DEMO</span>
      <button type="button" class="nodeMore nodrag" data-map-id="AC.UI02.PREVIEW.NODE.MENU.TOGGLE" :aria-expanded="menuOpen" aria-haspopup="menu" title="Mở menu node" :aria-label="'Tùy chọn ' + nodeTitle" @pointerdown.stop @mousedown.stop @click.stop="toggleMenu"><StudioIcon name="more" /></button>
      <div v-if="menuOpen" class="previewNodeMenu nodrag nowheel" role="menu" data-map-id="AC.UI02.PREVIEW.NODE.MENU" @pointerdown.stop @mousedown.stop @click.stop @keydown.esc.stop="menuOpen = false">
        <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.NODE.MENU.EDIT" @click.stop="focusPrompt"><StudioIcon name="text" />Chỉnh sửa prompt</button>
        <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.NODE.MENU.INSPECT" @click.stop="menuOpen = false; emit('inspect', id)"><StudioIcon name="info" />Mở Inspector</button>
        <button type="button" role="menuitem" class="dangerItem" data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE" @click.stop="menuOpen = false; emit('delete', id)"><StudioIcon name="trash" />Xóa node khỏi bản xem trước</button>
      </div>
    </header>

    <div v-if="type === 'text'" class="previewTextBody">
      <div class="previewTextMeta"><span>GHI CHÚ SÁNG TẠO</span><span>{{ prompt.length }} ký tự</span></div>
      <textarea
        ref="input"
        v-model="prompt"
        class="previewTextInput nodrag nowheel"
        data-map-id="AC.UI02.PREVIEW.NODE.TEXT.INPUT"
        aria-label="Nội dung ghi chú sáng tạo"
        rows="2"
        spellcheck="false"
        :style="{ height: textHeight + 'px' }"
        @input="resizeText"
        @pointerdown.stop
        @mousedown.stop
        @wheel.stop
      />
      <div class="previewTextFoot"><span>Ý tưởng · Sẵn sàng nối cảnh</span><button type="button" class="previewNodePromptToggle nodrag" data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND" :aria-expanded="expanded" :aria-label="expanded ? 'Thu gọn vùng ghi chú' : 'Mở rộng vùng ghi chú'" @pointerdown.stop @mousedown.stop @click.stop="toggleExpand">{{ expanded ? 'Thu gọn' : 'Mở rộng' }} <StudioIcon name="chevron" /></button></div>
    </div>

    <div v-else class="previewMediaBody" :class="'media-' + type">
      <div v-if="data.demo" class="previewMedia" :class="[type === 'image' ? 'previewImageMedia' : 'previewVideoMedia videoMedia', imageAspectClass]" :data-aspect="type === 'image' ? imageAspect : '16:9'" :style="type === 'image' ? { aspectRatio: imageAspectCss } : undefined">
        <button v-if="type === 'image'" type="button" class="previewImageOpen nodrag nowheel" data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.OPEN" :title="'Xem lớn ảnh DEMO ' + nodeTitle" :aria-label="'Xem lớn ảnh DEMO ' + nodeTitle" @pointerdown.stop @mousedown.stop @click.stop="openImage">
          <img :src="data.poster" :alt="'Ảnh minh họa DEMO ' + nodeTitle" draggable="false" />
        </button>
        <video v-else :src="data.videoSrc" :poster="data.poster" preload="metadata" controls playsinline muted aria-label="Video DEMO CC0, có điều khiển phát và tạm dừng thật" class="nodrag nowheel" data-map-id="AC.UI02.PREVIEW.NODE.VIDEO.PLAYER" @pointerdown.stop @mousedown.stop @dblclick.stop @wheel.stop>
          Trình duyệt không hỗ trợ phát video DEMO.
        </video>
        <span class="demoWatermark">DEMO</span>
        <span class="mediaCorner">{{ type === 'video' ? '16:9 · CC0' : imageAspect }}</span>
      </div>

      <div class="previewMediaDetails previewPromptBlock">
        <div class="previewMediaHeading">
          <div><span class="previewEyebrow">{{ type === 'image' ? 'PROMPT KHUNG HÌNH' : 'PROMPT CHUYỂN ĐỘNG' }}</span><strong>{{ type === 'image' ? imageAspect + ' · ' + (data.shot || 'FRAME') : 'Cảnh quay · ' + (data.shot || 'VIDEO') }}</strong></div>
          <button type="button" class="previewExpand nodrag" data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND" :aria-expanded="expanded" :aria-label="expanded ? 'Thu gọn prompt' : 'Mở rộng prompt'" @pointerdown.stop @mousedown.stop @click.stop="toggleExpand">{{ expanded ? 'Thu gọn' : 'Mở prompt' }} <StudioIcon name="chevron" /></button>
        </div>
        <textarea v-show="expanded" ref="input" v-model="prompt" class="previewPromptInput nodrag nowheel" data-map-id="AC.UI02.PREVIEW.NODE.MEDIA.INPUT" rows="4" spellcheck="false" :aria-label="'Mô tả ' + nodeTitle" @pointerdown.stop @mousedown.stop @wheel.stop />
        <button v-if="!expanded" type="button" class="previewPromptSummary nodrag" data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EDIT" :title="prompt" :aria-label="'Mở sửa prompt ' + nodeTitle" @pointerdown.stop @mousedown.stop @click.stop="focusPrompt">{{ prompt }}</button>
        <div v-if="!data.demo" class="previewMediaUnavailable previewNodeStatus"><span aria-hidden="true"></span>{{ type === 'video' ? 'Chưa có video · Chưa kết nối AI' : 'Chưa có ảnh · Chưa kết nối AI' }}</div>
        <div v-else class="previewMediaFoot"><span>{{ type === 'image' ? 'Ảnh minh họa · không phải kết quả AI' : 'Clip CC0 do MDN cung cấp' }}</span><span>{{ type === 'video' ? 'Play / Pause thật' : 'Xem ảnh lớn' }}</span></div>
      </div>
    </div>

    <Handle v-if="type !== 'video'" id="output" type="source" :position="Position.Right" class="previewHandle previewOutput" />

    <dialog v-if="type === 'image'" ref="imageDialog" class="previewImageDialog nodrag nowheel" data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.DIALOG" aria-label="Ảnh DEMO phóng lớn" @click="closeImageBackdrop">
      <div class="previewImageDialogContent"><div class="previewImageDialogTop"><strong>Ảnh minh họa · {{ imageAspect }}</strong><button type="button" title="Đóng ảnh DEMO" aria-label="Đóng ảnh DEMO" data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.CLOSE" @click="imageDialog?.close()"><StudioIcon name="close" /></button></div><img :src="data.poster" :alt="'Ảnh minh họa DEMO ' + nodeTitle" /><p>DEMO — nội dung minh họa, không phải ảnh do AI tạo.</p></div>
    </dialog>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Handle, Position, useVueFlow, type NodeProps } from "@vue-flow/core";
import StudioIcon from "../components/StudioIcon.vue";

type DemoNodeData = {
  title?: string;
  shot?: string;
  prompt?: string;
  demo?: boolean;
  poster?: string;
  videoSrc?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16";
};
const props = defineProps<NodeProps<DemoNodeData>>();
const emit = defineEmits<{ inspect: [id: string]; delete: [id: string] }>();
const { updateNodeData } = useVueFlow();
const root = ref<HTMLElement>();
const input = ref<HTMLTextAreaElement>();
const imageDialog = ref<HTMLDialogElement>();
const menuOpen = ref(false);
const expanded = ref(false);
const textHeight = ref(68);
const nodeTitle = computed(() => String(props.data.title || (props.type === "text" ? "Văn bản" : props.type === "image" ? "Khung hình" : "Cảnh quay")));
const typeLabel = computed(() => props.type === "text" ? "TEXT · Ý tưởng" : props.type === "image" ? "IMAGE · Khung tĩnh" : "VIDEO · Chuyển động");
const imageAspect = computed(() => props.data.aspectRatio || "16:9");
const imageAspectClass = computed(() => props.type !== "image" ? "" : imageAspect.value === "1:1" ? "aspect-square" : imageAspect.value === "9:16" ? "aspect-portrait" : "aspect-landscape");
const imageAspectCss = computed(() => imageAspect.value.replace(":", " / "));
const prompt = computed({
  get: () => String(props.data.prompt || ""),
  set: (value: string) => updateNodeData(props.id, { prompt: value }),
});

function resizeText() {
  if (props.type !== "text" || !input.value) return;
  const el = input.value;
  el.style.height = "0px";
  textHeight.value = Math.max(68, Math.min(el.scrollHeight, expanded.value ? 320 : 170));
  el.style.height = textHeight.value + "px";
}
async function focusPrompt() {
  menuOpen.value = false;
  if (props.type !== "text") expanded.value = true;
  await nextTick();
  resizeText();
  input.value?.focus();
}
async function toggleExpand() {
  expanded.value = !expanded.value;
  await nextTick();
  resizeText();
}
function toggleMenu() { menuOpen.value = !menuOpen.value; }
function outsideClick(event: PointerEvent) {
  if (menuOpen.value && !root.value?.contains(event.target as Node)) menuOpen.value = false;
}
function openImage() { if (props.type === "image" && props.data.demo) imageDialog.value?.showModal(); }
function closeImageBackdrop(event: MouseEvent) { if (event.target === event.currentTarget) imageDialog.value?.close(); }
watch(() => props.selected, value => { if (!value) menuOpen.value = false; });
watch(() => props.data.prompt, () => { void nextTick(resizeText); });
watch(menuOpen, value => {
  if (value) document.addEventListener("pointerdown", outsideClick, true);
  else document.removeEventListener("pointerdown", outsideClick, true);
});
onMounted(() => { void nextTick(resizeText); });
onBeforeUnmount(() => document.removeEventListener("pointerdown", outsideClick, true));
</script>
