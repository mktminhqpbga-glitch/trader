<template>
  <article
    ref="nodeRoot"
    class="studioNode"
    :class="['node-' + type, { selected, 'prompt-open': promptExpanded, 'menu-open': menuOpen }]"
    :data-map-id="mapId"
    :data-node-id="id"
  >
    <Handle
      v-if="type !== 'text'"
      id="input"
      type="target"
      :position="Position.Left"
      class="nodeHandle inputHandle"
      :data-map-id="'AC.' + type.toUpperCase() + '.INPUT'"
    />

    <!-- The selected-node toolbar belongs to this node, not the viewport. -->
    <div v-if="selected" class="nodeContextBar nodrag nowheel" data-map-id="AC.UI.NODE.ACTIONS" @pointerdown.stop @mousedown.stop @click.stop>
      <button type="button" class="contextAction" data-map-id="AC.UI.NODE.EDIT" aria-label="Chỉnh sửa nội dung node" title="Chỉnh sửa" @click.stop="focusPrompt">
        <svg viewBox="0 0 20 20" aria-hidden="true" fill="none">
          <path d="m4.3 13.4 8.8-8.8 2.4 2.4-8.8 8.8-3.1.7.7-3.1Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Sửa</span>
      </button>
      <span class="contextDivider" aria-hidden="true"></span>
      <button
        type="button"
        class="contextAction iconOnly"
        data-map-id="AC.UI.NODE.CONTEXT.TOGGLE"
        :aria-expanded="menuOpen"
        :aria-controls="menuId"
        aria-label="Tùy chọn node"
        title="Tùy chọn"
        @click.stop="toggleMenu"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
          <circle cx="4.2" cy="10" r="1.35" /><circle cx="10" cy="10" r="1.35" /><circle cx="15.8" cy="10" r="1.35" />
        </svg>
      </button>
    </div>

    <header class="nodeHeader node-drag-handle">
      <div class="nodeIdentity">
        <span class="nodeTypeIcon" aria-hidden="true">
          <svg v-if="type === 'text'" viewBox="0 0 24 24" fill="none">
            <path d="M6 7.5h12M6 12h10M6 16.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <svg v-else-if="type === 'image'" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2.4" stroke="currentColor" stroke-width="1.6" />
            <circle cx="9" cy="10" r="1.55" stroke="currentColor" stroke-width="1.6" />
            <path d="m5 17 5-4.5 3.2 2.5 2.5-2.3 3.3 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5" width="17" height="14" rx="2.2" stroke="currentColor" stroke-width="1.6" />
            <path d="M7.5 5v14M16.5 5v14M4 10h3.5M4 14h3.5M16.5 10H20M16.5 14H20" stroke="currentColor" stroke-width="1.4" />
          </svg>
        </span>
        <div class="nodeIdentityText">
          <strong>{{ nodeTitle }}</strong>
          <small>{{ type === 'text' ? 'NỘI DUNG' : type === 'image' ? 'HÌNH ẢNH' : 'CHUYỂN ĐỘNG' }}</small>
        </div>
      </div>
      <button
        type="button"
        ref="menuToggleButton"
        class="nodeMenuToggle nodrag"
        data-map-id="AC.UI.NODE.MENU.TOGGLE"
        :aria-controls="menuId"
        :aria-expanded="menuOpen"
        :aria-label="'Mở tùy chọn ' + nodeTitle"
        title="Tùy chọn node"
        @pointerdown.stop
        @mousedown.stop
        @click.stop="toggleMenu"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
          <circle cx="4.2" cy="10" r="1.35" /><circle cx="10" cy="10" r="1.35" /><circle cx="15.8" cy="10" r="1.35" />
        </svg>
      </button>
    </header>

    <!-- Canonical DELETE MapID remains on the actual three-dot menu command. -->
    <div
      v-if="menuOpen"
      :id="menuId"
      class="nodeMenu nodrag nowheel"
      role="menu"
      :aria-label="'Tùy chọn ' + nodeTitle"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
      @keydown.esc.stop="closeMenuFromKeyboard"
    >
      <button type="button" role="menuitem" class="menuItem" data-map-id="AC.UI.NODE.MENU.EDIT" @click.stop="focusPrompt">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m4.3 13.4 8.8-8.8 2.4 2.4-8.8 8.8-3.1.7.7-3.1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
        </svg>
        Chỉnh sửa prompt
      </button>
      <button type="button" role="menuitem" class="menuItem danger" data-map-id="AC.CANVAS.NODE.DELETE" @click.stop="requestDelete">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 6h10M8 6V4.5h4V6M7 8v6M10 8v6M13 8v6M6 6l.8 10h6.4L14 6" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Xóa node
      </button>
    </div>

    <div class="nodeBody">
      <!-- Media keeps a visible one-line editable textarea, expanded by click. -->
      <div v-if="type !== 'text'" class="nodePromptHeading">
        <label :for="promptId">Mô tả</label>
        <button
          type="button"
          class="promptExpand nodrag"
          data-map-id="AC.UI.NODE.PROMPT.EXPAND"
          :aria-controls="promptId"
          :aria-expanded="promptExpanded"
          :aria-label="promptExpanded ? 'Thu gọn mô tả' : 'Mở rộng mô tả'"
          @pointerdown.stop
          @mousedown.stop
          @click.stop="togglePrompt"
        >
          <span>{{ promptExpanded ? 'Thu gọn' : 'Mở rộng' }}</span>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" :class="{ rotated: promptExpanded }">
            <path d="m5.5 7.5 4.5 4.5 4.5-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <label v-else class="srOnly" :for="promptId">Văn bản đầu vào</label>
      <textarea
        :id="promptId"
        ref="promptTextarea"
        class="nodePrompt nodrag nowheel"
        :class="{ expanded: promptExpanded }"
        :data-map-id="promptMapId"
        :data-node-id="id"
        :aria-label="type === 'text' ? 'Văn bản đầu vào' : 'Prompt ' + nodeTitle"
        :value="data.content"
        :placeholder="placeholder"
        :rows="type === 'text' || !promptExpanded ? 1 : 4"
        spellcheck="false"
        @input="updateContent"
        @pointerdown.stop
        @mousedown.stop
        @touchstart.stop
        @wheel.stop
      />
      <section
        v-if="type !== 'text'"
        class="nodeResult"
        :data-map-id="'AC.' + type.toUpperCase() + '.RESULT'"
        aria-label="Trạng thái tạo nội dung"
      >
        <span class="resultIndicator" aria-hidden="true"></span>
        <span>Chưa có kết quả — Chưa kết nối AI</span>
      </section>
    </div>
    <Handle
      v-if="type !== 'video'"
      id="output"
      type="source"
      :position="Position.Right"
      class="nodeHandle outputHandle"
      :data-map-id="'AC.' + type.toUpperCase() + '.OUTPUT'"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import { Handle, Position, type NodeProps, useVueFlow } from "@vue-flow/core";
import type { CanvasNodeData, CanvasNodeType } from "../types/canvas";

const props = defineProps<NodeProps<CanvasNodeData, Record<string, never>, CanvasNodeType>>();
const { removeNodes, updateNodeData } = useVueFlow();

const nodeRoot = ref<HTMLElement | null>(null);
const menuToggleButton = ref<HTMLButtonElement | null>(null);
const promptTextarea = ref<HTMLTextAreaElement | null>(null);
const menuOpen = ref(false);
const promptExpanded = ref(false);
const type = computed(() => props.type as CanvasNodeType);
const mapId = computed(() => 'AC.' + type.value.toUpperCase() + '.NODE');
const promptMapId = computed(() => 'AC.' + type.value.toUpperCase() + '.PROMPT');
const promptId = computed(() => props.id + '-prompt');
const menuId = computed(() => props.id + '-node-menu');
const nodeTitle = computed(() => type.value === 'text' ? 'Văn bản' : type.value === 'image' ? 'Tạo ảnh' : 'Tạo video');
const placeholder = computed(() => type.value === 'text'
  ? 'Nhập nội dung...'
  : type.value === 'image' ? 'Mô tả hình ảnh cần tạo...' : 'Mô tả chuyển động, góc máy...');

// A narrow Text node starts at one line, growing only when content needs room.
function fitTextPrompt() {
  const input = promptTextarea.value;
  if (!input || type.value !== 'text') return;
  input.style.height = 'auto';
  const measuredHeight = input.scrollHeight;
  input.style.height = Math.min(172, Math.max(38, measuredHeight)) + 'px';
  input.style.overflowY = measuredHeight > 172 ? 'auto' : 'hidden';
}

function updateContent(event: Event) {
  updateNodeData(props.id, { content: (event.target as HTMLTextAreaElement).value });
  fitTextPrompt();
}

function closeMenu() { menuOpen.value = false; }
function toggleMenu() { menuOpen.value = !menuOpen.value; }
async function closeMenuFromKeyboard() {
  closeMenu();
  await nextTick();
  menuToggleButton.value?.focus();
}

function onDocumentPointerDown(event: PointerEvent) {
  if (menuOpen.value && !nodeRoot.value?.contains(event.target as Node)) closeMenu();
}

async function focusPrompt() {
  closeMenu();
  if (type.value !== 'text') promptExpanded.value = true;
  await nextTick();
  promptTextarea.value?.focus();
}

async function togglePrompt() {
  if (type.value === 'text') return;
  promptExpanded.value = !promptExpanded.value;
  if (promptExpanded.value) {
    await nextTick();
    promptTextarea.value?.focus();
  }
}

async function requestDelete() {
  closeMenu();
  try {
    await ElMessageBox.confirm(
      'Node và các kết nối liên quan sẽ bị xóa khỏi Canvas.',
      'Xóa node?',
      { type: 'warning', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' },
    );
    removeNodes([props.id]);
  } catch {
    // Cancelling the confirmation never mutates the Vue Flow node list.
  }
}

watch(() => props.data.content, () => { void nextTick(fitTextPrompt); });
watch(() => props.selected, (selected) => { if (!selected) closeMenu(); });
// Canvases can contain many nodes; only listen globally while menu is open.
watch(menuOpen, (opened) => {
  if (opened) document.addEventListener('pointerdown', onDocumentPointerDown, true);
  else document.removeEventListener('pointerdown', onDocumentPointerDown, true);
});
onMounted(() => {
  void nextTick(fitTextPrompt);
});
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown, true));
</script>

<style scoped>
.studioNode {
  --node-accent: #a89aca;
  position: relative;
  width: 276px;
  overflow: visible;
  border: 1px solid var(--ac-line, #3b3944);
  border-radius: 12px;
  background: var(--ac-surface-2, #202126);
  color: var(--ac-text, #f1eff5);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  transition: border-color .14s ease, box-shadow .14s ease;
}
.studioNode.node-text { width: 270px; }
.studioNode.node-video { --node-accent: #b39bc9; }
.studioNode:hover, .studioNode:focus-within { border-color: #676070; }
.studioNode.selected { border-color: var(--ac-accent, #a69af6); box-shadow: 0 0 0 2px rgb(166 154 246 / 14%), 0 12px 30px rgb(0 0 0 / 26%); }

.nodeHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 6px 8px 6px 10px;
  border-radius: 11px 11px 0 0;
  border-bottom: 1px solid rgb(255 255 255 / 5%);
  background: var(--ac-surface-3, #2a2b31);
  cursor: grab;
  user-select: none;
}
.nodeHeader:active { cursor: grabbing; }
.nodeIdentity { display: flex; align-items: center; gap: 8px; min-width: 0; pointer-events: none; }
.nodeTypeIcon {
  display: grid;
  place-items: center;
  flex: 0 0 25px;
  height: 25px;
  border: 1px solid rgb(166 154 246 / 14%);
  border-radius: 7px;
  background: rgb(166 154 246 / 9%);
  color: var(--node-accent);
}
.nodeTypeIcon svg { display: block; width: 16px; height: 16px; }
.nodeIdentityText { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.nodeIdentityText strong {
  overflow: hidden;
  color: var(--ac-text, #f1eff5);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.nodeIdentityText small { color: #827d8c; font-size: 8px; font-weight: 650; letter-spacing: .05em; white-space: nowrap; }
.nodeMenuToggle {
  display: grid;
  place-items: center;
  flex: 0 0 25px;
  height: 25px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #a9a4b0;
  cursor: pointer;
}
.nodeMenuToggle svg { width: 17px; height: 17px; }
.nodeMenuToggle:hover, .nodeMenuToggle[aria-expanded="true"] { border-color: var(--ac-line, #3d3b45); background: var(--ac-surface-2, #202126); color: var(--ac-text, #fff); }
.nodeMenuToggle:focus-visible, .contextAction:focus-visible, .menuItem:focus-visible, .promptExpand:focus-visible { outline: 2px solid var(--ac-accent, #a69af6); outline-offset: 2px; }

.nodeBody { padding: 9px 10px 10px; }
.nodePrompt {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 36px;
  max-height: 240px;
  padding: 8px 10px;
  resize: none;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid var(--ac-line, #3c3b44);
  border-radius: 8px;
  outline: none;
  background: var(--ac-surface, #18191d);
  color: var(--ac-text, #eae8ef);
  font: 11px/1.55 var(--ac-font, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  caret-color: var(--ac-accent, #a69af6);
  scrollbar-width: thin;
}
.nodePrompt::placeholder { color: #787480; opacity: 1; }
.nodePrompt:hover { border-color: #645d70; }
.nodePrompt:focus { border-color: var(--ac-accent, #a69af6); box-shadow: 0 0 0 2px rgb(166 154 246 / 14%); }
.node-text .nodePrompt { min-height: 38px; max-height: 172px; }
.nodePromptHeading { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 20px; margin: -3px 0 6px; }
.nodePromptHeading label { color: #a9a4ae; font-size: 10px; font-weight: 600; }
.promptExpand {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 0 2px 4px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #a59bbc;
  font-size: 9px;
  cursor: pointer;
}
.promptExpand:hover { color: #d1beef; }
.promptExpand svg { width: 15px; height: 15px; transition: transform .14s ease; }
.promptExpand svg.rotated { transform: rotate(180deg); }
.node-image .nodePrompt:not(.expanded), .node-video .nodePrompt:not(.expanded) { height: 34px; min-height: 34px; max-height: 34px; white-space: nowrap; }
.node-image .nodePrompt.expanded, .node-video .nodePrompt.expanded { min-height: 105px; max-height: 240px; resize: vertical; white-space: pre-wrap; }

.nodeResult {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 9px;
  padding: 7px 8px;
  border: 1px solid rgb(255 255 255 / 4%);
  border-radius: 7px;
  background: rgb(8 8 11 / 13%);
  color: var(--ac-muted, #95949f);
  font-size: 9.5px;
  line-height: 1.4;
}
.resultIndicator { flex: 0 0 6px; height: 6px; border-radius: 50%; background: #777282; }
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  padding: 0;
  border: 0;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.nodeContextBar {
  position: absolute;
  z-index: 35;
  top: -36px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 29px;
  padding: 3px 4px;
  border: 1px solid var(--ac-line, #3b3944);
  border-radius: 8px;
  background: #29272f;
  box-shadow: 0 7px 20px rgb(0 0 0 / 24%);
}
.contextAction {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 23px;
  padding: 0 6px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #c9c1d1;
  font: 10px/1 var(--ac-font, sans-serif);
  cursor: pointer;
}
.contextAction:hover { background: rgb(166 154 246 / 14%); color: #fff; }
.contextAction svg { width: 14px; height: 14px; }
.contextAction.iconOnly { width: 24px; justify-content: center; padding: 0; }
.contextDivider { height: 15px; width: 1px; background: #45414d; }
.nodeMenu {
  position: absolute;
  z-index: 45;
  top: 39px;
  right: 7px;
  width: 166px;
  padding: 4px;
  border: 1px solid #494550;
  border-radius: 9px;
  background: #2c2a33;
  box-shadow: 0 14px 32px rgb(0 0 0 / 32%);
}
.menuItem {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #e5dfea;
  font: 11px/1.2 var(--ac-font, sans-serif);
  text-align: left;
  cursor: pointer;
}
.menuItem svg { flex: 0 0 15px; width: 15px; height: 15px; }
.menuItem:hover { background: rgb(255 255 255 / 7%); }
.menuItem.danger { color: #edacb8; }
.menuItem.danger:hover { background: #443038; }

.nodeHandle {
  width: 12px;
  height: 12px;
  border: 2px solid #232127;
  border-radius: 50%;
  background: var(--node-accent);
  box-shadow: 0 0 0 1px #8a799d;
  transition: box-shadow .14s ease, background .14s ease;
}
.nodeHandle:hover, .nodeHandle:focus-visible { background: #d0baff; box-shadow: 0 0 0 4px rgb(166 154 246 / 23%); }
</style>
