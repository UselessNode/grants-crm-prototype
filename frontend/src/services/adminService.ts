import api from './api';
import type { Application, Direction, Tender, Expert, ExpertVerdict, Document, DocumentCategory } from '../types';

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

export interface AddDocumentData {
  title: string;
  description?: string | null;
  category_id?: number | null;
  is_template?: boolean;
  template_type?: string | null;
  file: File;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string | null;
  category_id?: number | null;
  is_template?: boolean;
  template_type?: string | null;
}

export interface AddDocumentCategoryData {
  name: string;
  description?: string | null;
  sort_order?: number;
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
   * Создать задачу экспорта заявок
   */
  async exportApplications(ids: number[]) {
    const response = await api.post<{ jobId: string }>('/export/applications', { ids });
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
   * Создать направление
   */
  async createDirection(data: { name: string; description?: string | null }) {
    const response = await api.post<{ success: boolean; data: Direction }>('/admin/directions', data);
    return response.data;
  },

  /**
   * Обновить направление
   */
  async updateDirection(id: number, data: { name?: string; description?: string | null }) {
    const response = await api.put<{ success: boolean; data: Direction }>(`/admin/directions/${id}`, data);
    return response.data;
  },

  /**
   * Удалить направление
   */
  async deleteDirection(id: number) {
    const response = await api.delete<{ success: boolean }>(`/admin/directions/${id}`);
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
   * Создать тендер (конкурс)
   */
  async createTender(data: { name: string; description?: string | null }) {
    const response = await api.post<{ success: boolean; data: Tender }>('/admin/tenders', data);
    return response.data;
  },

  /**
   * Обновить тендер
   */
  async updateTender(id: number, data: { name?: string; description?: string | null }) {
    const response = await api.put<{ success: boolean; data: Tender }>(`/admin/tenders/${id}`, data);
    return response.data;
  },

  /**
   * Удалить тендер
   */
  async deleteTender(id: number) {
    const response = await api.delete<{ success: boolean }>(`/admin/tenders/${id}`);
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
      `/admin/applications/${applicationId}/change-status`,
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

  /**
   * Получить список документов
   */
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    is_template?: boolean;
    template_type?: string;
  }) {
    const response = await api.get<{
      success: boolean;
      data: Document[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/documents', { params });
    return response.data;
  },

  /**
   * Получить документ по ID
   */
  async getDocument(id: number) {
    const response = await api.get<{ success: boolean; data: Document }>(
      `/documents/${id}`
    );
    return response.data;
  },

  /**
   * Скачать документ
   */
  async downloadDocument(id: number) {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Загрузить новый документ
   */
  async createDocument(data: AddDocumentData) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category_id) formData.append('category_id', String(data.category_id));
    if (data.is_template) formData.append('is_template', String(data.is_template));
    if (data.template_type) formData.append('template_type', data.template_type);

    const response = await api.post<{ success: boolean; data: Document }>(
      '/documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Обновить документ (метаданные)
   */
  async updateDocument(id: number, data: UpdateDocumentData) {
    const response = await api.put<{ success: boolean; data: Document }>(
      `/documents/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Заменить файл документа
   */
  async updateDocumentFile(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.put<{ success: boolean; data: Document }>(
      `/documents/${id}/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Удалить документ
   */
  async deleteDocument(id: number) {
    const response = await api.delete<{ success: boolean }>(
      `/documents/${id}`
    );
    return response.data;
  },

  /**
   * Получить категории документов
   */
  async getDocumentCategories() {
    const response = await api.get<{ success: boolean; data: DocumentCategory[] }>(
      '/documents/categories'
    );
    return response.data;
  },

  /**
   * Создать категорию документов
   */
  async createDocumentCategory(data: AddDocumentCategoryData) {
    const response = await api.post<{ success: boolean; data: DocumentCategory }>(
      '/documents/categories',
      data
    );
    return response.data;
  },

  /**
   * Обновить категорию документов
   */
  async updateDocumentCategory(id: number, data: AddDocumentCategoryData) {
    const response = await api.put<{ success: boolean; data: DocumentCategory }>(
      `/documents/categories/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Удалить категорию документов
   */
  async deleteDocumentCategory(id: number) {
    const response = await api.delete<{ success: boolean }>(
      `/documents/categories/${id}`
    );
    return response.data;
  },

  /**
   * Получить шаблоны по типу
   */
  async getTemplates(templateType: string) {
    const response = await api.get<{ success: boolean; data: Document[] }>(
      `/documents/templates/${templateType}`
    );
    return response.data;
  },
};
