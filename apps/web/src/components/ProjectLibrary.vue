<template>
  <section class="projectLibrary" data-map-id="AC.UI.PROJECT.LIBRARY" aria-label="Thư viện dự án">
    <header class="libraryIntro">
      <div class="libraryHeading">
        <span class="libraryEyebrow">WORKSPACE</span>
        <h2>Dự án <span class="libraryTotal">{{ projects.length }}</span></h2>
      </div>
      <button
        type="button"
        class="libraryCreate"
        data-map-id="AC.HOME.NEW"
        :disabled="busy"
        @click="emit('new-project')"
      ><span aria-hidden="true">＋</span> Dự án mới</button>
    </header>

    <div class="libraryControls">
      <label class="librarySearch">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="10.8" cy="10.8" r="6.3" />
          <path stroke-linecap="round" d="m16 16 4 4" />
        </svg>
        <input
          v-model="query"
          type="search"
          data-map-id="AC.UI.PROJECT.SEARCH"
          aria-label="Tìm dự án"
          placeholder="Tìm dự án..."
        />
      </label>
      <span class="libraryCount">{{ filteredProjects.length }} dự án</span>
    </div>

    <div v-if="filteredProjects.length" class="projectList">
      <article
        v-for="project in filteredProjects"
        :key="project.id"
        class="projectRow"
        :class="{ 'hasOpenMenu': openProjectMenuId === project.id }"
      >
        <button
          type="button"
          class="projectItem"
          data-map-id="AC.HOME.OPEN"
          :data-project-id="project.id"
          :class="{ active: activeProjectId === project.id }"
          :disabled="busy"
          :aria-label="`Mở dự án ${project.name}`"
          @click="emit('open-project', project.id)"
        >
          <span class="projectArt" aria-hidden="true">
            <span class="canvasSketch">
              <span class="sketchChip"></span>
              <span class="sketchChip"></span>
              <span class="sketchChip"></span>
              <span class="sketchPath"></span>
            </span>
            <span class="artCaption">CANVAS</span>
          </span>
          <span class="projectInfo">
            <strong class="projectName" :title="project.name">{{ project.name }}</strong>
            <small class="projectDate">Cập nhật {{ formatDate(project.updatedAt) }}</small>
          </span>
          <span class="projectChevron" aria-hidden="true">↗</span>
        </button>
        <div class="projectMenuWrap">
          <button
            type="button"
            class="projectMenuToggle"
            data-map-id="AC.HOME.PROJECT.MENU"
            :data-project-id="project.id"
            :aria-expanded="openProjectMenuId === project.id"
            :aria-label="`Tùy chọn dự án ${project.name}`"
            :disabled="busy"
            @click.stop="emit('toggle-menu', project.id)"
          >⋯</button>
          <div
            v-if="openProjectMenuId === project.id"
            class="projectMenu"
            role="menu"
            :aria-label="`Thao tác dự án ${project.name}`"
            @keydown.esc.stop="emit('toggle-menu', project.id)"
          >
            <button type="button" role="menuitem" data-map-id="AC.HOME.PROJECT.RENAME" :data-project-id="project.id" @click.stop="emit('rename', project)">Đổi tên</button>
            <button type="button" role="menuitem" class="dangerAction" data-map-id="AC.HOME.PROJECT.DELETE" :data-project-id="project.id" @click.stop="emit('delete', project)">Chuyển vào thùng rác</button>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="emptyProjects">
      <span class="emptyGlyph" aria-hidden="true">◇</span>
      <strong>{{ query ? 'Không tìm thấy dự án' : 'Chưa có dự án' }}</strong>
      <p>{{ query ? 'Thử tên dự án khác.' : 'Tạo dự án để bắt đầu Canvas.' }}</p>
    </div>

    <section class="trashSection">
      <button
        type="button"
        class="trashToggle"
        data-map-id="AC.HOME.PROJECT.TRASH.TOGGLE"
        :aria-expanded="showDeletedProjects"
        :disabled="busy"
        @click="emit('toggle-trash')"
      ><span aria-hidden="true">▤</span> Đã xóa <span class="trashCaret" aria-hidden="true">{{ showDeletedProjects ? '⌃' : '⌄' }}</span></button>
      <div v-if="showDeletedProjects" class="trashPanel" data-map-id="AC.HOME.PROJECT.TRASH.LIST">
        <p v-if="isLoadingDeletedProjects" class="trashNotice" role="status">Đang tải dự án đã xóa...</p>
        <div v-else-if="deletedProjectsError" class="trashNotice trashError" role="alert">
          <span>{{ deletedProjectsError }}</span>
          <button type="button" data-map-id="AC.HOME.PROJECT.TRASH.RETRY" @click="emit('retry-trash')">Thử lại</button>
        </div>
        <p v-else-if="!deletedProjects.length" class="trashNotice">Không có dự án trong thùng rác.</p>
        <template v-else>
          <div v-for="project in deletedProjects" :key="project.id" class="deletedProjectRow">
            <span class="deletedProjectName" :title="project.name">{{ project.name }}</span>
            <button type="button" class="restoreProjectButton" data-map-id="AC.HOME.PROJECT.RESTORE" :data-project-id="project.id" :disabled="busy" :aria-label="`Khôi phục dự án ${project.name}`" @click="emit('restore', project.id)">Khôi phục</button>
          </div>
        </template>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ProjectSummary } from "../types/canvas";

const props = defineProps<{
  projects: ProjectSummary[];
  deletedProjects: ProjectSummary[];
  activeProjectId: string | null;
  openProjectMenuId: string | null;
  showDeletedProjects: boolean;
  isLoadingDeletedProjects: boolean;
  deletedProjectsError: string;
  busy: boolean;
  formatDate: (date: string) => string;
}>();

const emit = defineEmits<{
  "new-project": [];
  "open-project": [id: string];
  "toggle-menu": [id: string];
  "rename": [project: ProjectSummary];
  "delete": [project: ProjectSummary];
  "toggle-trash": [];
  "retry-trash": [];
  "restore": [id: string];
}>();
const query = ref("");
const filteredProjects = computed(() => {
  const term = query.value.trim().toLocaleLowerCase("vi-VN");
  return props.projects.filter(project => project.name.toLocaleLowerCase("vi-VN").includes(term));
});
</script>

<style scoped>
.projectLibrary{width:100%;max-width:990px;margin:0 auto;color:var(--ac-text,#f1eff5)}
.projectLibrary{--library-accent:#9bbba8}
.libraryIntro{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px}
.libraryHeading{min-width:0}
.libraryEyebrow{font-size:9px;font-weight:700;letter-spacing:.15em;color:var(--ac-muted,#95949f)}
.libraryHeading h2{display:flex;align-items:center;gap:9px;margin:4px 0 0;font-size:19px;font-weight:630;letter-spacing:-.035em;line-height:1.3}
.libraryTotal{display:inline-flex;align-items:center;justify-content:center;min-width:23px;height:21px;padding:0 5px;border:1px solid var(--ac-line,#303039);border-radius:6px;color:var(--ac-muted,#95949f);font-size:10px;font-weight:600;letter-spacing:0}
.libraryCreate{display:flex;align-items:center;justify-content:center;gap:5px;flex:none;min-height:32px;padding:6px 10px;border:1px solid #496153;border-radius:8px;background:#29372e;color:#e3f1e8;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer;box-shadow:none}
.libraryCreate>span{font-size:16px;font-weight:400;line-height:1}
.libraryCreate:hover:not(:disabled){border-color:var(--library-accent);background:#345140}
.libraryCreate:disabled{opacity:.45;cursor:wait}
.libraryControls{display:flex;align-items:center;gap:12px;justify-content:space-between;margin:0 0 15px}
.librarySearch{display:flex;align-items:center;gap:9px;flex:1;max-width:330px;height:33px;padding:0 10px;border:1px solid var(--ac-line,#303039);border-radius:8px;background:var(--ac-surface,#18191d);color:var(--ac-muted,#95949f)}
.librarySearch svg{width:15px;height:15px;flex:none}
.librarySearch input{flex:1;min-width:0;width:100%;border:0;outline:none;background:transparent;color:var(--ac-text,#f1eff5);font:inherit;font-size:11px}
.librarySearch input::placeholder{color:var(--ac-muted,#95949f)}
.librarySearch:focus-within{border-color:var(--library-accent);box-shadow:0 0 0 2px #9bbba820}
.libraryCount{flex:none;color:var(--ac-muted,#95949f);font-size:10px}
.projectList{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:12px}
.projectRow{position:relative;min-width:0;min-height:0;border:1px solid var(--ac-line,#303039);border-radius:11px;background:var(--ac-surface,#18191d);overflow:visible;transition:border-color .15s ease,background .15s ease,box-shadow .15s ease}
.projectRow:hover{transform:none;border-color:#5e566a;box-shadow:0 9px 22px #00000024}
.projectRow.hasOpenMenu{z-index:70}
.projectItem{display:flex;flex-direction:column;gap:0;min-height:0;width:100%;padding:0;border:0;border-radius:10px;background:transparent;color:inherit;text-align:left;overflow:hidden;cursor:pointer}
.projectItem.active{outline:1px solid var(--library-accent);outline-offset:-1px}
.projectItem:focus-visible,.projectMenuToggle:focus-visible,.projectMenu button:focus-visible,.libraryCreate:focus-visible,.restoreProjectButton:focus-visible,.trashToggle:focus-visible{outline:2px solid var(--library-accent);outline-offset:2px}
.projectItem:disabled{opacity:.55;cursor:wait}
.projectArt{position:relative;display:grid;place-items:center;flex:none;width:100%;height:88px;border-bottom:1px solid var(--ac-line,#303039);border-radius:10px 10px 0 0;background-color:#202421;background-image:radial-gradient(#4c5b50 0.7px,transparent .7px);background-size:13px 13px;color:#99aa9c}
.canvasSketch{position:relative;display:block;width:92px;height:52px;border:1px solid #55685c;border-radius:6px;background:#262f29;box-shadow:0 4px 9px #00000028}
.sketchChip{position:absolute;display:block;width:20px;height:15px;border:1px solid #778d7d;border-radius:4px;background:#36443a}
.sketchChip:nth-child(1){top:9px;left:9px}
.sketchChip:nth-child(2){top:9px;right:9px}
.sketchChip:nth-child(3){left:35px;bottom:7px}
.sketchPath{position:absolute;top:24px;left:21px;width:48px;border-top:1px dashed #91a998;transform:rotate(10deg)}
.artCaption{position:absolute;right:10px;bottom:7px;display:block;width:auto;height:auto;padding:0;border:0;border-radius:0;background:transparent;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#87998b}
.projectInfo{display:grid;gap:5px;min-width:0;width:100%;padding:11px 34px 12px 12px}
.projectName{display:block;overflow:hidden;max-width:100%;color:var(--ac-text,#f1eff5);font-size:12px;line-height:1.3;font-weight:620;text-overflow:ellipsis;white-space:nowrap}
.projectDate{color:var(--ac-muted,#95949f);font-size:10px;line-height:1.4}
.projectChevron{position:absolute;right:13px;bottom:13px;color:#9992a1;font-size:13px}
.projectMenuWrap{position:absolute;z-index:2;right:7px;top:7px}
.projectMenuToggle{display:grid;place-items:center;width:26px;height:26px;padding:0;border:1px solid #4a4652;border-radius:7px;background:#26252ddd;color:#dad4e1;line-height:1;font-size:18px;cursor:pointer}
.projectMenuToggle:hover,.projectMenuToggle[aria-expanded=true]{border-color:var(--library-accent);background:#344138}
.projectMenuToggle:disabled{opacity:.5;cursor:wait}
.projectMenu{position:absolute;top:30px;right:0;z-index:80;min-width:168px;padding:4px;border:1px solid #514c59;border-radius:9px;background:#28262e;box-shadow:var(--ac-shadow,0 16px 40px #0007)}
.projectMenu button{display:block;width:100%;padding:9px 10px;border:0;border-radius:6px;background:transparent;color:var(--ac-text,#f1eff5);font-size:11px;text-align:left;cursor:pointer}
.projectMenu button:hover{background:#3b3644}
.projectMenu .dangerAction{color:var(--ac-danger,#e99caa)}
.projectMenu .dangerAction:hover{background:#472e37}
.emptyProjects{display:grid;justify-items:center;gap:7px;padding:26px 12px;border:1px dashed var(--ac-line,#303039);border-radius:10px;text-align:center}
.emptyGlyph{font-size:28px;color:var(--ac-muted,#95949f)}
.emptyProjects strong{font-size:12px}
.emptyProjects p{margin:0;color:var(--ac-muted,#95949f);font-size:10px}
.trashSection{margin-top:16px;padding-top:6px;border-top:1px solid var(--ac-line,#303039)}
.trashToggle{display:flex;align-items:center;gap:9px;width:100%;padding:9px 4px;border:0;border-radius:6px;background:transparent;color:var(--ac-muted,#95949f);font-size:11px;text-align:left;cursor:pointer}
.trashToggle:hover{color:var(--ac-text,#f1eff5);background:#ffffff08}
.trashCaret{margin-left:auto}
.trashPanel{display:grid;gap:6px;padding:6px 1px 9px}
.trashNotice{margin:0;color:var(--ac-muted,#95949f);font-size:11px}
.trashError{display:grid;gap:8px;color:var(--ac-danger,#e99caa)}
.trashError button{justify-self:start;padding:6px 9px;border:1px solid #6c4955;border-radius:6px;background:#3b2930;color:#ffe3e8;font-size:10px;cursor:pointer}
.deletedProjectRow{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;padding:8px 9px;border:1px solid var(--ac-line,#303039);border-radius:8px;background:var(--ac-surface-2,#202126)}
.deletedProjectName{overflow:hidden;min-width:0;color:var(--ac-text,#f1eff5);font-size:10px;text-overflow:ellipsis;white-space:nowrap}
.restoreProjectButton{flex:none;padding:5px 8px;border:1px solid #4c6458;border-radius:6px;background:#283b32;color:#a8dac0;font-size:10px;cursor:pointer}
.restoreProjectButton:hover{border-color:#80a48d;background:#324a3c}
.restoreProjectButton:disabled{opacity:.5;cursor:wait}
/* UI-02's global stylesheet deliberately restyles old library cards.
   These component-owned selectors ensure the new compact grid remains intact. */
:global(.studioShell .projectLibrary .libraryIntro){margin:0 0 14px;gap:12px;align-items:center}
:global(.studioShell .projectLibrary .libraryHeading h2){margin:4px 0 0;font-size:19px}
:global(.studioShell .projectLibrary .libraryControls){margin-bottom:15px}
:global(.studioShell .projectLibrary .projectList){grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:15px}
:global(.studioShell .projectLibrary .projectRow){border-radius:11px;background:var(--ac-surface,#18191d)}
:global(.studioShell .projectLibrary .projectArt){height:148px;background-color:#202421;background-image:radial-gradient(#4c5b50 .7px,transparent .7px);background-size:13px 13px;border-bottom:1px solid var(--ac-line,#303039)}
:global(.studioShell .projectLibrary .projectInfo){padding:11px 34px 12px 12px}
:global(.studioShell .projectLibrary .trashSection){margin-top:16px}
:global(.studioShell .projectLibrary .projectItem.active){outline-color:var(--library-accent)}
:global(.studioShell .projectLibrary .projectArt>.canvasSketch){width:114px;height:68px;border-radius:6px;background:#262f29}
:global(.studioShell .projectLibrary .projectArt>.artCaption){display:block;width:auto;height:auto;padding:0;border:0;border-radius:0;background:transparent;font-size:8px}
/* Parent drawer is narrow; keep a real compact row layout without losing card controls. */
:global(.canvasLibraryDrawer .projectLibrary .projectList){grid-template-columns:1fr;gap:8px}
:global(.canvasLibraryDrawer .projectLibrary .libraryIntro){flex-direction:row;align-items:center;gap:7px;margin-bottom:11px}
:global(.canvasLibraryDrawer .projectLibrary .libraryHeading h2){font-size:16px}
:global(.canvasLibraryDrawer .projectLibrary .libraryCreate){width:auto;min-height:30px;padding:6px 8px;font-size:10px}
:global(.canvasLibraryDrawer .projectLibrary .projectRow){min-height:0}
:global(.canvasLibraryDrawer .projectLibrary .projectItem){flex-direction:row;align-items:center;gap:9px;height:66px;min-height:0;padding:7px 32px 7px 8px}
:global(.canvasLibraryDrawer .projectLibrary .projectArt){flex:0 0 51px;width:51px;height:51px;border:1px solid var(--ac-line,#303039);border-radius:7px;background-size:11px 11px}
:global(.canvasLibraryDrawer .projectLibrary .projectArt>.canvasSketch){width:35px;height:27px;border-radius:5px}
:global(.canvasLibraryDrawer .projectLibrary .sketchChip){width:9px;height:7px;border-radius:2px}
:global(.canvasLibraryDrawer .projectLibrary .sketchChip:nth-child(1)){top:4px;left:4px}
:global(.canvasLibraryDrawer .projectLibrary .sketchChip:nth-child(2)){top:4px;right:4px}
:global(.canvasLibraryDrawer .projectLibrary .sketchChip:nth-child(3)){left:13px;bottom:3px}
:global(.canvasLibraryDrawer .projectLibrary .sketchPath){top:12px;left:7px;width:20px}
:global(.canvasLibraryDrawer .projectLibrary .artCaption){display:none}
:global(.canvasLibraryDrawer .projectLibrary .projectInfo){padding:0;gap:4px}
:global(.canvasLibraryDrawer .projectLibrary .projectName){max-width:180px;font-size:11px}
:global(.canvasLibraryDrawer .projectLibrary .projectChevron){display:none}
:global(.canvasLibraryDrawer .projectLibrary .projectMenuWrap){top:19px;right:7px}
@media(max-width:620px){
  .libraryIntro{flex-direction:row;align-items:center;gap:8px}
  .libraryHeading h2{font-size:17px}
  :global(.studioShell .projectLibrary .projectList){grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:9px}
  .projectRow{min-height:0}
  .projectItem{flex-direction:column;gap:0;padding:0;min-height:0}
  :global(.studioShell .projectLibrary .projectArt){flex:none;width:100%;height:80px;border-radius:10px 10px 0 0}
  .canvasSketch{width:92px;height:52px}
  .projectInfo{padding:10px 34px 11px 11px}
  .projectMenuWrap{right:7px;top:7px}
  :global(.canvasLibraryDrawer .projectLibrary .projectList){grid-template-columns:1fr}
  :global(.canvasLibraryDrawer .projectLibrary .projectArt){width:51px;height:51px}
}
</style>
