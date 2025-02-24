import axios from 'axios'
import { createPinia } from 'pinia';

export default async ({ app }) => {
  const pinia = createPinia();
  app.use(pinia);
};

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: 'https://api.example.com', // Замените на ваш API
  timeout: 10000, // Устанавливаем таймаут в 10 секунд
})

// Добавляем перехватчик запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // Пример получения токена
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Добавляем перехватчик ответов
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Необходима авторизация')
    }
    return Promise.reject(error)
  }
)

// Экспортируем экземпляр api для использования в других файлах
export { api }