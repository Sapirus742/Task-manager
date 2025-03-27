<template>
  <q-dialog v-model="showDialog">
    <q-card class="project-details-card">
      <q-card-section>
        <div class="project-title-wrapper">
          <h2 class="text-h5 text-weight-bold q-mb-md project-title">{{ project?.name }}</h2>
        </div>

        <!-- Блок с инициатором -->
        <div class="initiator-section q-mb-md">
          <q-icon name="person" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Инициатор: </span>
          <span>{{ project?.initiator?.firstname }} {{ project?.initiator?.lastname }}</span>
          <q-chip v-if="project?.initiator.roles" size="sm" color="primary" text-color="white">
            {{ project.initiator.roles.join(', ') }}
          </q-chip>
        </div>

        <q-tabs v-model="tab" dense active-color="primary" indicator-color="primary" class="q-mb-md">
          <q-tab name="description" label="Описание" />
          <q-tab name="team" label="Команда" />
          <q-tab name="details" label="Детали" />
        </q-tabs>

        <div class="panels-container">
          <q-tab-panels v-model="tab" animated style="height: 100%;">
            <q-tab-panel name="description">
              <div class="description-section panel-content">
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Проблема</h3>
                <p class="q-mb-sm">{{ project?.problem }}</p>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Решение</h3>
                <p class="q-mb-sm">{{ project?.solution }}</p>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Ожидаемый результат</h3>
                <p>{{ project?.result }}</p>
              </div>
            </q-tab-panel>

            <q-tab-panel name="team">
              <div class="team-section panel-content">
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Участники</h3>
                <div v-if="project?.teams?.length">
                  <!-- Список участников -->
                </div>
                <p v-else>Команда еще не сформирована</p>
              </div>
            </q-tab-panel>

            <q-tab-panel name="details">
              <div class="details-section panel-content">
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Технологии</h3>
                <div class="tech-stack q-mb-sm">
                  <q-chip v-for="tech in project?.stack" :key="tech" color="primary" text-color="white" size="sm">
                    {{ tech }}
                  </q-chip>
                </div>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Ресурсы</h3>
                <p class="q-mb-sm">{{ project?.resource }}</p>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Заказчик</h3>
                <p>{{ project?.customer }}</p>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>

      <q-card-actions class="footer-actions">
        <q-badge :color="getStatusColor(project?.status)" class="status-badge">
          {{ project?.status }}
        </q-badge>
        
        <div class="date-center">
          {{ formatDate(project?.startProject) }} - {{ formatDate(project?.stopProject) }}
        </div>
        
        <q-btn flat label="Закрыть" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { StatusProject } from '../../../../backend/src/common/types';
import type { ProjectDto } from '../../../../backend/src/common/types';

const showDialog = ref(false);
const project = ref<ProjectDto>();
const tab = ref('description');
const maxHeight = ref(0);

const getStatusColor = (status?: string) => {
  return status === StatusProject.searchTeam ? 'orange' : 'green';
};

const formatDate = (date?: Date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

const calculateMaxHeight = () => {
  nextTick(() => {
    const panels = document.querySelectorAll('.panel-content');
    let max = 0;
    panels.forEach(panel => {
      max = Math.max(max, panel.scrollHeight);
    });
    maxHeight.value = max;
  });
};

const open = (projectData: ProjectDto) => {
  project.value = projectData;
  showDialog.value = true;
  calculateMaxHeight();
};

defineExpose({ open });
</script>

<style scoped>
.project-details-card {
  width: 750px;
  display: flex;
  flex-direction: column;
}

.initiator-section {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 0.95rem;
  gap: 8px;
}

/* Стили для названия проекта с переносами */
.project-title-wrapper {
  display: block;
  width: 100%;
  word-break: break-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
}

.project-title {
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
  hyphens: auto;
  line-height: 1.3;
  display: inline;
  padding: 0;
}

.panels-container {
  min-height: 300px;
  height: v-bind(maxHeight + 'px');
  position: relative;
}

.footer-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.status-badge {
  font-size: 0.75rem;
  padding: 6px 10px;
}

.date-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #666;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.panel-content {
  padding-bottom: 20px;
}

@media (max-width: 800px) {
  .project-details-card {
    width: 90vw;
  }
  
  .panels-container {
    min-height: 200px;
    height: auto;
    max-height: 60vh;
  }
  
  .date-center {
    position: static;
    transform: none;
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
  
  .footer-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  
  /* Адаптивные стили для названия */
  .project-title {
    font-size: 1.1rem;
    line-height: 1.4;
  }
}
</style>