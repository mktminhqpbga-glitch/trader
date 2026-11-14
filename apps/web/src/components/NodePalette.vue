<template>
  <section class="nodePalette creativePalette" data-map-id="AC.UI.NODE.PALETTE" role="dialog" aria-label="Thêm node vào Canvas" @mousedown.stop @pointerdown.stop @click.stop @keydown.esc.stop="emit('close')">
    <header class="paletteHeading"><div><span class="paletteEyebrow">CÔNG CỤ SÁNG TẠO</span><strong>Thêm vào Canvas</strong></div><button type="button" class="paletteClose" aria-label="Đóng danh sách node" title="Đóng" @click="emit('close')"><StudioIcon name="close" /></button></header>
    <label class="paletteSearch"><StudioIcon name="search" /><input v-model="query" data-map-id="AC.UI.NODE.SEARCH" type="search" autocomplete="off" spellcheck="false" aria-label="Tìm node" placeholder="Tìm loại node..." /></label>
    <p class="paletteCaption">CÔNG CỤ HIỆN CÓ</p>
    <div class="paletteItems">
      <button v-if="matches('text')" type="button" data-map-id="AC.CANVAS.ADD.NODE.TEXT" @click="emit('create','text')"><span class="paletteItemIcon"><StudioIcon name="text" /></span><span class="paletteInfo"><strong>Văn bản</strong><small>Ghi ý tưởng, prompt và kịch bản</small></span><StudioIcon class="paletteItemPlus" name="plus" /></button>
      <button v-if="matches('image')" type="button" data-map-id="AC.CANVAS.ADD.NODE.IMAGE" @click="emit('create','image')"><span class="paletteItemIcon imageIcon"><StudioIcon name="image" /></span><span class="paletteInfo"><strong>Hình ảnh</strong><small>Phác thảo khung hình bằng prompt</small></span><StudioIcon class="paletteItemPlus" name="plus" /></button>
      <button v-if="matches('video')" type="button" data-map-id="AC.CANVAS.ADD.NODE.VIDEO" @click="emit('create','video')"><span class="paletteItemIcon videoIcon"><StudioIcon name="video" /></span><span class="paletteInfo"><strong>Video</strong><small>Diễn tả chuyển động và cảnh quay</small></span><StudioIcon class="paletteItemPlus" name="plus" /></button>
    </div>
    <p v-if="!matches('text') && !matches('image') && !matches('video')" class="paletteEmpty">Chưa có công cụ phù hợp với từ khóa này.</p>
    <footer class="paletteFootnote">Các công cụ khác sẽ có trong phiên bản sau.</footer>
  </section>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import StudioIcon from './StudioIcon.vue';
import type { CanvasNodeType } from '../types/canvas';
const query = ref('');
const emit = defineEmits<{create:[type:CanvasNodeType];close:[]}>();
const names:Record<CanvasNodeType,string>={text:'text văn bản ý tưởng kịch bản prompt',image:'image hình ảnh tạo ảnh khung hình',video:'video chuyển động phim cảnh quay'};
function matches(type:CanvasNodeType){return names[type].includes(query.value.trim().toLocaleLowerCase('vi-VN'));}
onMounted(()=>{void nextTick(()=>document.querySelector<HTMLInputElement>('[data-map-id="AC.UI.NODE.SEARCH"]')?.focus());});
</script>
