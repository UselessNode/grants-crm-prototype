import api from './api';
import { CONFIG } from '../utils/config';
import { mockApi } from '../mocks/api';
import type {
  Application, DirectionsResponse, StatusesResponse, ApplicationsResponse,
  SingleApplicationResponse, Tender, TeamMember, ProjectCoordinator,
  DobroResponsible, ProjectPlan, ProjectBudget, AdditionalMaterial
} from './types';

interface CreateApplicationData {
  title: string;
  tender_id?: number | null;
  direction_id?: number | null;
  status_id?: number;
  idea_description: string;
  importance_to_team: string;
  project_goal: string;
  project_tasks: string;
  implementation_experience?: string;
  results_description?: string;
  team_members?: TeamMember[];
  coordinators?: ProjectCoordinator[];
  dobro_responsible?: DobroResponsible[];
  project_plans?: ProjectPlan[];
  project_budget?: ProjectBudget[];
  additional_materials?: AdditionalMaterial[];
}

export const applicationService = {
  /**
   * Получить список заявок с пагинацией, поиском и фильтрацией
   */
  async getApplications(params?: {
    page?: number;
    limit?: number;
    search?: string;
    direction_id?: number;
    status_id?: number;
  }) {
    if (CONFIG.MOCK_MODE) {
      return mockApi.getApplications(params || {});
    }
    const response = await api.get<ApplicationsResponse>('/applications', { params });
    return response.data;
  },

  /**
   * Получить заявку по ID
   */
  async getApplication(id: number) {
    if (CONFIG.MOCK_MODE) {
      return mockApi.getApplication(id);
    }
    const response = await api.get<SingleApplicationResponse>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Создать новую заявку
   */
  async createApplication(data: CreateApplicationData) {
    if (CONFIG.MOCK_MODE) {
      return mockApi.createApplication(data);
    }
    const response = await api.post<SingleApplicationResponse>('/applications', data);
    return response.data;
  },

  /**
   * Обновить заявку
   */
  async updateApplication(id: number, data: Partial<CreateApplicationData>) {
    if (CONFIG.MOCK_MODE) {
      return mockApi.updateApplication(id, data);
    }
    const response = await api.put<SingleApplicationResponse>(`/applications/${id}`, data);
    return response.data;
  },

  /**
   * Удалить заявку
   */
  async deleteApplication(id: number) {
    if (CONFIG.MOCK_MODE) {
      return mockApi.deleteApplication(id);
    }
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  /**
   * Получить список направлений
   */
  async getDirections() {
    if (CONFIG.MOCK_MODE) {
      return mockApi.getDirections();
    }
    const response = await api.get<DirectionsResponse>('/directions');
    return response.data;
  },

  /**
   * Получить список статусов
   */
  async getStatuses() {
    if (CONFIG.MOCK_MODE) {
      return mockApi.getStatuses();
    }
    const response = await api.get<StatusesResponse>('/statuses');
    return response.data;
  },

  /**
   * Получить список конкурсов
   */
  async getTenders() {
    if (CONFIG.MOCK_MODE) {
      return mockApi.getTenders();
    }
    const response = await api.get<{ success: boolean; data: Tender[] }>('/tenders');
    return response.data;
  },
};
