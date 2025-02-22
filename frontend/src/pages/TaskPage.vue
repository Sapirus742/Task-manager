<template>

    <q-bar class="q-py-lg">
  
      <q-btn color="primary" @click="onNewClick">Создать</q-btn>
  
    </q-bar>
  
    <div class="row">
  
      <div class="col text-center text-h5">Новые</div>
  
      <div class="col text-center text-h5">В работе</div>
  
      <div class="col text-center text-h5">Выполненные</div>
  
    </div>
  
    <div class="row">
  
      <div class="col q-pa-sm">
  
        <TaskComponent
  
          class="q-mb-sm"
  
          v-for="task in newTasks"
  
          :key="task.id"
  
          :value="task"
  
          @onEditClick="onTaskEdit"
  
        ></TaskComponent>
  
      </div>
  
      <div class="col q-pa-sm">
  
        <TaskComponent
  
          class="q-mb-sm"
  
          v-for="task in inProgressTasks"
  
          :key="task.id"
  
          :value="task"
  
          @onEditClick="onTaskEdit"
  
        ></TaskComponent>
  
      </div>
  
      <div class="col q-pa-sm">
  
        <TaskComponent
  
          class="q-mb-sm"
  
          v-for="task in doneTasks"
  
          :key="task.id"
  
          :value="task"
  
          @onEditClick="onTaskEdit"
  
        ></TaskComponent>
  
      </div>
  
    </div>
  
  </template>
  
   
  
  <script setup lang="ts">
  
  import { useQuasar } from 'quasar';
  
  import TaskEditForm from '../components/TaskEditForm.vue';
  
  import TaskComponent from 'src/components/TaskComponent.vue';
  
  import { computed, onMounted, ref } from 'vue';
  
  import * as api from '../api/tasks.api';
  
  import { TaskDto, TaskStatus } from '../../../backend/src/common/types';
  
   
  
  const $q = useQuasar();
  
   
  
  const allTasks = ref([] as TaskDto[]);
  
  const newTasks = computed(() =>
  
    allTasks.value.filter((v) => v.status == TaskStatus.new)
  
  );
  
  const inProgressTasks = computed(() =>
  
    allTasks.value.filter((v) => v.status == TaskStatus.inProgress)
  
  );
  
  const doneTasks = computed(() =>
  
    allTasks.value.filter((v) => v.status == TaskStatus.done)
  
  );
  
   
  
  const getTasksFromServer = async () => {
  
    const response = await api.getTasks();
  
    allTasks.value = response;
  
  };
  
   
  
  onMounted(async () => {
  
    await getTasksFromServer();
  
  });
  
   
  
  const onNewClick = async () => {
  
    $q.dialog({
  
      component: TaskEditForm,
  
   
  
      // props forwarded to your custom component
  
      componentProps: {
  
        new: true,
  
      },
  
    })
  
      .onOk(async () => {
  
        console.log('OK');
  
        await getTasksFromServer();
  
      })
  
      .onCancel(() => {
  
        console.log('Cancel');
  
      });
  
  };
  
   
  
  const onTaskEdit = (value: TaskDto) => {
  
    console.log(value);
  
    $q.dialog({
  
      component: TaskEditForm,
  
   
  
      // props forwarded to your custom component
  
      componentProps: {
  
        new: false,
  
        task: value,
  
      },
  
    })
  
      .onOk(async () => {
  
        console.log('OK');
  
        await getTasksFromServer();
  
      })
  
      .onCancel(() => {
  
        console.log('Cancel');
  
      });
  
  };
  
  </script>