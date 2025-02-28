<template>
  <q-page class="flex flex-column">
    <div class="projects-container">
      <div class="header">
        <h1 class="project-title">Проекты</h1>
        <div class="create-project-container">
          <q-btn
            color="primary"
            label="Создать проект"
            @click="openCreateProjectDialog"
            class="create-project-btn"
          />
        </div>
      </div>
      <div class="categories">
        <q-btn
          v-for="category in categories"
          :key="category"
          :label="category"
          :color="selectedCategory === category ? 'primary' : 'grey'"
          @click="selectCategory(category)"
          class="category-btn"
        />
      </div>
      <div class="projects-grid">
        <div class="project-card" v-for="project in filteredProjects" :key="project.title">
          <h2 class="project-heading" @click="openProjectDetails(project)">{{ project.title }}</h2>
          <p>{{ project.description }}</p>
          <p><strong>Инициатор:</strong> {{ project.initiator }}</p>
          <div class="tags">
            <span
              v-for="tag in project.tags"
              :key="tag"
              :class="getTagClass(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог для создания проекта -->
    <q-dialog v-model="createProjectDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Создать новый проект</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input class="full-width-input" v-model="newProject.title" label="Название проекта" />
          <q-input class="full-width-input" v-model="newProject.problem" label="Проблема проекта" type="textarea" />
          <q-input class="full-width-input" v-model="newProject.solution" label="Предполагаемое решение проблемы" type="textarea" />
          <q-input class="full-width-input" v-model="newProject.expectedResult" label="Ожидаемый результат" type="textarea" />
          <q-input class="full-width-input" v-model="newProject.requiredResources" label="Необходимые ресурсы" type="textarea" />
          <q-input class="full-width-input" v-model="newProject.stack" label="Стек" />
          <q-input class="full-width-input" v-model="newProject.participantsCount" label="Количество участников" type="number" />
          <q-select class="full-width-input" v-model="newProject.category" :options="categories.filter(cat => cat !== 'Все категории')" label="Категория" />
          <q-input class="full-width-input" v-model="newProject.tags" label="Теги (через запятую)" hint="Введите теги через запятую" />
          <q-input class="full-width-input" v-model="newProject.initiator" label="Инициатор" />
          <q-input class="full-width-input" v-model="newProject.description" label="Описание" type="textarea" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" @click="closeCreateProjectDialog" />
          <q-btn flat label="Создать" color="primary" @click="createProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Диалог для отображения информации о проекте -->
    <q-dialog v-model="projectDetailsDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">{{ selectedProject.title }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <p><strong>Описание:</strong> {{ selectedProject.description }}</p>
          <p><strong>Инициатор:</strong> {{ selectedProject.initiator }}</p>
          <p><strong>Проблема:</strong> {{ selectedProject.problem }}</p>
          <p><strong>Решение:</strong> {{ selectedProject.solution }}</p>
          <p><strong>Ожидаемый результат:</strong> {{ selectedProject.expectedResult }}</p>
          <p><strong>Необходимые ресурсы:</strong> {{ selectedProject.requiredResources }}</p>
          <p><strong>Стек:</strong> {{ selectedProject.stack }}</p>
          <p><strong>Количество участников:</strong> {{ selectedProject.participantsCount }}</p>
          <p><strong>Категория:</strong> {{ selectedProject.category }}</p>
          <p><strong>Теги:</strong> {{ selectedProject.tags.join(', ') }}</p>
        </q-card-section>

        <!-- Кнопка "Закрыть" и "Удалить" в правом нижнем углу -->
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Закрыть" color="primary" @click="closeProjectDetailsDialog" />
          <!-- Кнопка "Удалить" только для созданных проектов -->
          <q-btn
            v-if="selectedProject.isCustom"
            flat
            label="Удалить"
            color="negative"
            @click="deleteProject(selectedProject)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Project {
  title: string;
  description: string;
  initiator: string;
  tags: string[];
  category: string;
  problem?: string;
  solution?: string;
  expectedResult?: string;
  requiredResources?: string;
  stack?: string;
  participantsCount?: number;
  isCustom?: boolean; // Поле для определения, создан ли проект пользователем
}

const categories = ['Все категории', 'Набор открыт', 'Набор закрыт'];
const selectedCategory = ref('Все категории');

const projects = ref<Project[]>([
  {
    title: '#1 Создание сайта для проведения конкурса "Работник года"',
    description: 'Разработка веб-приложения для создания анкет преподавателей и проведения голосования за них',
    initiator: 'Кирилл Иванов',
    tags: ['C#', 'Blazor', '.NET 6.0', 'SQLite', 'Git', 'Docker'],
    category: 'Набор открыт',
    problem: 'Отсутствие платформы для голосования',
    solution: 'Разработка веб-приложения для создания анкет и голосования',
    expectedResult: 'Повышение участия в голосовании',
    requiredResources: 'C#, Blazor, .NET 6.0, SQLite, Git, Docker',
    stack: 'C#, Blazor, .NET 6.0',
    participantsCount: 5,
    isCustom: false // Предопределенный проект
  },
  {
    title: '#2 Создание личного кабинета работника',
    description: 'Создание портала, где студенты и преподаватели смогут зарегистрироваться и вести учет посещаемости, оценок, расписания и других элементов учебного процесса.',
    initiator: 'Кирилл Иванов',
    tags: ['C#', 'Blazor', 'PostgreSQL', 'Git', 'Docker'],
    category: 'Набор закрыт',
    problem: 'Отсутствие централизованной системы учета',
    solution: 'Создание портала для учета посещаемости и оценок',
    expectedResult: 'Упрощение учета',
    requiredResources: 'C#, Blazor, PostgreSQL, Git, Docker',
    stack: 'C#, Blazor',
    participantsCount: 3,
    isCustom: false // Предопределенный проект
  },
  {
    title: '#3 Виртуальный консультант работник',
    description: 'Создать цифровой справочник, чат-бот агент.',
    initiator: 'Кирилл Иванов',
    tags: ['Python', 'PostgreSQL', 'Git', 'Docker'],
    category: 'Набор открыт',
    problem: 'Отсутствие справочного материала',
    solution: 'Создание цифрового справочника и чат-бота',
    expectedResult: 'Повышение доступности информации',
    requiredResources: 'Python, PostgreSQL, Git, Docker',
    stack: 'Python',
    participantsCount: 2,
    isCustom: false // Предопределенный проект
  },
  {
    title: '#4 Разработка веб приложения "Лига спорта"',
    description: 'Создать многоплатформенное мобильное/веб приложение, которое реализует функционал',
    initiator: 'Кирилл Иванов',
    tags: ['C++', 'Javascript', '.NET 6.0', 'MySQL', 'Docker'],
    category: 'Набор открыт',
    problem: 'Отсутствие платформы для спортивного контента',
    solution: 'Создание многоплатформенного приложения',
    expectedResult: 'Повышение вовлеченности в спорт',
    requiredResources: 'C++, Javascript, .NET 6.0, MySQL, Docker',
    stack: 'C++, Javascript',
    participantsCount: 4,
    isCustom: false // Предопределенный проект
  }
]);

const createProjectDialog = ref(false);
const newProject = ref({
  title: '',
  problem: '',
  solution: '',
  expectedResult: '',
  requiredResources: '',
  stack: '',
  participantsCount: 0,
  category: '',
  tags: '',
  initiator: '',
  description: ''
});

const projectDetailsDialog = ref(false);
const selectedProject = ref<Project>({
  title: '',
  description: '',
  initiator: '',
  tags: [],
  category: '',
  problem: '',
  solution: '',
  expectedResult: '',
  requiredResources: '',
  stack: '',
  participantsCount: 0,
  isCustom: false
});

const openCreateProjectDialog = () => {
  createProjectDialog.value = true;
};

const closeCreateProjectDialog = () => {
  createProjectDialog.value = false;
  resetNewProject();
};

const resetNewProject = () => {
  newProject.value = {
    title: '',
    problem: '',
    solution: '',
    expectedResult: '',
    requiredResources: '',
    stack: '',
    participantsCount: 0,
    category: '',
    tags: '',
    initiator: '',
    description: ''
  };
};

const createProject = () => {
  const tagsArray = newProject.value.tags.split(',').map(tag => tag.trim());
  projects.value.push({
    title: newProject.value.title,
    description: newProject.value.description,
    initiator: newProject.value.initiator,
    tags: tagsArray,
    category: newProject.value.category,
    problem: newProject.value.problem,
    solution: newProject.value.solution,
    expectedResult: newProject.value.expectedResult,
    requiredResources: newProject.value.requiredResources,
    stack: newProject.value.stack,
    participantsCount: newProject.value.participantsCount,
    isCustom: true // Пометка, что проект создан пользователем
  });
  closeCreateProjectDialog();
};

const deleteProject = (project: Project) => {
  const index = projects.value.findIndex(p => p.title === project.title);
  if (index !== -1) {
    projects.value.splice(index, 1);
    closeProjectDetailsDialog(); // Закрываем диалог после удаления
  }
};

const selectCategory = (category: string) => {
  selectedCategory.value = category;
};

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'Все категории') {
    return projects.value;
  }
  return projects.value.filter(project => project.category === selectedCategory.value);
});

const openProjectDetails = (project: Project) => {
  selectedProject.value = project;
  projectDetailsDialog.value = true;
};

const closeProjectDetailsDialog = () => {
  projectDetailsDialog.value = false;
};

// Функция для определения класса тега
const getTagClass = (tag: string) => {
  if (['C#', 'Python', 'C++', 'Javascript'].includes(tag)) {
    return 'tag-green';
  } else if (['Blazor', '.NET 6.0'].includes(tag)) {
    return 'tag-blue';
  } else if (['SQLite', 'PostgreSQL', 'MySQL'].includes(tag)) {
    return 'tag-orange';
  } else if (['Git', 'Docker'].includes(tag)) {
    return 'tag-red';
  }
  return '';
};
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

.create-project-container {
  margin-top: 10px;
}

.create-project-btn {
  width: 200px;
}

.categories {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.category-btn {
  margin-right: 10px;
}

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
}

.project-heading {
  font-size: 24px;
  margin-top: 0;
  cursor: pointer;
}

.project-heading:hover {
  text-decoration: underline;
}

.tags span {
  display: inline-block;
  padding: 5px 10px;
  margin-right: 5px;
  border-radius: 5px;
}

/* Стили для тегов */
.tag-green {
  background-color: #e6f4ea; /* Зеленый */
}

.tag-blue {
  background-color: #e6f3ff; /* Синий */
}

.tag-orange {
  background-color: #fff3e6; /* Оранжевый */
}

.tag-red {
  background-color: #ffe6e6; /* Красный */
}

.full-width-input {
  width: 100%;
  margin-bottom: 20px;
}

.full-width-input textarea {
  height: 100px;
  resize: vertical;
}

.dialog-card {
  width: 70vw;
  height: 70vh;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.dialog-card .q-card-section {
  flex-grow: 1;
  overflow-y: auto;
}

.dialog-actions {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 16px;
}
</style>