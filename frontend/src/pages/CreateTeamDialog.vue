<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="create-team-dialog">
      <q-card-section>
        <div class="text-h6">Создать новую команду</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit">
          <!-- Название команды -->
          <q-input
            v-model="newTeam.name"
            label="Название команды"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
          />

          <!-- Описание -->
          <q-input
            v-model="newTeam.description"
            label="Описание"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
          />

          <!-- Приватность -->
          <q-select
            v-model="newTeam.privacy"
            label="Приватность"
            :options="privacyOptions"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
            emit-value
            map-options
          />

          <!-- Статус -->
          <q-select
            v-model="newTeam.status"
            label="Статус"
            :options="statusOptions"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
            emit-value
              map-options
            :disable="!!newTeam.project" 
          />

          <!-- Участники команды -->
          <q-select
            v-model="newTeam.user"
            label="Участники команды"
            multiple
            use-chips
            :options="userOptions"
            :rules="[(val) => val.length > 0 || 'Добавьте хотя бы одного участника']"
            outlined
            option-value="id"
            option-label="fullName"
            emit-value
            map-options
          />

          <!-- Тимлид (выбирается из участников) -->
          <q-select
            v-model="newTeam.user_leader"
            label="Тимлид"
            :options="newTeam.user.length ? userOptions.filter(u => newTeam.user.includes(u.id)) : []"
            :rules="[(val) => !!val || 'Выберите тимлида']"
            outlined
            option-value="id"
            option-label="fullName"
            emit-value
            map-options
            :disable="!newTeam.user.length"
          />

          <!-- Проект -->
          <q-select
            v-model="newTeam.project"
            label="Проект"
            :options="projectOptions"
            :rules="[(val) => !!val || 'Выберите проект']"
            outlined
            option-value="id"
            option-label="name"
            emit-value
            map-options
            @update:model-value="handleProjectChange"
          />

          <q-card-actions align="right">
            <q-btn flat label="Отмена" color="negative" v-close-popup />
            <q-btn type="submit" label="Создать" color="primary" :loading="loading" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { CreateTeamDto, PrivacyTeam, StatusTeam, Role, StatusProject, UpdateProjectDto } from '../../../backend/src/common/types';
import { create } from 'src/api/team.api';
import { getAll as getAllUsers } from 'src/api/users.api';
import { getAll as getAllProjects, update as updateProject } from 'src/api/project.api';
import { useMainStore } from 'src/stores/main-store';

const $q = useQuasar();
const emit = defineEmits(['create']);
const showDialog = ref(false);
const loading = ref(false);
const mainStore = useMainStore();

const newTeam = ref<CreateTeamDto>({
  name: '',
  description: '',
  privacy: PrivacyTeam.open,
  status: StatusTeam.searchProject,
  user_leader: 0,
  user: [],
  project: 0,
  user_owner: mainStore.userId,
});

const privacyOptions = [
  { label: 'Открытая', value: PrivacyTeam.open },
  { label: 'Закрытая', value: PrivacyTeam.close }
];

// Добавляем вычисляемое свойство для статуса
const statusOptions = computed(() => {
  if (newTeam.value.project) {
    // Если проект выбран, оставляем только "В процессе"
    return [
      { label: 'В процессе', value: StatusTeam.inProgress }
    ];
  }
  // Если проект не выбран, показываем все варианты
  return [
    { label: 'Поиск проекта', value: StatusTeam.searchProject },
    { label: 'В процессе', value: StatusTeam.inProgress },
    { label: 'Удалена', value: StatusTeam.delete }
  ];
});

// Обработчик изменения проекта
const handleProjectChange = (projectId: number) => {
  if (projectId) {
    newTeam.value.status = StatusTeam.inProgress;
  } else {
    newTeam.value.status = StatusTeam.searchProject;
  }
};

const userOptions = ref<Array<{id: number, fullName: string}>>([]);
const projectOptions = ref<Array<{id: number, name: string}>>([]);

const loadUsers = async () => {
  try {
    const users = await getAllUsers();
    if (users) {
      userOptions.value = users
        .filter(user => user.roles.includes(Role.user))
        .map(user => ({
          id: user.id,
          fullName: `${user.firstname} ${user.lastname} (${user.email})`
        }));
    }
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    $q.notify({
      message: 'Ошибка загрузки пользователей',
      color: 'negative',
      position: 'top'
    });
  }
};

const loadProjects = async () => {
  try {
    const projects = await getAllProjects();
    if (projects) {
      projectOptions.value = projects
        .filter(project => project.status === StatusProject.searchTeam)
        .map(project => ({
          id: project.id,
          name: project.name
        }));
    }
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error);
    $q.notify({
      message: 'Ошибка загрузки проектов',
      color: 'negative',
      position: 'top'
    });
  }
};

watch(() => newTeam.value.user, (newUsers) => {
  if (newUsers.length === 0) {
    newTeam.value.user_leader = 0;
  } else if (!newUsers.includes(newTeam.value.user_leader)) {
    newTeam.value.user_leader = newUsers[0];
  }
});

const openDialog = async () => {
  showDialog.value = true;
  await Promise.all([loadUsers(), loadProjects()]);
  newTeam.value = {
    name: '',
    description: '',
    privacy: PrivacyTeam.open,
    status: StatusTeam.searchProject,
    user_leader: 0,
    user: [],
    project: 0,
    user_owner: mainStore.userId,
  };
};

const closeDialog = () => {
  showDialog.value = false;
};

const onSubmit = async () => {
  try {
    loading.value = true;
    
    if (!newTeam.value.name || !newTeam.value.description || 
        newTeam.value.user.length === 0 || !newTeam.value.user_leader ||
        !newTeam.value.project) {
      $q.notify({
        message: 'Заполните все обязательные поля',
        color: 'warning',
        position: 'top'
      });
      return;
    }

    const teamData = {
      ...newTeam.value,
      user: [...newTeam.value.user],
      user_leader: Number(newTeam.value.user_leader),
      project: Number(newTeam.value.project),
    };

    // Создаем команду
    const createdTeam = await create(teamData);
    if (createdTeam) {
      // Получаем текущий проект
      const currentProject = projectOptions.value.find(p => p.id === teamData.project);
      
      if (currentProject) {
        // Создаем объект для обновления с текущими значениями + новым статусом
        const updateData: UpdateProjectDto = {
          ...currentProject, // Все текущие данные проекта
          status: StatusProject.teamFound // Новый статус
        };
        
        await updateProject(teamData.project, updateData);
      }
      
      $q.notify({
        message: 'Команда успешно создана',
        color: 'positive',
        position: 'top'
      });
      emit('create', createdTeam);
      closeDialog();
    }
  } catch (error) {
    console.error('Ошибка создания команды:', error);
    $q.notify({
      message: 'Ошибка создания команды',
      color: 'negative',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

defineExpose({
  openDialog,
  closeDialog,
});
</script>

<style scoped>
.create-team-dialog {
  width: 500px;
  max-width: 90%;
}
</style>