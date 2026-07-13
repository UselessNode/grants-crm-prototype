/**
 * Интерфейсы для бюджета проекта (project_budget)
 */

export interface ProjectBudget {
  id?: number;
  application_id?: number | null;
  resource_type: string;
  unit_cost?: number | null;
  quantity?: number | null;
  total_cost?: number | null;
  own_funds?: number | null;
  grant_funds?: number | null;
  comment?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface ProjectBudgetCreateData extends Omit<ProjectBudget, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'application_id'> {}

export interface ProjectBudgetWithApplication extends ProjectBudget {
  application?: {
    id: number;
    title: string;
  } | null;
}

export interface BudgetSummary {
  total_own_funds: number;
  total_grant_funds: number;
  total_cost: number;
}
