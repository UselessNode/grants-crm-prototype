/**
 * Конфигурация приложения
 */
export const CONFIG = {
  // API URL
  API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
} as const;

export default CONFIG;
