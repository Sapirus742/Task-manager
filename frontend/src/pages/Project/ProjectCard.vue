<template>
  <div class="project-card" @click="$emit('click')">
    <div class="card-content">
      <!-- Верхняя часть (название и решение) -->
      <div class="top-section">
        <div class="text-h6 q-mb-sm">{{ project.name }}</div>
        <div class="solution q-mb-sm">
          {{ truncateSolution(project.solution) }}
        </div>
      </div>

      <!-- Нижняя часть (прижата к низу) -->
      <div class="bottom-section">
        <!-- Строка с инициатором и участниками (теперь выше технологий) -->
        <div class="initiator-meta q-mb-sm">
          <div class="initiator">
            <q-icon name="person" size="sm" class="q-mr-xs" />
            {{ project.customer }}
          </div>
          <div class="members">
            <q-icon name="people" size="sm" class="q-mr-xs" />
            {{ project.teams?.length || 0 }}/{{ project.maxUsers }}
          </div>
        </div>

        <!-- Стек технологий (теперь ниже инициатора) -->
        <div class="tech-stack q-mb-sm">
          <q-chip 
            v-for="tech in project.stack" 
            :key="tech"
            size="sm"
            color="primary"
            text-color="white"
          >
            {{ tech }}
          </q-chip>
        </div>

        <!-- Даты и статус -->
        <div class="footer-row">
          <div class="date-range">
            {{ formatDate(project.startProject) }} - {{ formatDate(project.stopProject) }}
          </div>
          <q-badge :color="statusColor" class="status-badge">
            {{ project.status }}
          </q-badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StatusProject } from '../../../../backend/src/common/types';
import type { ProjectDto } from '../../../../backend/src/common/types';

const props = defineProps<{
  project: ProjectDto;
}>();

defineEmits(['click']);

const statusColor = computed(() => {
  return props.project.status === StatusProject.searchTeam ? 'orange' : 'green';
});

const formatDate = (date: Date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

const truncateSolution = (solution: string) => {
  const maxLength = 80;
  return solution.length > maxLength 
    ? `${solution.substring(0, maxLength)}...` 
    : solution;
};
</script>

<style scoped>
.project-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-section {
  margin-bottom: 16px;
}

.bottom-section {
  margin-top: auto; /* Прижимаем к низу */
}

.solution {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.3;
}

.initiator-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 12px; /* Отступ перед технологиями */
}

.initiator-meta div {
  display: flex;
  align-items: center;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  font-size: 0.8rem;
}

.date-range {
  color: #666;
}

.status-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>