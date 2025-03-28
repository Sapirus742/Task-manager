<template>
  <q-page class="flex flex-column">
    <div class="projects-container">
      <div class="header">
        <h1 class="project-title">Проекты</h1>
        <q-btn
          v-if="mainStore.canCreateProject()"
          label="Создать проект"
          color="primary"
          @click="showCreateDialog = true"
          class="q-mb-md"
        />
      </div>

      <ProjectsList 
        :projects="projects" 
        :loading="loading"
        :current-user="mainStore.getCurrentUser()"
        @open-details="openProjectDetails"
        @delete-project="confirmDelete"
      />

      <CreateProjectDialog 
        v-model="showCreateDialog" 
        @create="addProject" 
      />

      <ProjectDetailsDialog 
        ref="projectDetailsDialog" 
      />

      <DeleteConfirmationDialog
        v-model="showDeleteDialog"
        @confirm="handleDelete"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMainStore } from 'src/stores/main-store';
import ProjectsList from './ProjectsList.vue';
import CreateProjectDialog from './CreateProjectDialog.vue';
import ProjectDetailsDialog from './ProjectDetailsDialog.vue';
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue';
import type { ProjectDto } from '../../../../backend/src/common/types';
import { getAll, remove } from 'src/api/project.api';

const mainStore = useMainStore();
const projects = ref<ProjectDto[]>([]);
const loading = ref(false);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const projectDetailsDialog = ref();
const projectIdToDelete = ref<number | null>(null);

const loadProjects = async () => {
  try {
    loading.value = true;
    const data = await getAll();
    if (data) projects.value = data;
  } catch (error) {
    console.error('Ошибка при загрузке проектов:', error);
  } finally {
    loading.value = false;
  }
};

const addProject = (newProject: ProjectDto) => {
  projects.value.unshift(newProject);
};

const openProjectDetails = (project: ProjectDto) => {
  projectDetailsDialog.value.open(project);
};

const confirmDelete = (projectId: number) => {
  projectIdToDelete.value = projectId;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  if (projectIdToDelete.value !== null) {
    try {
      await remove(projectIdToDelete.value);
      projects.value = projects.value.filter(p => p.id !== projectIdToDelete.value);
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
    } finally {
      showDeleteDialog.value = false;
      projectIdToDelete.value = null;
    }
  }
};

onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
.projects-container {
  width: 80%;
  margin: 20px auto 0;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
}

.project-title {
  font-size: 60px;
  margin: 0;
}

@media (max-width: 768px) {
  .projects-container {
    width: 90%;
  }
  
  .project-title {
    font-size: 48px;
  }
}
</style>