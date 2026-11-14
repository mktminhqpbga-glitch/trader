<template>
  <section class="projectLibrary" data-map-id="AC.UI.PROJECT.LIBRARY">
    <div class="libraryIntro">
      <div>
        <span class="eyebrow">KHÔNG GIAN SÁNG TẠO</span>
        <h2>Thư viện dự án</h2>
        <p>Tiếp tục một ý tưởng, hoặc bắt đầu từ Canvas trống.</p>
      </div>
      <button type="button" class="primaryButton libraryCreate" data-map-id="AC.HOME.NEW" :disabled="busy" @click="emit('new-project')">＋ Dự án mới</button>
    </div>
    <div class="libraryControls">
      <label class="librarySearch"><span aria-hidden="true">⌕</span><input v-model="query" type="search" aria-label="Tìm dự án" placeholder="Tìm theo tên dự án..." /></label>
      <span class="libraryCount">{{ filteredProjects.length }} dự án</span>
    </div>
    <div v-if="filteredProjects.length" class="projectList">
      <div v-for="project in filteredProjects" :key="project.id" class="projectRow">
        <button type="button" class="projectItem" data-map-id="AC.HOME.OPEN" :data-project-id="project.id" :class="{active: activeProjectId === project.id}" :disabled="busy" @click="emit('open-project',project.id)">
          <span class="projectArt" aria-hidden="true"><span>◇</span></span>
          <span class="projectInfo"><strong class="projectName">{{ project.name }}</strong><small class="projectDate">Cập nhật {{ formatDate(project.updatedAt) }}</small></span>
          <span class="projectChevron" aria-hidden="true">↗</span>
        </button>
        <div class="projectMenuWrap">
          <button type="button" class="projectMenuToggle" :data-project-id="project.id" data-map-id="AC.HOME.PROJECT.MENU" :aria-expanded="openProjectMenuId === project.id" :disabled="busy" aria-label="Tùy chọn dự án" @click.stop="emit('toggle-menu',project.id)">⋯</button>
          <div v-if="openProjectMenuId === project.id" class="projectMenu" role="menu">
            <button type="button" role="menuitem" data-map-id="AC.HOME.PROJECT.RENAME" :data-project-id="project.id" @click.stop="emit('rename',project)">Đổi tên</button>
            <button type="button" role="menuitem" class="dangerAction" data-map-id="AC.HOME.PROJECT.DELETE" :data-project-id="project.id" @click.stop="emit('delete',project)">Chuyển vào thùng rác</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="emptyProjects"><span class="emptyGlyph">◇</span><strong>{{ query ? 'Không tìm thấy dự án' : 'Chưa có dự án nào' }}</strong><p>{{ query ? 'Thử một tên khác để tìm dự án.' : 'Một Canvas trống đang chờ ý tưởng đầu tiên của bạn.' }}</p></div>
    <section class="trashSection">
      <button type="button" class="trashToggle" data-map-id="AC.HOME.PROJECT.TRASH.TOGGLE" :aria-expanded="showDeletedProjects" :disabled="busy" @click="emit('toggle-trash')"><span>▤</span> Đã xóa <span class="trashCaret">{{ showDeletedProjects ? '⌃' : '⌄' }}</span></button>
      <div v-if="showDeletedProjects" class="trashPanel" data-map-id="AC.HOME.PROJECT.TRASH.LIST">
        <p v-if="isLoadingDeletedProjects" class="trashNotice">Đang tải dự án đã xóa...</p>
        <div v-else-if="deletedProjectsError" class="trashNotice trashError"><span>{{ deletedProjectsError }}</span><button type="button" data-map-id="AC.HOME.PROJECT.TRASH.RETRY" @click="emit('retry-trash')">Thử lại</button></div>
        <p v-else-if="!deletedProjects.length" class="trashNotice">Chưa có dự án đã xóa.</p>
        <div v-for="project in isLoadingDeletedProjects || deletedProjectsError ? [] : deletedProjects" :key="project.id" class="deletedProjectRow"><span class="deletedProjectName" :title="project.name">{{ project.name }}</span><button type="button" class="restoreProjectButton" data-map-id="AC.HOME.PROJECT.RESTORE" :data-project-id="project.id" :disabled="busy" @click="emit('restore',project.id)">Khôi phục</button></div>
      </div>
    </section>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ProjectSummary } from '../types/canvas';
const props = defineProps<{
  projects: ProjectSummary[]; deletedProjects: ProjectSummary[]; activeProjectId: string | null;
  openProjectMenuId: string | null; showDeletedProjects: boolean; isLoadingDeletedProjects: boolean;
  deletedProjectsError: string; busy: boolean; formatDate: (date: string) => string;
}>();
const emit = defineEmits<{
  'new-project': []; 'open-project': [id: string]; 'toggle-menu': [id: string];
  'rename': [project: ProjectSummary]; 'delete': [project: ProjectSummary];
  'toggle-trash': []; 'retry-trash': []; 'restore': [id: string];
}>();
const query = ref('');
const filteredProjects = computed(() => props.projects.filter(p => p.name.toLocaleLowerCase('vi-VN').includes(query.value.trim().toLocaleLowerCase('vi-VN'))));
</script>
