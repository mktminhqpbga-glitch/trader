<template>
  <svg class="studioIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <template v-if="name === 'projects'"><rect x="3" y="4" width="8" height="7" rx="1.6"/><rect x="13" y="4" width="8" height="7" rx="1.6"/><rect x="3" y="13" width="8" height="7" rx="1.6"/><rect x="13" y="13" width="8" height="7" rx="1.6"/></template>
    <template v-else-if="name === 'canvas'"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9zM12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3"/></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14"/></template>
    <template v-else-if="name === 'minus'"><path d="M5 12h14"/></template>
    <template v-else-if="name === 'fit'"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"/><rect x="8" y="8" width="8" height="8" rx="1"/></template>
    <template v-else-if="name === 'refresh'"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9A7 7 0 0 1 18 6l2 2M18.5 15A7 7 0 0 1 6 18l-2-2"/></template>
    <template v-else-if="name === 'image'"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4.5 17 5-5 4 3 3-3 3.5 3.5"/></template>
    <template v-else-if="name === 'video'"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4V8z"/></template>
    <template v-else-if="name === 'text'"><path d="M5 6h14M12 6v13M9 19h6M4 10V6M20 10V6"/></template>
    <template v-else-if="name === 'more'"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></template>
    <template v-else-if="name === 'chevron'"><path d="m7 10 5 5 5-5"/></template>
    <template v-else-if="name === 'close'"><path d="M6 6l12 12M18 6 6 18"/></template>
    <template v-else-if="name === 'search'"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></template>
    <template v-else-if="name === 'layers'"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></template>
    <template v-else-if="name === 'trash'"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v6m4-6v6"/></template>
    <template v-else-if="name === 'settings'"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M22 12h-2M4 12H2m17.1-7.1-1.5 1.5M6.4 17.6l-1.5 1.5m14.2 0-1.5-1.5M6.4 6.4 4.9 4.9"/></template>
    <template v-else-if="name === 'info'"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></template>
    <template v-else-if="name === 'back'"><path d="m15 5-7 7 7 7M9 12h13"/></template>
    <template v-else-if="name === 'external'"><path d="M8 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3M14 3h7v7m0-7-11 11"/></template>
    <template v-else-if="name === 'spark'"><path d="m12 2 1.9 7.8L22 12l-8.1 2.2L12 22l-2-7.8L2 12l8-2.2L12 2Z"/></template>
  </svg>
</template>
<script setup lang="ts">
defineProps<{name:'projects'|'canvas'|'plus'|'minus'|'fit'|'refresh'|'image'|'video'|'text'|'more'|'chevron'|'close'|'search'|'layers'|'trash'|'settings'|'info'|'back'|'external'|'spark'}>();
</script>
<style scoped>.studioIcon{width:19px;height:19px;display:block;flex:none}</style>
