<template>
  <q-page class="row items-center justify-evenly">
    <q-card flat bordered class="my-card" style="width: 400px; padding: 20px;">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">Регистрация</div>
        <div class="text-caption text-center q-mb-md">
          Введите данные для регистрации
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="login"
          label="Логин"
          dense
          outlined
          class="q-mb-md"
          placeholder="almanum_uxul@std.tyulu.ru"
        />
        <q-input
          v-model="firstname"
          label="Имя"
          dense
          outlined
          class="q-mb-md"
        />
        <q-input
          v-model="lastname"
          label="Фамилия"
          dense
          outlined
          class="q-mb-md"
        />
        <q-input
          type="password"
          v-model="password"
          label="Пароль"
          dense
          outlined
          class="q-mb-md"
          placeholder="**********"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          color="primary"
          label="Зарегистрироваться"
          @click="onSignUp"
          class="full-width q-mb-md"
        />
      </q-card-actions>

      <q-card-section class="text-center">
        <q-btn
          color="secondary"
          label="Назад"
          flat
          @click="onReturn"
          class="full-width"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import * as api from 'src/api/auth.api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const $q = useQuasar();

const login = ref('');
const password = ref('');
const firstname = ref('');
const lastname = ref('');

const onReturn = () => {
  router.push({ path: '/login' });
};

const onSignUp = async () => {
  let response;

  try {
    response = await api.signup({
      username: login.value,
      password: password.value,
      firstname: firstname.value,
      lastname: lastname.value,
    });
  } catch {
    console.log('Signup failed');
  }

  if (response && response.success) {
    $q.notify({
      message: 'Пользователь успешно создан',
      caption: 'Ожидайте активации пользователя администратором.',
      color: 'green',
      icon: 'verified',
    });

    router.push({ path: '/login' });
  } else {
    $q.notify({
      message: 'Создать пользователя не удалось',
      caption: 'Возможно, пользователь с таким логином уже существует. Попробуйте другой.',
      color: 'red',
      icon: 'error',
    });
  }
};
</script>

<style scoped>
.my-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.full-width {
  width: 100%;
}
</style>