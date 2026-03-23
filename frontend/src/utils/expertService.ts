import api from './api';
import type { Application, Expert, ExpertVerdict } from './types';

export interface AddVerdictData {
  expertId: number;
  verdict: 'approved' | 'rejected';
  comment?: string | null;
}

export const expertService = {
  /**
   * Выставить вердикт эксперта
   */
  async addVerdict(applicationId: number, data: AddVerdictData) {
    const response = await api.post<{ success: boolean; data: { allVerdictsIn: boolean } }>(
      `/applications/${applicationId}/verdict`,
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
