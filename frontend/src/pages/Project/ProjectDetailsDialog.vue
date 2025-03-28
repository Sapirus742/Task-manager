<template>
  <q-dialog v-model="showDialog" persistent>
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
          <q-chip v-if="project?.initiator?.roles" size="sm" color="primary" text-color="white">
            {{ project.initiator.roles.join(', ') }}
          </q-chip>
        </div>

        <q-tabs 
          v-model="tab" 
          dense 
          active-color="primary" 
          indicator-color="primary" 
          class="q-mb-md"
        >
          <q-tab name="description" label="Описание" />
          <q-tab name="team" label="Команда" />
          <q-tab name="details" label="Детали" />
        </q-tabs>

        <div class="panels-container">
          <q-tab-panels v-model="tab" animated style="height: 100%;">
            <!-- Вкладка с описанием проекта -->
            <q-tab-panel name="description">
              <div class="description-section panel-content">
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Проблема</h3>
                <p class="q-mb-sm">{{ project?.problem || 'Не указана' }}</p>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Решение</h3>
                <p class="q-mb-sm">{{ project?.solution || 'Не указано' }}</p>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Ожидаемый результат</h3>
                <p>{{ project?.result || 'Не указан' }}</p>
              </div>
            </q-tab-panel>

            <!-- Вкладка с информацией о команде -->
            <q-tab-panel name="team">
  <div class="team-section panel-content">
    <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Команда проекта</h3>
    
    <template v-if="currentTeam">
      <!-- Название команды и статус -->
      <div class="team-name q-mb-md">
        <q-icon name="groups" class="q-mr-sm" />
        <strong>Команда:</strong> {{ currentTeam.name }}
        <q-chip size="sm" :color="currentTeam.privacy === 'Close' ? 'negative' : 'positive'" text-color="white">
          {{ currentTeam.privacy === 'Close' ? 'Закрытая' : 'Открытая' }}
        </q-chip>
        <q-chip size="sm" color="info" text-color="white">
          {{ currentTeam.status }}
        </q-chip>
      </div>
      
      <!-- Описание команды -->
      <div v-if="currentTeam.description" class="q-mb-md">
        <h4 class="text-subtitle2 text-weight-bold q-mb-xs">Описание команды:</h4>
        <p>{{ currentTeam.description }}</p>
      </div>

      <!-- Участники команды (показываем только если есть участники) -->
      <template v-if="currentTeam.user?.length > 0 || currentTeam.user_leader">
        <div class="members-container q-pa-sm bg-grey-2 rounded-borders q-mb-md">
          <!-- Владелец команды -->
          <div class="member-item owner row items-center q-mb-xs" v-if="currentTeam.user_owner">
            <div class="col">
              <span class="text-weight-medium">
                {{ currentTeam.user_owner.firstname }} {{ currentTeam.user_owner.lastname }}
              </span>
              <q-badge color="teal" class="q-ml-sm">Владелец</q-badge>
            </div>
            <div v-if="currentTeam.user_owner.email" class="col-auto text-caption text-grey">
              {{ currentTeam.user_owner.email }}
            </div>
          </div>

          <!-- Тимлид (если не владелец) -->
          <div 
            v-if="teamLeader && teamLeader.id !== currentTeam.user_owner?.id"
            class="member-item leader row items-center q-mb-xs"
          >
            <div class="col">
              <span class="text-weight-medium">
                {{ teamLeader.firstname }} {{ teamLeader.lastname }}
              </span>
              <q-badge color="primary" class="q-ml-sm">Тимлид</q-badge>
            </div>
            <div v-if="teamLeader.email" class="col-auto text-caption text-grey">
              {{ teamLeader.email }}
            </div>
          </div>

          <!-- Остальные участники -->
          <template v-if="teamMembers.length > 0">
            <div 
              v-for="member in teamMembers" 
              :key="member.id" 
              class="member-item row items-center q-mb-xs"
            >
              <div class="col">
                <span>{{ member.firstname }} {{ member.lastname }}</span>
              </div>
              <div v-if="member.email" class="col-auto text-caption text-grey">
                {{ member.email }}
              </div>
            </div>
          </template>
        </div>
      </template>
    </template>
    
    <div v-else class="text-grey">
      Команда еще не сформирована
    </div>
  </div>
</q-tab-panel>
            <!-- Вкладка с техническими деталями -->
            <q-tab-panel name="details">
              <div class="details-section panel-content">
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Технологии</h3>
                <div class="tech-stack q-mb-sm">
                  <template v-if="project?.stack?.length">
                    <q-chip 
                      v-for="tech in project.stack" 
                      :key="tech" 
                      color="primary" 
                      text-color="white" 
                      size="sm"
                    >
                      {{ tech }}
                    </q-chip>
                  </template>
                  <span v-else class="text-grey">Не указаны</span>
                </div>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Ресурсы</h3>
                <p class="q-mb-sm">{{ project?.resource || 'Не указаны' }}</p>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Заказчик</h3>
                <p class="q-mb-sm">{{ project?.customer || 'Не указан' }}</p>
                
                <h3 class="text-subtitle1 text-weight-bold q-mb-xs">Максимальное количество участников</h3>
                <p>{{ project?.maxUsers || 'Не указано' }}</p>
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
import { ref, computed, nextTick } from 'vue';
import { StatusProject } from '../../../../backend/src/common/types';
import type { ProjectDto, SecuredUser } from '../../../../backend/src/common/types';
import { getTeamByProjectId } from 'src/api/team.api';

const showDialog = ref(false);
const project = ref<ProjectDto>();
const tab = ref('description');
const maxHeight = ref(0);

// Вычисляемые свойства для работы с командой
const currentTeam = computed(() => project.value?.teams?.[0]);
const teamLeader = computed(() => currentTeam.value?.user_leader);
const teamMembers = computed(() => {
  if (!currentTeam.value?.user?.length) return [];
  
  // Фильтруем участников, исключая владельца и тимлида (если они есть)
  const members = currentTeam.value.user as SecuredUser[];
  return members.filter(member => {
    const isOwner = member.id === currentTeam.value?.user_owner?.id;
    const isLeader = teamLeader.value && member.id === teamLeader.value.id;
    return !isOwner && !isLeader;
  });
});

const getStatusColor = (status?: string) => {
  switch (status) {
    case StatusProject.searchTeam: return 'orange';
    case StatusProject.teamFound: return 'green';
    default: return 'grey';
  }
};

const formatDate = (date?: Date) => {
  if (!date) return 'Не указана';
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

const open = async (projectData: ProjectDto) => {
  project.value = projectData;
  
  // Если команда не загружена, загружаем её отдельно
  if (!projectData.teams || projectData.teams.length === 0) {
    try {
      if (projectData.id) {
        const teamData = await getTeamByProjectId(projectData.id);
        if (teamData) {
          project.value.teams = [teamData];
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки команды:', error);
    }
  }
  
  showDialog.value = true;
  calculateMaxHeight();
};

defineExpose({ open });
</script>

<style scoped>
.project-details-card {
  width: 750px;
  max-width: 90vw;
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

/* Стили для участников команды */
.members-container {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.member-item {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.member-item:last-child {
  border-bottom: none;
}

.member-item.leader {
  background-color: rgba(25, 118, 210, 0.05);
  border-left: 3px solid #1976d2;
}

.member-item.owner {
  background-color: rgba(0, 150, 136, 0.05);
  border-left: 3px solid #009688;
}

.team-name {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 6px;
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
  
  .project-title {
    font-size: 1.1rem;
    line-height: 1.4;
  }
  
  .team-name {
    flex-wrap: wrap;
  }
}
</style>