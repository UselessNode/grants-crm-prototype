import api from './api';
import config from './config';

interface EvaluationCriteria {
  id: number;
  tender_id: number;
  name: string;
  description: string | null;
  min_value: number;
  max_value: number;
  weight: number;
  config: any | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface CreateEvaluationCriteriaData {
  tender_id: number;
  name: string;
  description?: string | null;
  min_value?: number;
  max_value?: number;
  weight?: number;
  config?: any | null;
}

interface UpdateEvaluationCriteriaData {
  name: string;
  description?: string | null;
  min_value?: number;
  max_value?: number;
  weight?: number;
  config?: any | null;
}

export const evaluationCriteriaService = {
  // Получение всех критериев для тендера
  getByTender: async (tenderId: number): Promise<EvaluationCriteria[]> => {
    const response = await api.get(`${config.API_URL}/admin/tenders/${tenderId}/evaluation-criteria`);
    return response.data.data;
  },

  // Получение критериев по параметрам
  get: async (params: { tender_id?: number }): Promise<EvaluationCriteria[]> => {
    const queryParams = new URLSearchParams();
    if (params.tender_id) queryParams.append('tender_id', params.tender_id.toString());

    const response = await api.get(`${config.API_URL}/admin/evaluation-criteria?${queryParams.toString()}`);
    return response.data.data;
  },

  // Создание нового критерия
  create: async (data: CreateEvaluationCriteriaData): Promise<EvaluationCriteria> => {
    const response = await api.post(`${config.API_URL}/admin/evaluation-criteria`, data);
    return response.data.data;
  },

  // Обновление критерия
  update: async (id: number, data: UpdateEvaluationCriteriaData): Promise<EvaluationCriteria> => {
    const response = await api.put(`${config.API_URL}/admin/evaluation-criteria/${id}`, data);
    return response.data.data;
  },

  // Удаление критерия
  delete: async (id: number): Promise<void> => {
    await api.delete(`${config.API_URL}/admin/evaluation-criteria/${id}`);
  },

  // Создание стандартных критериев для тендера
  createDefault: async (tenderId: number): Promise<EvaluationCriteria[]> => {
    const response = await api.post(`${config.API_URL}/admin/evaluation-criteria/default`, { tender_id: tenderId });
    return response.data.data;
  },
};

export type { EvaluationCriteria, CreateEvaluationCriteriaData, UpdateEvaluationCriteriaData };
