import axios from 'axios';

// Функция для получения URL сервера из query-параметров
const getApiBaseUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const serverUrl = urlParams.get('url');

  // Если параметр 'url' указан, используем его
  if (serverUrl) {
    // Убедимся, что URL корректный (начинается с http/https)
    if (serverUrl.startsWith('http://') || serverUrl.startsWith('https://')) {
      return serverUrl;
    } else {
      console.warn(`Некорректный URL сервера: ${serverUrl}. Используется значение по умолчанию.`);
    }
  }

  // Иначе используем переменную окружения или значение по умолчанию
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
