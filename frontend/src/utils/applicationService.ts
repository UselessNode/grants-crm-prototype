import api from './api';
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
    const response = await api.get<ApplicationsResponse>('/applications', { params });
    return response.data;
  },

  /**
   * Получить заявку по ID
   */
  async getApplication(id: number) {
    const response = await api.get<SingleApplicationResponse>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Создать новую заявку
   */
  async createApplication(data: CreateApplicationData) {
    const response = await api.post<SingleApplicationResponse>('/applications', data);
    return response.data;
  },

  /**
   * Обновить заявку
   */
  async updateApplication(id: number, data: Partial<CreateApplicationData>) {
    const response = await api.put<SingleApplicationResponse>(`/applications/${id}`, data);
    return response.data;
  },

  /**
   * Удалить заявку
   */
  async deleteApplication(id: number) {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  /**
   * Получить список направлений
   */
  async getDirections() {
    const response = await api.get<DirectionsResponse>('/directions');
    return response.data;
  },

  /**
   * Получить список статусов
   */
  async getStatuses() {
    const response = await api.get<StatusesResponse>('/statuses');
    return response.data;
  },

  /**
   * Получить список конкурсов
   */
  async getTenders() {
    const response = await api.get<{ success: boolean; data: Tender[] }>('/tenders');
    return response.data;
  },
};
