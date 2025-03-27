<template>
  <q-page class="flex flex-column">
    <div class="projects-container">
      <!-- Заголовок и кнопка создания -->
      <div class="header-section">
        <h2 class="project-title">Команды</h2>
        <q-btn
          v-if="mainStore.canCreateTeam()"
          label="Создать команду"
          color="primary"
          @click="openCreateTeamDialog"
          class="create-btn q-mb-md"
        />
      </div>

      <!-- Фильтры -->
      <div class="filters q-mb-md">
        <q-btn-toggle
          v-model="activeFilter"
          spread
          no-caps
          toggle-color="primary"
          :options="[
            { label: 'Все', value: 'all' },
            { label: 'Открытые', value: PrivacyTeam.open },
            { label: 'Закрытые', value: PrivacyTeam.close }
          ]"
        />
      </div>

      <!-- Список команд -->
      <div class="teams-list">
        <q-card
          v-for="(team, index) in paginatedTeams"
          :key="team.id"
          class="q-mb-sm team-card"
        >
          <q-card-section 
            class="team-card-content"
            @click="toggleTeamDescription(team.id)"
          >
            <div class="team-name">
              #{{ (currentPage - 1) * itemsPerPage + index + 1 }} {{ team.name }}
            </div>
            <div class="team-actions">
              <div class="team-members-count">
                <q-icon name="people" class="q-mr-xs" />
                {{ team.user.length }} участников
              </div>
              <q-chip
                :color="team.privacy === PrivacyTeam.close ? 'negative' : 'positive'"
                text-color="white"
                class="privacy-chip"
              >
                {{ team.privacy === PrivacyTeam.close ? 'Закрытая' : 'Открытая' }}
              </q-chip>
              <q-btn
                color="primary"
                label="Открыть"
                @click.stop="openTeamDetails(team)"
                class="open-btn"
              />
            </div>
          </q-card-section>

          <!-- Раскрывающееся описание -->
          <q-slide-transition>
            <div v-show="expandedTeams.includes(team.id)">
              <q-separator />
              <q-card-section class="team-description-section">
                <div class="text-body2">
                  {{ team.description || 'Описание отсутствует' }}
                </div>
              </q-card-section>
            </div>
          </q-slide-transition>
        </q-card>
      </div>
      <!-- Пустое состояние -->
      <div v-if="teams.length === 0" class="empty-state">
        <q-icon name="info" size="xl" />
        <p>Нет команд.</p>
      </div>

      <!-- Пагинация -->
      <q-pagination
        v-if="teams.length > 0"
        v-model="currentPage"
        :max="totalPages"
        :input="true"
        class="q-mt-md"
        :max-pages="10"
      />
    </div>

    <!-- Диалог с деталями команды -->
    <q-dialog v-model="showTeamDetails">
    <q-card v-if="selectedTeam" class="team-details-card">
      <q-card-section>
        <h2 class="team-heading"><strong>{{ selectedTeam?.name }}</strong></h2>
        <p class="team-description"> <strong>Описание:</strong>&nbsp;{{ selectedTeam?.description }}</p>

        <!-- Владелец команды -->
        <div class="team-owner q-mb-md" v-if="selectedTeam?.user_owner">
          <q-icon name="person" class="q-mr-sm" />
          <strong>Создал: </strong> 
          <span class="user-info">
            {{ selectedTeam.user_owner?.firstname }} {{ selectedTeam.user_owner?.lastname }}
            <template v-if="selectedTeam.user_owner?.email">
              ({{ selectedTeam.user_owner.email }})
            </template>
          </span>
        </div>

        <!-- Участники команды -->
        <div class="team-members" v-if="selectedTeam?.user">
          <q-icon name="people" class="q-mr-sm" />
          <strong>Команда:</strong>
          <ul class="member-list">
            <!-- Владелец -->
            <li class="member-item owner" v-if="selectedTeam.user_owner">
              <div class="member-info">
                <span class="member-name">
                  {{ selectedTeam.user_owner?.firstname }} {{ selectedTeam.user_owner?.lastname }}
                  <q-badge color="teal" class="q-ml-sm">Владелец</q-badge>
                </span>
                <span class="member-email" v-if="selectedTeam.user_owner?.email">
                  <strong style="color: black">email: </strong> {{ selectedTeam.user_owner.email }}
                </span>
              </div>
            </li>

            <!-- Тимлид (если не владелец) -->
            <li 
              v-if="selectedTeam.user_leader && selectedTeam.user_leader.id !== selectedTeam.user_owner?.id"
              class="member-item leader"
            >
              <div class="member-info">
                <span class="member-name">
                  {{ selectedTeam.user_leader?.firstname }} {{ selectedTeam.user_leader?.lastname }}
                  <q-badge color="primary" class="q-ml-sm">Тимлид</q-badge>
                </span>
                <span class="member-email" v-if="selectedTeam.user_leader?.email">
                  <strong style="color: black">email: </strong> {{ selectedTeam.user_leader.email }}
                </span>
              </div>
            </li>

            <!-- Остальные участники -->
            <template v-if="selectedTeam.user?.length">
              <li 
                v-for="user in getRegularMembers(selectedTeam)" 
                :key="user.id" 
                class="member-item"
                :class="{ leader: selectedTeam.user_leader?.id === user?.id }"
              >
                <div class="member-info">
                  <span class="member-name">
                    {{ user?.firstname }} {{ user?.lastname }}
                    <q-badge 
                      v-if="selectedTeam.user_leader?.id === user?.id" 
                      color="primary" 
                      class="q-ml-sm"
                    >
                      Тимлид
                    </q-badge>
                  </span>
                  <span class="member-email" v-if="user?.email">
                    <strong style="color: black">email: </strong> {{ user.email }}
                  </span>
                </div>
              </li>
            </template>
          </ul>
        </div>

        <!-- Статус команды -->
        <div class="team-status q-mt-md">
          <q-icon name="info" class="q-mr-sm" />
          <strong>Статус:</strong>&nbsp;{{ selectedTeam?.status }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          v-if="mainStore.canEditTeam(selectedTeam)"
          flat 
          :disable="true"
          label="Редактировать" 
          color="primary" 
          @click="openEditTeamDialog(selectedTeam)" 
        />
        <q-btn 
          v-if="mainStore.canDeleteTeam(selectedTeam)"
          flat 
          label="Удалить" 
          color="negative" 
          @click="confirmDeleteTeam(selectedTeam)" 
        />
        <q-btn flat label="Закрыть" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

    <!-- Диалог создания команды -->
    <CreateTeamDialog ref="createTeamDialog" @create="addTeam" />
  </q-page>
  <EditTeamDialog ref="editTeamDialog" @update="updateTeam" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMainStore } from 'src/stores/main-store';
import { getAll, remove } from 'src/api/team.api';
import { update } from 'src/api/project.api'; // Добавляем импорт функции update
import CreateTeamDialog from './CreateTeamDialog.vue';
import EditTeamDialog from './EditTeamDialog.vue';
import { TeamDto, PrivacyTeam, StatusProject, ProjectDto } from '../../../backend/src/common/types'; // Добавляем StatusProject
import { useQuasar } from 'quasar';

// Хранилище
const mainStore = useMainStore();

// Инициализируем Quasar
const $q = useQuasar();

// Команды
const teams = ref<TeamDto[]>([]);

// Объявляем activeFilter с типом
const activeFilter = ref<string | PrivacyTeam>('all');

// Фильтрация команд
const filteredTeams = computed(() => {
  if (activeFilter.value === 'all') return teams.value;
  return teams.value.filter(team => team.privacy === activeFilter.value);
});

const getRegularMembers = (team: TeamDto) => {
  if (!team?.user || !team?.user_owner) return [];
  return team.user.filter(u => 
    u?.id !== team.user_owner?.id && 
    (!team.user_leader || u?.id !== team.user_leader?.id)
  );
};

// Добавляем массив для хранения ID раскрытых команд
const expandedTeams = ref<number[]>([]);

// Функция для переключения отображения описания
const toggleTeamDescription = (teamId: number) => {
  const index = expandedTeams.value.indexOf(teamId);
  if (index === -1) {
    expandedTeams.value.push(teamId);
  } else {
    expandedTeams.value.splice(index, 1);
  }
};

// Загрузка команд из базы данных
const loadTeams = async () => {
  try {
    const data = await getAll(); // Загружаем команды из API
    if (data) {
      teams.value = data;
    }
  } catch (error) {
    console.error('Ошибка при загрузке команд:', error);
  }
};

// Загружаем команды при монтировании компонента
onMounted(() => {
  loadTeams();
});

// Пагинация
const itemsPerPage = 4;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(teams.value.length / itemsPerPage));
const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTeams.value.slice(start, start + itemsPerPage);
});

// Логика для открытия деталей команды
const showTeamDetails = ref(false);
const selectedTeam = ref<TeamDto | null>(null);

const openTeamDetails = (team: TeamDto) => {
  selectedTeam.value = team;
  showTeamDetails.value = true;
};

// Функция подтверждения удаления
const confirmDeleteTeam = (team: TeamDto) => {
  $q.dialog({
    title: 'Подтверждение удаления',
    message: `Вы уверены, что хотите удалить команду "${team.name}"?`,
    persistent: true,
    ok: {
      label: 'Удалить',
      color: 'negative'
    },
    cancel: {
      label: 'Отмена',
      color: 'primary',
      flat: true
    }
  }).onOk(async () => {
    await deleteTeam(team.id);
  });
};

// Функция удаления команды
const deleteTeam = async (teamId: number) => {
  try {
    const teamToDelete = teams.value.find(t => t.id === teamId);
    if (!teamToDelete) {
      $q.notify({ message: 'Команда не найдена', color: 'negative' });
      return;
    }

    // Удаление команды
    await remove(teamId);
    teams.value = teams.value.filter(t => t.id !== teamId);

    // Обновление проекта (если есть)
    if (teamToDelete.project?.id) {
      try {
        const updateData = {
          status: StatusProject.searchTeam
        };
        
        console.log('Обновление проекта:', {
          projectId: teamToDelete.project.id,
          data: updateData
        });
        
        await update(teamToDelete.project.id, updateData);
        
        // Локальное обновление - исправленная версия
        teams.value.forEach(t => {
  if (t.project?.id === teamToDelete.project?.id && t.project) {
    t.project = {
      id: t.project.id,
      name: t.project.name,
      problem: t.project.problem,
      solution: t.project.solution,
      result: t.project.result,
      resource: t.project.resource,
      stack: [...t.project.stack],
      status: StatusProject.searchTeam,
      startProject: new Date(t.project.startProject),
      stopProject: new Date(t.project.stopProject),
      maxUsers: t.project.maxUsers,
      customer: t.project.customer,
      initiator: {...t.project.initiator},
      teams: [...t.project.teams]
    } as ProjectDto;
  }
});
      } catch (error) {
        console.error('Ошибка обновления проекта:', error);
        $q.notify({
          message: 'Команда удалена, но статус проекта не обновлен',
          color: 'warning'
        });
      }
    }

    $q.notify({ message: 'Команда удалена', color: 'positive' });
    showTeamDetails.value = false;
  } catch (error) {
    console.error('Ошибка удаления:', error);
    $q.notify({ message: 'Ошибка удаления команды', color: 'negative' });
  } finally {
    loadTeams();
  }
};

// Логика для создания команды
const createTeamDialog = ref();

const openCreateTeamDialog = () => {
  createTeamDialog.value.openDialog();
}

const addTeam = (newTeam: TeamDto) => {
  teams.value.push(newTeam);
}

// Добавляем ссылку на диалог редактирования
const editTeamDialog = ref();

// Метод для открытия диалога редактирования
const openEditTeamDialog = (team: TeamDto) => {
  editTeamDialog.value.openDialog(team);
  showTeamDetails.value = false;
};

// Метод для обновления списка команд после редактирования
const updateTeam = async (updatedTeam: TeamDto) => {
  try {
    // Находим индекс обновляемой команды в массиве
    const index = teams.value.findIndex(t => t.id === updatedTeam.id);
    
    if (index !== -1) {
      // Создаем новый массив с обновленной командой
      teams.value = [
        ...teams.value.slice(0, index),
        updatedTeam,
        ...teams.value.slice(index + 1)
      ];
    }
    
    // Показываем уведомление об успешном обновлении
    $q.notify({
      message: 'Команда успешно обновлена',
      color: 'positive'
    });
    
    // Перезагружаем список команд для синхронизации
    await loadTeams();
  } catch (error) {
    console.error('Ошибка обновления команды:', error);
    $q.notify({
      message: 'Ошибка обновления команды',
      color: 'negative'
    });
  }
};

</script>

<style scoped>

.member-item.leader {
  background-color: rgba(113, 176, 240, 0.05); /* Легкий голубой фон для тимлида */
}

.member-item.owner {
  background-color: rgba(107, 238, 225, 0.05); /* Легкий зеленый фон для владельца */
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.empty-state .q-icon {
  margin-bottom: 10px;
}

.projects-container {
  width: 80%;
  margin: 10px auto 0;
}

.owner-label::after {
  content: " ";
  white-space: pre;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.project-title {
  font-size: 50px; /* Уменьшенный размер */
  font-weight: 60;
  margin: 0;
  color: #333;
  padding-top: 25px;
}

.create-btn {
  align-self: flex-start; /* Выравнивание кнопки по левому краю */
  width: auto;
  padding: px 16px;
}

.projects-container {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
}

.search-and-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filters {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.team-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.team-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.team-name {
  font-size: 1.1rem;
  font-weight: 500;
  flex: 1;
}

.team-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-members-count {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.privacy-chip {
  margin-right: 8px;
}

/* Добавляем отступ для кнопки "Открыть" чтобы она не срабатывала при клике на карточку */
.open-btn {
  margin-left: 8px;
  pointer-events: auto; /* Разрешаем события мыши для кнопки */
}

/* Запрещаем события мыши для остальных элементов при клике */
.team-card-content > *:not(.open-btn) {
  pointer-events: none;
}

/* Разрешаем события для всей карточки */
.team-card-content {
  pointer-events: auto;
}

.single-team-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.team-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.team-description-section {
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 0 0 8px 8px;
}

/* Увеличение размера иконки */
.q-icon--large {
  font-size: 24px; /* Размер иконки */
}

/* Стили для диалога с деталями команды */
.team-details-card {
  width: 600px;
  max-width: 90%;
}

.team-status strong {
  margin-right: 4px;
}

.user-info {
  margin-left: 4px;
}

.team-owner {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.team-heading {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 8px;
}

.team-description {
  margin: 8px 0;
}

.team-members {
  margin: 8px 0;
}

.member-list {
  list-style: none;
  padding-left: 0;
  margin-top: 8px;
}

.member-item {
  padding-left: 20px;
  border-bottom: 1px solid #eee;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 500;
}

.member-item.owner {
  padding-left: 20px;
  border-radius: 4px;
}

.member-email {
  color: #666;
  font-size: 0.9em;
  margin-top: 2px;
}

.team-status {
  display: flex;
  align-items: center;
  margin-top: 16px;
}

.team-details-card .q-btn.negative {
  margin-right: auto; /* Размещаем слева */
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 600px) {
  .team-card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .team-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .team-members-count {
    margin-right: 0;
  }
}
</style>