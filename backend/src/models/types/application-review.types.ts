/**
 * Интерфейсы для рецензий экспертов (application_reviews и expert_verdicts)
 */

export interface Expert {
  id?: number;
  surname: string;
  name: string;
  patronymic?: string | null;
  extra_info?: string | null;
  user_id?: number | null;
  status?: string | null;
  specialization_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface ApplicationReview {
  id?: number;
  application_id: number;
  expert_id: number;
  review_status?: string | null;
  review_text?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
  expert?: Expert | null;
}

export interface ExpertVerdict {
  id?: number;
  application_id: number;
  expert_id: number;
  verdict: 'approved' | 'rejected';
  comment?: string | null;
  created_at?: Date;
  updated_at?: Date;
  expert?: Expert | null;
}

export interface ReviewCreateData {
  application_id: number;
  expert_id: number;
  review_status?: string;
  review_text?: string | null;
}

export interface VerdictCreateData {
  application_id: number;
  expert_id: number;
  verdict: 'approved' | 'rejected';
  comment?: string | null;
}

// Статистика по рецензиям
export interface ReviewStatistics {
  total_reviews: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
}
