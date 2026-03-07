import api from './api';
import type { Application, Direction, Tender } from './types';

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
};
