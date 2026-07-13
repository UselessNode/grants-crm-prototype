/**
 * Интерфейсы для членов команды (team_members)
 */

export interface TeamMember {
  id?: number;
  application_id?: number | null;
  surname: string;
  name: string;
  patronymic?: string | null;
  tasks_in_project?: string | null;
  contact_info?: string | null;
  social_media_links?: string | null;
  forum_url?: string | null;
  is_responsible?: boolean;
  is_coordinator?: boolean;
  education?: string | null;
  work_experience?: string | null;
  is_adult?: boolean;
  consent_file_path?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface TeamMemberCreateData extends Omit<TeamMember, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {
  consent_files?: string[];
}

export interface ProjectCoordinator {
  id?: number;
  application_id?: number | null;
  team_member_id: number;
  relation_to_team?: string | null;
  education?: string | null;
  work_experience?: string | null;
  team_member?: TeamMember | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface DobroResponsible {
  id?: number;
  application_id?: number | null;
  team_member_id: number;
  relation_to_team?: string | null;
  dobro_link?: string | null;
  team_member?: TeamMember | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}
