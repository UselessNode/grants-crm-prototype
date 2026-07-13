/**
 * Интерфейсы для плана проекта (project_plans)
 */

export interface ProjectPlan {
  id?: number;
  application_id?: number | null;
  task: string;
  event_name: string;
  event_description?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  results?: string | null;
  fixation_form?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface ProjectPlanCreateData extends Omit<ProjectPlan, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'application_id'> {}

export interface ProjectPlanWithApplication extends ProjectPlan {
  application?: {
    id: number;
    title: string;
  } | null;
}
