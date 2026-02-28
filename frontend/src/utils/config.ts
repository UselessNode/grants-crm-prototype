/**
 * Конфигурация приложения
 */
export const CONFIG = {
  // Режим моковых данных (для GitPages)
  MOCK_MODE: false,

  // API URL (используется когда MOCK_MODE = false)
  API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

  // Время задержки для моковых запросов (имитация сети)
  MOCK_DELAY: 500,
} as const;

export default CONFIG;
