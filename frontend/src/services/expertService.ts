import api from './api';
import type { Application, Expert, ExpertVerdict } from '../types';

export interface AddVerdictData {
  expertId: number;
  verdict: 'approved' | 'rejected';
  comment?: string | null;
}

export interface ExpertProfileResponse {
  success: boolean;
  data: Expert;
}

export interface ExpertApplicationsResponse {
  success: boolean;
  data: Application[];
}

export interface SubmitVerdictData {
  verdict: 'approved' | 'rejected';
  comment?: string | null;
}

export interface SubmitVerdictResponse {
  success: boolean;
  message: string;
  data: {
    verdict: 'approved' | 'rejected';
    comment: string | null;
  };
}

export interface ApplicationDetailResponse {
  success: boolean;
  data: Application;
}

export const expertService = {
  /**
   * Выставить вердикт эксперта (старая версия для совместимости)
   */
  async addVerdict(applicationId: number, data: AddVerdictData) {
    const response = await api.post<{ success: boolean; data: { allVerdictsIn: boolean } }>(
      `/applications/${applicationId}/verdict`,
      data
    );
    return response.data;
  },

  /**
   * Получить профиль эксперта
   */
  async getProfile(): Promise<ExpertProfileResponse> {
    const response = await api.get<ExpertProfileResponse>('/expert/profile');
    return response.data;
  },

  /**
   * Получить список заявок эксперта
   */
  async getApplications(): Promise<ExpertApplicationsResponse> {
    const response = await api.get<ExpertApplicationsResponse>('/expert/applications');
    return response.data;
  },

  /**
   * Получить детали заявки
   */
  async getApplicationDetail(id: number): Promise<ApplicationDetailResponse> {
    const response = await api.get<ApplicationDetailResponse>(`/expert/applications/${id}`);
    return response.data;
  },

  /**
   * Вынести вердикт по заявке
   */
  async submitVerdict(applicationId: number, data: SubmitVerdictData): Promise<SubmitVerdictResponse> {
    const response = await api.post<SubmitVerdictResponse>(
      `/expert/applications/${applicationId}/verdict`,
      data
    );
    return response.data;
  },

  /**
   * Получить всех экспертов (для админ-панели)
   */
  async getExperts() {
    const response = await api.get<{ success: boolean; data: Expert[] }>('/admin/experts');
    return response.data;
  },

  /**
   * Получить вердикты для заявки
   */
  async getVerdicts(applicationId: number) {
    const response = await api.get<{ success: boolean; data: ExpertVerdict[] }>(
      `/admin/applications/${applicationId}/verdicts`
    );
    return response.data;
  },

  /**
   * Назначить экспертов на заявку (админ)
   */
  async assignExperts(applicationId: number, expert1Id: number | null, expert2Id: number | null) {
    const response = await api.put<{ success: boolean; data: Application }>(
      `/admin/applications/${applicationId}/experts`,
      { expert1Id, expert2Id }
    );
    return response.data;
  },
};
