<template>
  <div class="nodePalette" data-map-id="AC.UI.NODE.PALETTE" role="dialog" aria-label="Chọn loại node" @mousedown.stop @click.stop @keydown.esc.stop="emit('close')">
    <div class="paletteHeading"><div><strong>Thêm vào Canvas</strong><small>Chọn loại node để bắt đầu</small></div><button type="button" class="paletteClose" aria-label="Đóng danh sách node" @click="emit('close')">×</button></div>
    <label class="paletteSearch"><span aria-hidden="true">⌕</span><input v-model="query" type="search" data-map-id="AC.UI.NODE.SEARCH" placeholder="Tìm Text, Image, Video..." aria-label="Tìm node" autofocus /></label>
    <div v-if="matches('text')" class="paletteGroup"><span class="paletteCaption">NỘI DUNG</span><button type="button" data-map-id="AC.CANVAS.ADD.NODE.TEXT" @click="emit('create','text')"><span class="paletteItemIcon">T</span><span><strong>Text</strong><small>Ý tưởng, kịch bản, prompt văn bản</small></span><b>＋</b></button></div>
    <div v-if="matches('image') || matches('video')" class="paletteGroup"><span class="paletteCaption">HÌNH ẢNH & CHUYỂN ĐỘNG</span><button v-if="matches('image')" type="button" data-map-id="AC.CANVAS.ADD.NODE.IMAGE" @click="emit('create','image')"><span class="paletteItemIcon imageIcon">▧</span><span><strong>Image</strong><small>Prompt và khung hình ảnh</small></span><b>＋</b></button><button v-if="matches('video')" type="button" data-map-id="AC.CANVAS.ADD.NODE.VIDEO" @click="emit('create','video')"><span class="paletteItemIcon videoIcon">▷</span><span><strong>Video</strong><small>Prompt và chuyển động khung hình</small></span><b>＋</b></button></div>
    <p v-if="!matches('text') && !matches('image') && !matches('video')" class="paletteEmpty">Không tìm thấy node phù hợp.</p>
    <p class="paletteFootnote">Các công cụ AI nâng cao sẽ được bổ sung sau.</p>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import type { CanvasNodeType } from '../types/canvas';
const query = ref('');
const emit = defineEmits<{create:[type:CanvasNodeType];close:[]}>();
const names: Record<CanvasNodeType,string>={text:'text văn bản ý tưởng kịch bản',image:'image hình ảnh tạo ảnh',video:'video chuyển động phim'};
function matches(type:CanvasNodeType){return names[type].includes(query.value.trim().toLocaleLowerCase('vi-VN'));}
onMounted(()=>{void nextTick(()=>document.querySelector<HTMLInputElement>('[data-map-id="AC.UI.NODE.SEARCH"]')?.focus());});
</script>
