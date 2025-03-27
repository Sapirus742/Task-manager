<template>
  <div>
    <!-- Пустое состояние -->
    <div v-if="projects.length === 0" class="empty-state">
      <q-icon name="info" size="xl" />
      <p>Нет проектов.</p>
    </div>

    <!-- Список проектов -->
    <div class="projects-grid">
      <div
        class="project-card"
        v-for="project in projects"
        :key="project.id"
      >
        <div @click="$emit('open-details', project)">
          <h2 class="project-heading"><strong>{{ project.name }}</strong></h2>
          <p class="project-description">{{ project.solution }}</p>

          <div class="project-initiator">
            <q-icon name="person" class="q-mr-sm" />
            <strong>Заказчик:&nbsp;</strong> {{ project.customer }}
          </div>

          <div class="project-status">
            <div class="status-item">
              <q-icon name="people" class="q-mr-sm" />
              <span>Команда до {{ project.maxUsers }} человек</span>
            </div>
          </div>

          <div class="technologies">
            <q-chip
              v-for="tech in project.stack"
              :key="tech"
              :class="getTechClass(tech)"
              size="sm"
            >
              {{ tech }}
            </q-chip>
          </div>
        </div>

        <q-btn
          v-if="canDeleteProject(project)"
          flat
          color="negative"
          icon="delete"
          @click.stop="$emit('delete-project', project.id)"
          class="delete-btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectDto, SecuredUser } from '../../../../backend/src/common/types';
import { Role } from '../../../../backend/src/common/types';

const props = defineProps<{
  projects: ProjectDto[];
  loading?: boolean;
  currentUser?: SecuredUser;
}>();

defineEmits(['open-details', 'delete-project']);

const canDeleteProject = (project: ProjectDto) => {
  if (!props.currentUser) return false;
  
  if (props.currentUser.roles.includes(Role.admin) || 
      props.currentUser.roles.includes(Role.directorate)) {
    return true;
  }
  
  if (props.currentUser.roles.includes(Role.customer)) {
    return project.initiator.id === props.currentUser.id;
  }
  
  return false;
};

const getTechClass = (tech: string) => {
  const programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java'];
  const databases = ['PostgreSQL', 'MySQL', 'MongoDB'];
  const tools = ['Git', 'Docker', 'Kubernetes'];

  if (programmingLanguages.includes(tech)) return 'tech-green';
  if (databases.includes(tech)) return 'tech-orange';
  if (tools.includes(tech)) return 'tech-red';
  return '';
};
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.project-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.project-heading {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 8px;
}

.project-heading strong {
  font-weight: bold;
}

.project-description {
  margin: 8px 0;
}

.project-initiator {
  margin: 8px 0;
  display: flex;
  align-items: center;
  font-weight: bold;
}

.project-initiator strong {
  margin-right: 4px;
}

.project-status {
  margin-top: 10px;
  display: flex;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
}

.technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.empty-state {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.tech-green {
  background-color: #66bb6a !important;
}

.tech-orange {
  background-color: #ffa726 !important;
}

.tech-red {
  background-color: #ef5350 !important;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>