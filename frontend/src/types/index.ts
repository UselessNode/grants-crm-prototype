export interface Application {
  id?: number;
  title: string;
  tender_id?: number | null;
  direction_id?: number | null;
  status_id?: number | null;
  idea_description: string;
  importance_to_team: string;
  project_goal: string;
  project_tasks: string;
  implementation_experience?: string | null;
  results_description?: string | null;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string | null;
  direction_name?: string;
  status_name?: string;
  tender_name?: string;
  owner_id?: number | null;
  owner_email?: string | null;
  owner_name?: string | null;
  expert_1?: number | null;
  expert_2?: number | null;
  // Связанные данные (загружаются при получении полной заявки)
  team_members?: TeamMember[];
  project_coordinators?: ProjectCoordinator[];
  dobro_responsible?: DobroResponsible[];
  project_plans?: ProjectPlan[];
  project_budget?: ProjectBudget[];
  additional_materials?: AdditionalMaterial[];
  expert1?: Expert | null;
  expert2?: Expert | null;
  expert_verdicts?: ExpertVerdict[];
  // Опционально заполненные связанные сущности (из JOIN или отдельного запроса)
  tender?: Tender;
  direction?: Direction;
}

export interface TeamMember {
  id?: number;
  application_id?: number | null;
  surname: string;
  name: string;
  patronymic?: string | null;
  position?: string | null;
  tasks_in_project?: string | null;
  contact_info?: string | null;
  social_media_links?: string | null;
  consent_file?: string | null; // Путь к файлу согласия (для прототипа)
  consent_files?: string[]; // Массив имён загруженных файлов
  is_minor?: boolean; // Совершеннолетний или нет (для выбора образца)
}

export interface ProjectCoordinator {
  id?: number;
  application_id?: number | null;
  team_member_id: number;
  relation_to_team?: string | null;
  education?: string | null;
  work_experience?: string | null;
  // Данные из team_members (заполняются при JOIN)
  team_member?: TeamMember;
}

export interface DobroResponsible {
  id?: number;
  application_id?: number | null;
  team_member_id: number;
  relation_to_team?: string | null;
  dobro_link?: string | null;
  // Данные из team_members (заполняются при JOIN)
  team_member?: TeamMember;
}

export interface Expert {
  id?: number;
  surname: string;
  name: string;
  patronymic?: string | null;
  extra_info?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExpertVerdict {
  id?: number;
  application_id: number;
  expert_id: number;
  verdict: 'approved' | 'rejected';
  comment?: string | null;
  created_at?: string;
  updated_at?: string;
  expert?: Expert;
}

export interface ProjectPlan {
  id?: number;
  application_id?: number | null;
  task: string;
  event_name: string;
  event_description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  results?: string | null;
  fixation_form?: string | null;
}

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
}

export interface AdditionalMaterial {
  id?: number;
  application_id?: number | null;
  file_path: string;
  file_url?: string;
  file_name: string;
  file_type?: string | null;
  file_size?: number | null;
  comment?: string | null;
  uploaded_at?: string;
}

export interface Tender {
  id: number;
  name: string;
  description?: string | null;
}

export interface Direction {
  id: number;
  name: string;
  description: string | null;
}

export interface Status {
  id: number;
  name: string;
  description: string | null;
  is_editable?: boolean;
  is_deletable?: boolean;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SingleApplicationResponse {
  success: boolean;
  data: Application;
}

export interface DirectionsResponse {
  success: boolean;
  data: Direction[];
}

export interface StatusesResponse {
  success: boolean;
  data: Status[];
}

export interface BadgeOption {
  id: string | number;
  label: string;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'document'
    | 'regulation'
    | 'form'
    | 'status-draft'
    | 'status-submitted'
    | 'status-review'
    | 'status-approved'
    | 'status-rejected';
}

export interface Document {
  id: number;
  title: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  is_template?: boolean;
  template_type?: string | null;
  download_count?: number;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentCategory {
  id: number;
  name: string;
  description?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}
