import api from './api';
import type { Application, Direction, Tender, Expert, ExpertVerdict } from '../types';

export interface User {
  id: number;
  email: string;
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  role: 'user' | 'admin';
  role_id?: number | null;
  last_activity?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminStats {
  users: number;
  applications: number;
}

export interface AdminApplicationsResponse {
  success: boolean;
  data: (Application & {
    owner_email?: string;
    owner_name?: string;
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AssignExpertsData {
  expert1Id: number | null;
  expert2Id: number | null;
}

export interface ChangeStatusData {
  status_id: number;
}

export interface AddExpertData {
  surname: string;
  name: string;
  patronymic?: string | null;
  extra_info?: string | null;
}

export interface UpdateUserData {
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  role_id?: number;
}

export const adminService = {
  /**
   * Получить статистику
   */
  async getStats() {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
  },

  /**
   * Получить список всех пользователей
   */
  async getUsers(params?: { page?: number; limit?: number }) {
    const response = await api.get<AdminUsersResponse>('/admin/users', { params });
    return response.data;
  },

  /**
   * Получить все заявки (для админ-панели)
   */
  async getApplications(params?: {
    page?: number;
    limit?: number;
    search?: string;
    direction_id?: number;
    status_id?: number;
  }) {
    const response = await api.get<AdminApplicationsResponse>('/admin/applications', { params });
    return response.data;
  },

  /**
   * Получить все направления
   */
  async getDirections() {
    const response = await api.get<{ success: boolean; data: Direction[] }>('/admin/directions');
    return response.data;
  },

  /**
   * Получить все тендеры (конкурсы)
   */
  async getTenders() {
    const response = await api.get<{ success: boolean; data: Tender[] }>('/admin/tenders');
    return response.data;
  },

  /**
   * Получить всех экспертов
   */
  async getExperts() {
    const response = await api.get<{ success: boolean; data: Expert[] }>('/admin/experts');
    return response.data;
  },

  /**
   * Назначить экспертов на заявку
   */
  async assignExperts(applicationId: number, data: AssignExpertsData) {
    const response = await api.put<{ success: boolean; data: Application }>(
      `/admin/applications/${applicationId}/experts`,
      data
    );
    return response.data;
  },

  /**
   * Изменить статус заявки (только для администратора)
   */
  async changeStatus(applicationId: number, data: ChangeStatusData) {
    const response = await api.post<{ success: boolean; data: Application }>(
      `/applications/${applicationId}/change-status`,
      data
    );
    return response.data;
  },

  /**
   * Получить вердикты экспертов для заявки
   */
  async getVerdicts(applicationId: number) {
    const response = await api.get<{ success: boolean; data: ExpertVerdict[] }>(
      `/admin/applications/${applicationId}/verdicts`
    );
    return response.data;
  },

  /**
   * Добавить эксперта
   */
  async addExpert(data: AddExpertData) {
    const response = await api.post<{ success: boolean; data: Expert }>(
      '/admin/experts',
      data
    );
    return response.data;
  },

  /**
   * Обновить данные пользователя
   */
  async updateUser(userId: number, data: UpdateUserData) {
    const response = await api.put<{ success: boolean; data: User }>(
      `/admin/users/${userId}`,
      data
    );
    return response.data;
  },

  /**
   * Удалить пользователя
   */
  async deleteUser(userId: number) {
    const response = await api.delete<{ success: boolean }>(
      `/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * Обновить данные эксперта
   */
  async updateExpert(expertId: number, data: AddExpertData) {
    const response = await api.put<{ success: boolean; data: Expert }>(
      `/admin/experts/${expertId}`,
      data
    );
    return response.data;
  },

  /**
   * Удалить эксперта
   */
  async deleteExpert(expertId: number) {
    const response = await api.delete<{ success: boolean }>(
      `/admin/experts/${expertId}`
    );
    return response.data;
  },
};
