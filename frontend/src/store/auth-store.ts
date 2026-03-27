import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Интерфейс пользователя
 */
export interface User {
  id: number;
  email: string;
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  role: 'user' | 'admin';
}

/**
 * Интерфейс состояния аутентификации
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  sessionWarning: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setSessionWarning: (show: boolean) => void;
  extendSession: () => Promise<boolean>;
}

/**
 * Хранилище состояния аутентификации
 * Использует persist middleware для сохранения токена в localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionWarning: false,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          sessionWarning: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionWarning: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setSessionWarning: (show) =>
        set({ sessionWarning: show }),

      extendSession: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            set({ sessionWarning: false });
            return true;
          }
        } catch (err) {
          // Токен истёк или недействителен
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            sessionWarning: false,
          });
        }

        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
