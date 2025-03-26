<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="edit-team-dialog">
      <q-card-section>
        <div class="text-h6">Редактировать команду</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit">
          <!-- Название команды -->
          <q-input
            v-model="editedTeam.name"
            label="Название команды"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
          />

          <!-- Описание -->
          <q-input
            v-model="editedTeam.description"
            label="Описание"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
          />

          <!-- Приватность -->
          <q-select
            v-model="editedTeam.privacy"
            label="Приватность"
            :options="privacyOptions"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
            emit-value
            map-options
          />

          <!-- Статус команды -->
          <q-select
            v-model="editedTeam.status"
            label="Статус команды"
            :options="statusOptions"
            :rules="[(val) => !!val || 'Поле обязательно']"
            outlined
            emit-value
            map-options
            :disable="!!editedTeam.project"
          />

          <!-- Участники команды -->
      <q-select
        v-model="editedTeam.members"
        label="Участники команды"
        multiple
        use-chips
        :options="userOptions"
        :rules="[(val) => val.length > 0 || 'Добавьте хотя бы одного участника']"
        outlined
        option-label="fullName"
        option-value="id"
        emit-value
        map-options
        @update:model-value="updateLeaderOptions"
      />

          <!-- Тимлид -->
      <q-select
        v-model="editedTeam.leader"
        label="Тимлид"
        :options="leaderOptions"
        :rules="[(val) => !!val || 'Необходимо выбрать тимлида']"
        outlined
        option-label="fullName"
        option-value="id"
        emit-value
        map-options
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon name="star" :color="scope.opt.id === editedTeam.leader?.id ? 'amber' : 'transparent'"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.fullName }}</q-item-label>
            </q-item-section>
              </q-item>
            </template>

            <template v-slot:selected-item="scope">
              <div class="row items-center">
                <q-icon name="star" color="amber" class="q-mr-sm" />
                <div>{{ scope.opt.fullName }}</div>
              </div>
            </template>
          </q-select>

          <!-- Проект -->
          <q-select
            v-model="editedTeam.project"
            label="Проект"
            :options="filteredProjectOptions"
            outlined
            option-label="name"
            option-value="id"
            emit-value
            map-options
            clearable
            @update:model-value="handleProjectChange"
          />

          <q-card-actions align="right">
            <q-btn flat label="Отмена" color="negative" v-close-popup />
            <q-btn type="submit" label="Сохранить" color="primary" :loading="loading" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed} from 'vue';
import { useQuasar } from 'quasar';
import { 
  PrivacyTeam, 
  StatusTeam,
  StatusProject,
  Role,
  TeamDto,
} from '../../../backend/src/common/types';
import { update as updateTeam } from 'src/api/team.api';
import { getAll as getAllUsers } from 'src/api/users.api';
import { getAll as getAllProjects} from 'src/api/project.api';

const $q = useQuasar();
const emit = defineEmits(['update']);
const showDialog = ref(false);
const loading = ref(false);

interface TeamMember {
  id: number;
  fullName: string;
  email?: string;
}

interface ProjectOption {
  id: number;
  name: string;
  status: StatusProject;
}

const editedTeam = ref({
  id: 0,
  name: '',
  description: '',
  privacy: PrivacyTeam.open,
  status: StatusTeam.searchProject,
  members: [] as TeamMember[],
  leader: null as TeamMember | null,
  project: null as ProjectOption | null,
  user_owner: 0,
});

const leaderOptions = ref<TeamMember[]>([]);

const updateLeaderOptions = () => {
  leaderOptions.value = [...editedTeam.value.members];
  
  // Сбрасываем тимлида, если он больше не в списке участников
  if (editedTeam.value.leader && 
      !editedTeam.value.members.some(m => m.id === editedTeam.value.leader?.id)) {
    editedTeam.value.leader = null;
  }
};

const privacyOptions = [
  { label: 'Открытая', value: PrivacyTeam.open },
  { label: 'Закрытая', value: PrivacyTeam.close }
];

const statusOptions = computed(() => {
  if (editedTeam.value.project) {
    return [
      { label: 'В процессе работы', value: StatusTeam.inProgress }
    ];
  }
  return [
    { label: 'Поиск проекта', value: StatusTeam.searchProject },
    { label: 'В процессе работы', value: StatusTeam.inProgress },
    { label: 'На удалении', value: StatusTeam.delete }
  ];
});

const allUsers = ref<TeamMember[]>([]);
const userOptions = computed(() => allUsers.value);
const allProjects = ref<ProjectOption[]>([]);
const filteredProjectOptions = computed(() => 
  allProjects.value.filter(project => project.status !== StatusProject.teamFound)
);

const loadUsers = async () => {
  try {
    const users = await getAllUsers();
    if (users) {
      allUsers.value = users
        .filter(user => user.roles.includes(Role.user))
        .map(user => ({
          id: user.id,
          fullName: `${user.firstname} ${user.lastname}`,
          email: user.email
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
      allProjects.value = projects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status
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

const handleProjectChange = (projectId: number | null) => {
  if (projectId) {
    const selectedProject = allProjects.value.find(p => p.id === projectId);
    if (selectedProject) {
      editedTeam.value.project = {
        id: selectedProject.id,
        name: selectedProject.name,
        status: selectedProject.status
      };
      editedTeam.value.status = StatusTeam.inProgress;
    }
  } else {
    editedTeam.value.project = null;
    editedTeam.value.status = StatusTeam.searchProject;
  }
};

const openDialog = async (team: TeamDto) => {
  showDialog.value = true;
  await Promise.all([loadUsers(), loadProjects()]);
  
  editedTeam.value = {
    id: team.id,
    name: team.name,
    description: team.description,
    privacy: team.privacy,
    status: team.status,
    members: team.user.map(u => ({
      id: u.id,
      fullName: `${u.firstname} ${u.lastname}`,
      email: u.email
    })),
    leader: team.user_leader ? {
      id: team.user_leader.id,
      fullName: `${team.user_leader.firstname} ${team.user_leader.lastname}`,
      email: team.user_leader.email
    } : null,
    project: team.project ? {
      id: team.project.id,
      name: team.project.name,
      status: team.project.status
    } : null,
    user_owner: team.user_owner.id
  };

  updateLeaderOptions();
};

const onSubmit = async () => {
  try {
    loading.value = true;
    
    const updateData = {
      name: editedTeam.value.name,
      description: editedTeam.value.description,
      privacy: editedTeam.value.privacy,
      status: editedTeam.value.status,
      user_leader: editedTeam.value.leader?.id || null,
      user: editedTeam.value.members.map(m => m.id),
      project: editedTeam.value.project?.id || null,
      user_owner: editedTeam.value.user_owner
    };

    const updatedTeam = await updateTeam(editedTeam.value.id, updateData);
    
    emit('update', updatedTeam);
    closeDialog();
    $q.notify({ message: 'Изменения сохранены', color: 'positive' });
    
  } catch (error) {
    $q.notify({ message: 'Ошибка сохранения', color: 'negative' });
    console.error('Ошибка:', error);
  } finally {
    loading.value = false;
  }
};


const closeDialog = () => {
  showDialog.value = false;
};

defineExpose({
  openDialog,
  closeDialog,
});
</script>

<style scoped>
.edit-team-dialog {
  width: 600px;
  max-width: 90%;
}

.q-chip {
  max-width: 200px;
}
</style>