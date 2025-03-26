<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="create-project-dialog">
      <q-card-section>
        <div class="text-h6">Создать новый проект</div>
      </q-card-section>

      <q-card-section>
        <!-- Форма для ввода данных -->
        <q-form @submit="onSubmit">
          <!-- Название проекта -->
          <q-input
            v-model="newProject.name"
            label="Название проекта"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Проблема -->
          <q-input
            v-model="newProject.problem"
            label="Проблема"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Решение -->
          <q-input
            v-model="newProject.solution"
            label="Решение"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Результат -->
          <q-input
            v-model="newProject.result"
            label="Результат"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Ресурсы -->
          <q-input
            v-model="newProject.resource"
            label="Ресурсы"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Стек технологий -->
          <q-select
            v-model="newProject.stack"
            label="Стек технологий"
            :options="competenceOptions"
            multiple
            use-chips
            :rules="[(val) => val.length > 0 || 'Выберите хотя бы одну технологию']"
          />

          <!-- Статус проекта -->
          <q-select
            v-model="newProject.status"
            label="Статус проекта"
            :options="statusOptions"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Дата начала проекта -->
          <q-input
            v-model="startProjectString"
            label="Дата начала проекта"
            type="date"
            :rules="[
              (val) => !!val || 'Поле обязательно',
              (val) => isValidDate(val) || 'Некорректная дата'
            ]"
          />

          <!-- Дата окончания проекта -->
          <q-input
            v-model="stopProjectString"
            label="Дата окончания проекта"
            type="date"
            :rules="[
              (val) => !!val || 'Поле обязательно',
              (val) => isValidDate(val) || 'Некорректная дата',
              (val) => isAfterStartDate(val) || 'Должна быть после даты начала'
            ]"
          />

          <!-- Максимальное количество участников -->
          <q-input
            v-model="newProject.maxUsers"
            label="Максимальное количество участников"
            type="text"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Заказчик -->
          <q-input
            v-model="newProject.customer"
            label="Заказчик"
            :rules="[(val) => !!val || 'Поле обязательно']"
          />

          <!-- Кнопки -->
          <q-card-actions align="right">
            <q-btn flat label="Отмена" color="negative" v-close-popup />
            <q-btn type="submit" label="Создать" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Competence, CreateProjectDto, StatusProject } from '../../../backend/src/common/types';
import { create } from 'src/api/project.api'; // Импортируем метод для создания проекта
import { useMainStore } from 'src/stores/main-store'; // Импортируем хранилище
import { date } from 'quasar';

const { formatDate} = date;

// Пропсы и эмиты
const emit = defineEmits(['create']);

// Состояние диалога
const showDialog = ref(false);

// Хранилище
const mainStore = useMainStore();

// Данные нового проекта
const newProject = ref<CreateProjectDto>({
  name: '',
  problem: '',
  solution: '',
  result: '', // Добавлено поле "Результат"
  resource: '',
  stack: [],
  status: StatusProject.searchTeam, // Статус проекта
  startProject: new Date(), // Дата начала проекта (тип Date)
  stopProject: new Date(), // Дата окончания проекта (тип Date)
  maxUsers: '1', // По умолчанию строка '1'
  customer: '',
  initiator: mainStore.userId, // Используем ID залогиненного пользователя
});

// Строковые представления дат для v-model
const startProjectString = computed({
  get: () => formatDate(newProject.value.startProject, 'YYYY-MM-DD'),
  set: (value) => {
    const [year, month, day] = value.split('-').map(Number);
    newProject.value.startProject = new Date(year, month - 1, day);
  },
});

const stopProjectString = computed({
  get: () => formatDate(newProject.value.stopProject, 'YYYY-MM-DD'),
  set: (value) => {
    const [year, month, day] = value.split('-').map(Number);
    newProject.value.stopProject = new Date(year, month - 1, day);
  },
});

const isValidDate = (dateString: string) => {
  return !isNaN(new Date(dateString).getTime());
};

const isAfterStartDate = (endDateString: string) => {
  const endDate = new Date(endDateString);
  return endDate >= newProject.value.startProject;
};

// Опции для стека технологий
const competenceOptions = Object.values(Competence);

// Опции для статуса проекта
const statusOptions = Object.values(StatusProject);

// Открытие диалога
const openDialog = () => {
  showDialog.value = true;
};

// Закрытие диалога
const closeDialog = () => {
  window.location.reload();
};

// Отправка формы
const onSubmit = async () => {
  try {
    // Проверяем, что дата окончания не раньше даты начала
    if (newProject.value.stopProject < newProject.value.startProject) {
      console.error('Дата окончания не может быть раньше даты начала');
      return;
    }

    // Проверяем остальные обязательные поля
    if (
      !newProject.value.name ||
      !newProject.value.problem ||
      !newProject.value.solution ||
      !newProject.value.result ||
      !newProject.value.resource ||
      newProject.value.stack.length === 0 ||
      !newProject.value.maxUsers ||
      !newProject.value.customer ||
      !newProject.value.status
    ) {
      console.error('Заполните все обязательные поля');
      return;
    }

    // Создаем копию объекта без реактивности
    const projectData: CreateProjectDto = {
      ...newProject.value,
      startProject: new Date(newProject.value.startProject),
      stopProject: new Date(newProject.value.stopProject),
    };

    const createdProject = await create(projectData);
    if (createdProject) {
      emit('create', createdProject);
      closeDialog();
    }
  } catch (error) {
    console.error('Ошибка при создании проекта:', error);
  }
};

// Экспортируем методы для использования в родительском компоненте
defineExpose({
  openDialog,
  closeDialog,
});
</script>

<style scoped>
.create-project-dialog {
  width: 500px;
  max-width: 90%;
}
</style>