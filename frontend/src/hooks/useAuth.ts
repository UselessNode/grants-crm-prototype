import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Hook для управления аутентификацией
 */
export function useAuth() {
  const { user, token, isAuthenticated, login, logout, updateUser, setSessionWarning } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Создать axios инстанс с токеном (для verify запроса)
   */
  const createAuthAxios = useCallback(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен к запросам
    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [token]);

  /**
   * Проверка токена при загрузке
   */
  useEffect(() => {
    if (!token || !isAuthenticated) {
      return;
    }

    const checkToken = async () => {
      try {
        const api = createAuthAxios();
        const response = await api.get('/auth/verify');

        if (!response.data.success) {
          logout();
          return;
        }

        // Проверяем, нужно ли показать предупреждение о сессии
        const { remainingTime } = response.data.data;
        const WARNING_TIME = 25 * 60; // 25 минут в секундах

        if (remainingTime <= WARNING_TIME && remainingTime > 0) {
          setSessionWarning(true);
        }

        // Устанавливаем таймер для предупреждения
        const timeUntilWarning = (remainingTime - WARNING_TIME) * 1000;
        if (timeUntilWarning > 0) {
          const warningTimer = setTimeout(() => {
            setSessionWarning(true);
          }, timeUntilWarning);

          return () => clearTimeout(warningTimer);
        }
      } catch (err) {
        logout();
      }
    };

    checkToken();
  }, [token, isAuthenticated, createAuthAxios, logout, setSessionWarning]);

  /**
   * Вход пользователя
   */
  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      if (response.data.success) {
        const { user: userData, token: newToken } = response.data.data;
        login(userData, newToken);
        return { success: true };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Ошибка при входе';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }

    return { success: false, error: 'Неизвестная ошибка' };
  };

  /**
   * Регистрация пользователя
   */
  const registerUser = async (
    email: string,
    password: string,
    surname?: string,
    name?: string,
    patronymic?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        surname,
        name,
        patronymic,
      });

      if (response.data.success) {
        const { user: userData, token: newToken } = response.data.data;
        login(userData, newToken);
        return { success: true };
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = errors
        ? Object.values(errors).filter(Boolean).join(', ')
        : err.response?.data?.message || 'Ошибка при регистрации';

      setError(message);
      return { success: false, error: message, errors };
    } finally {
      setLoading(false);
    }

    return { success: false, error: 'Неизвестная ошибка' };
  };

  /**
   * Выход пользователя
   */
  const logoutUser = useCallback(() => {
    logout();
  }, [logout]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateUser,
    createAuthAxios,
  };
}
