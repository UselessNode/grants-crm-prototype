import { CONFIG } from '../utils/config';
import type { User } from '../store/authStore';
import type { Application } from '../utils/types';
import {
  mockUsers,
  mockApplications,
  mockDirections,
  mockStatuses,
  mockTenders,
  getMockUserByEmail,
  checkMockPassword,
} from './data';

/**
 * Имитация задержки сети
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Моковый API сервис
 */
export const mockApi = {
  /**
   * Регистрация пользователя
   */
  async register(email: string, password: string, surname?: string, name?: string, patronymic?: string) {
    await delay(CONFIG.MOCK_DELAY);

    // Проверка существования пользователя
    const existing = getMockUserByEmail(email);
    if (existing) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Пользователь с таким email уже существует',
            errors: { email: 'Такой email уже зарегистрирован' },
          },
        },
      };
    }

    // Создаём нового пользователя
    const newUser: User = {
      id: mockUsers.length + 1,
      email,
      surname: surname || null,
      name: name || null,
      patronymic: patronymic || null,
      full_name: null,
      role: 'user',
    };

    mockUsers.push(newUser);

    return {
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        user: newUser,
        token: `mock-token-${newUser.id}-${Date.now()}`,
      },
    };
  },

  /**
   * Вход пользователя
   */
  async login(email: string, password: string) {
    await delay(CONFIG.MOCK_DELAY);

    const user = getMockUserByEmail(email);

    if (!user || !checkMockPassword(password)) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Неверный email или пароль',
          },
        },
      };
    }

    return {
      success: true,
      message: 'Успешный вход',
      data: {
        user,
        token: `mock-token-${user.id}-${Date.now()}`,
      },
    };
  },

  /**
   * Проверка токена
   */
  async verify(token: string) {
    await delay(CONFIG.MOCK_DELAY);

    // В мок-режиме любой токен с префиксом mock-token валиден
    if (!token.startsWith('mock-token-')) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Неверный токен',
          },
        },
      };
    }

    return {
      success: true,
      data: {
        valid: true,
        remainingTime: 604800, // 7 дней
        user: { id: 1, email: 'mock@example.com', role: 'user' },
      },
    };
  },

  /**
   * Получить профиль пользователя
   */
  async getMe(token: string) {
    await delay(CONFIG.MOCK_DELAY);

    // Извлекаем ID из токена
    const match = token.match(/mock-token-(\d+)/);
    if (!match) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Неверный токен',
          },
        },
      };
    }

    const userId = parseInt(match[1]);
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Пользователь не найден',
          },
        },
      };
    }

    return {
      success: true,
      data: user,
    };
  },

  /**
   * Получить список заявок
   */
  async getApplications(params: { page?: number; limit?: number; search?: string; direction_id?: number; status_id?: number }) {
    await delay(CONFIG.MOCK_DELAY);

    const { page = 1, limit = 10, search, direction_id, status_id } = params;

    let filtered = [...mockApplications];

    // Фильтр по поиску
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        a => a.title.toLowerCase().includes(searchLower) ||
             a.idea_description?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по направлению
    if (direction_id) {
      filtered = filtered.filter(a => a.direction_id === direction_id);
    }

    // Фильтр по статусу
    if (status_id) {
      filtered = filtered.filter(a => a.status_id === status_id);
    }

    // Пагинация
    const total = filtered.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  },

  /**
   * Получить заявку по ID
   */
  async getApplication(id: number) {
    await delay(CONFIG.MOCK_DELAY);

    const application = mockApplications.find(a => a.id === id);

    if (!application) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Заявка не найдена',
          },
        },
      };
    }

    return {
      success: true,
      data: application,
    };
  },

  /**
   * Получить направления
   */
  async getDirections() {
    await delay(CONFIG.MOCK_DELAY);

    return {
      success: true,
      data: mockDirections,
    };
  },

  /**
   * Получить статусы
   */
  async getStatuses() {
    await delay(CONFIG.MOCK_DELAY);

    return {
      success: true,
      data: mockStatuses,
    };
  },

  /**
   * Получить тендеры
   */
  async getTenders() {
    await delay(CONFIG.MOCK_DELAY);

    return {
      success: true,
      data: mockTenders,
    };
  },

  /**
   * Создать заявку
   */
  async createApplication(data: Partial<Application>) {
    await delay(CONFIG.MOCK_DELAY);

    const newApplication = {
      ...data,
      id: mockApplications.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: null,
    } as unknown as Application;

    mockApplications.push(newApplication);

    return {
      success: true,
      message: 'Заявка успешно создана',
      data: newApplication,
    };
  },

  /**
   * Обновить заявку
   */
  async updateApplication(id: number, data: Partial<Application>) {
    await delay(CONFIG.MOCK_DELAY);

    const index = mockApplications.findIndex(a => a.id === id);

    if (index === -1) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Заявка не найдена',
          },
        },
      };
    }

    mockApplications[index] = {
      ...mockApplications[index],
      ...data,
      updated_at: new Date().toISOString(),
    } as unknown as Application;

    return {
      success: true,
      message: 'Заявка успешно обновлена',
      data: mockApplications[index],
    };
  },

  /**
   * Удалить заявку
   */
  async deleteApplication(id: number) {
    await delay(CONFIG.MOCK_DELAY);

    const index = mockApplications.findIndex(a => a.id === id);

    if (index === -1) {
      throw {
        response: {
          data: {
            success: false,
            message: 'Заявка не найдена',
          },
        },
      };
    }

    mockApplications.splice(index, 1);

    return {
      success: true,
      message: 'Заявка успешно удалена',
    };
  },
};
