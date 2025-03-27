<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
      <q-card>
        <q-card-section>
          <h6>Вы уверены, что хотите удалить проект?</h6>
        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="$emit('confirm')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    modelValue: boolean;
  }>();
  
  defineEmits(['update:modelValue', 'confirm']);
  </script>