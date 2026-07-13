/**
 * Интерфейсы для заявок (applications)
 */

// Основные сущности

export interface Application {
  id?: number;
  title: string;
  tender_id?: number | null;
  direction_id?: number | null;
  status_id?: number | null;
  owner_id?: number | null;
  idea_description: string;
  importance_to_team: string;
  project_goal: string;
  project_tasks: string;
  implementation_experience?: string | null;
  results_description?: string | null;
  created_at?: Date;
  updated_at?: Date;
  submitted_at?: Date | null;
  deleted_at?: Date | null;
  expert_1?: number | null;
  expert_2?: number | null;
}

export interface ApplicationCreateData extends Omit<Application, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'deleted_at'> {
  team_members?: TeamMember[];
  project_plans?: ProjectPlan[];
  project_budget?: ProjectBudget[];
}

export interface ApplicationWithRelations extends Application {
  direction?: Direction | null;
  status?: ApplicationStatus | null;
  tender?: Tender | null;
  owner?: {
    id: number;
    email: string;
    surname?: string | null;
    name?: string | null;
    patronymic?: string | null;
  } | null;
  team_members?: TeamMember[];
  project_plans?: ProjectPlan[];
  project_budget?: ProjectBudget[];
  additional_materials?: AdditionalMaterial[];
  expert1?: Expert | null;
  expert2?: Expert | null;
  expert_verdicts?: ExpertVerdict[];
}

// Вспомогательные сущности

export interface Direction {
  id?: number;
  name: string;
  description?: string | null;
  tender_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface Tender {
  id?: number;
  name: string;
  description?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface ApplicationStatus {
  id?: number;
  name: string;
  description?: string | null;
  is_editable?: boolean;
  is_deletable?: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

// Интерфейсы для фильтрации и пагинации

export interface ApplicationFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  direction_id?: number;
  status_id?: number;
  ownerId?: number;
  userRole?: 'user' | 'admin' | 'expert';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
