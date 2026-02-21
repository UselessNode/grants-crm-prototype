import pool from '../config/database';

/**
 * Интерфейс для заявки
 */
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
  created_at?: Date;
  updated_at?: Date;
  submitted_at?: Date | null;
}

/**
 * Интерфейс для создания/обновления заявки со связанными данными
 */
export interface ApplicationCreateData extends Application {
  team_members?: TeamMember[];
  coordinators?: ProjectCoordinator[];
  dobro_responsible?: DobroResponsible[];
  project_plans?: ProjectPlan[];
  project_budget?: ProjectBudget[];
}

/**
 * Интерфейс для заявки с связанными данными
 */
export interface ApplicationWithRelations extends Application {
  direction?: Direction | null;
  status?: ApplicationStatus | null;
  tender?: Tender | null;
  team_members?: TeamMember[];
  project_coordinators?: ProjectCoordinator[];
  dobro_responsible?: DobroResponsible[];
  project_plans?: ProjectPlan[];
  project_budget?: ProjectBudget[];
  additional_materials?: AdditionalMaterial[];
}

export interface Direction {
  id?: number;
  name: string;
  description?: string | null;
  tender_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Tender {
  id?: number;
  name: string;
  description?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ApplicationStatus {
  id?: number;
  name: string;
  description?: string | null;
}

export interface TeamMember {
  id?: number;
  application_id?: number | null;
  surname: string;
  name: string;
  patronymic?: string | null;
  tasks_in_project?: string | null;
  contact_info?: string | null;
  social_media_links?: string | null;
}

export interface ProjectCoordinator {
  id?: number;
  application_id?: number | null;
  surname: string;
  name: string;
  patronymic?: string | null;
  relation_to_team?: string | null;
  contact_info?: string | null;
  social_media_links?: string | null;
  education?: string | null;
  work_experience?: string | null;
}

export interface DobroResponsible {
  id?: number;
  application_id?: number | null;
  surname: string;
  name: string;
  patronymic?: string | null;
  relation_to_team?: string | null;
  contact_info?: string | null;
  social_media_links?: string | null;
}

export interface ProjectPlan {
  id?: number;
  application_id?: number | null;
  task: string;
  event_name: string;
  event_description?: string | null;
  deadline?: Date | null;
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
  file_name: string;
  file_type?: string | null;
  file_size?: number | null;
  comment?: string | null;
  uploaded_at?: Date;
}

/**
 * Класс для работы с заявками
 */
export class ApplicationModel {
  /**
   * Получить все заявки с пагинацией, поиском и фильтрацией
   */
  static async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    direction_id?: number;
    status_id?: number;
  } = {}) {
    try {
      const { page = 1, limit = 10, search, direction_id, status_id } = options;
      const offset = (page - 1) * limit;

      let whereConditions: string[] = [];
      let params: (string | number)[] = [];
      let paramIndex = 1;

      if (search) {
        whereConditions.push(`(a.title ILIKE $${paramIndex} OR a.idea_description ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (direction_id) {
        whereConditions.push(`a.direction_id = $${paramIndex}`);
        params.push(direction_id);
        paramIndex++;
      }

      if (status_id) {
        whereConditions.push(`a.status_id = $${paramIndex}`);
        params.push(status_id);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Получаем общее количество записей
      const countQuery = `
        SELECT COUNT(*) as total
        FROM applications a
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Получаем данные с пагинацией
      const dataQuery = `
        SELECT
          a.*,
          d.name as direction_name,
          s.name as status_name
        FROM applications a
        LEFT JOIN directions d ON a.direction_id = d.id
        LEFT JOIN application_statuses s ON a.status_id = s.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      const dataParams = [...params, limit, offset];
      const dataResult = await pool.query(dataQuery, dataParams);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      // Если БД не доступна, возвращаем пустой результат
      console.warn('Database connection error in findAll:', error instanceof Error ? error.message : 'Unknown error');
      return {
        data: [],
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  /**
   * Получить заявку по ID со всеми связанными данными
   */
  static async findById(id: number): Promise<ApplicationWithRelations | null> {
    try {
      // Получаем основную заявку
      const appResult = await pool.query(`
        SELECT
          a.*,
          d.name as direction_name,
          d.description as direction_description,
          s.name as status_name,
          t.name as tender_name
        FROM applications a
        LEFT JOIN directions d ON a.direction_id = d.id
        LEFT JOIN application_statuses s ON a.status_id = s.id
        LEFT JOIN tenders t ON a.tender_id = t.id
        WHERE a.id = $1
      `, [id]);

      if (appResult.rows.length === 0) {
        return null;
      }

      const application = appResult.rows[0];

      // Получаем связанные данные параллельно
      const [teamMembers, coordinators, dobro, plans, budget, materials] = await Promise.all([
        pool.query('SELECT * FROM team_members WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM project_coordinators WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM dobro_responsible WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM project_plans WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM project_budget WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM additional_materials WHERE application_id = $1', [id]),
      ]);

      return {
        ...application,
        team_members: teamMembers.rows,
        project_coordinators: coordinators.rows,
        dobro_responsible: dobro.rows,
        project_plans: plans.rows,
        project_budget: budget.rows,
        additional_materials: materials.rows,
      };
    } catch (error) {
      console.warn('Database connection error in findById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать новую заявку
   */
  static async create(data: ApplicationCreateData): Promise<ApplicationWithRelations> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        title,
        tender_id,
        direction_id,
        status_id,
        idea_description,
        importance_to_team,
        project_goal,
        project_tasks,
        implementation_experience,
        results_description,
        team_members,
        coordinators,
        dobro_responsible,
        project_plans,
        project_budget,
      } = data;

      // Создаем основную заявку
      const appResult = await client.query(`
        INSERT INTO applications (
          title, tender_id, direction_id, status_id, idea_description, importance_to_team,
          project_goal, project_tasks, implementation_experience, results_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        title,
        tender_id || null,
        direction_id || null,
        status_id || 1,
        idea_description,
        importance_to_team,
        project_goal,
        project_tasks,
        implementation_experience || null,
        results_description || null,
      ]);

      const application = appResult.rows[0];
      const applicationId = application.id;

      // Вставляем связанные данные
      if (team_members && team_members.length > 0) {
        for (const member of team_members) {
          await client.query(`
            INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [applicationId, member.surname, member.name, member.patronymic || null, member.tasks_in_project || null, member.contact_info || null, member.social_media_links || null]);
        }
      }

      if (coordinators && coordinators.length > 0) {
        for (const coord of coordinators) {
          await client.query(`
            INSERT INTO project_coordinators (application_id, surname, name, patronymic, relation_to_team, contact_info, social_media_links, education, work_experience)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [applicationId, coord.surname, coord.name, coord.patronymic || null, coord.relation_to_team || null, coord.contact_info || null, coord.social_media_links || null, coord.education || null, coord.work_experience || null]);
        }
      }

      if (dobro_responsible && dobro_responsible.length > 0) {
        for (const dobro of dobro_responsible) {
          await client.query(`
            INSERT INTO dobro_responsible (application_id, surname, name, patronymic, relation_to_team, contact_info, social_media_links)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [applicationId, dobro.surname, dobro.name, dobro.patronymic || null, dobro.relation_to_team || null, dobro.contact_info || null, dobro.social_media_links || null]);
        }
      }

      if (project_plans && project_plans.length > 0) {
        for (const plan of project_plans) {
          await client.query(`
            INSERT INTO project_plans (application_id, task, event_name, event_description, deadline, results, fixation_form)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [applicationId, plan.task, plan.event_name, plan.event_description || null, plan.deadline || null, plan.results || null, plan.fixation_form || null]);
        }
      }

      if (project_budget && project_budget.length > 0) {
        for (const budget of project_budget) {
          await client.query(`
            INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [applicationId, budget.resource_type, budget.unit_cost || null, budget.quantity || null, budget.total_cost || null, budget.own_funds || null, budget.grant_funds || null, budget.comment || null]);
        }
      }

      await client.query('COMMIT');

      // Возвращаем заявку со всеми связанными данными
      return await this.findById(applicationId) as ApplicationWithRelations;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Обновить заявку
   */
  static async update(id: number, data: Partial<ApplicationCreateData>): Promise<ApplicationWithRelations | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const fields: string[] = [];
      const values: (string | number | null)[] = [];
      let paramIndex = 1;

      const allowedFields: (keyof Application)[] = [
        'title', 'tender_id', 'direction_id', 'status_id', 'idea_description',
        'importance_to_team', 'project_goal', 'project_tasks',
        'implementation_experience', 'results_description', 'submitted_at'
      ];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          fields.push(`${field} = $${paramIndex}`);
          values.push(data[field] as string | number | null);
          paramIndex++;
        }
      }

      if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        await client.query(`
          UPDATE applications
          SET ${fields.join(', ')}
          WHERE id = $${paramIndex}
        `, values);
      }

      // Обновляем связанные данные (полная замена)
      if (data.team_members !== undefined) {
        await client.query('DELETE FROM team_members WHERE application_id = $1', [id]);
        for (const member of data.team_members) {
          await client.query(`
            INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [id, member.surname, member.name, member.patronymic || null, member.tasks_in_project || null, member.contact_info || null, member.social_media_links || null]);
        }
      }

      if (data.coordinators !== undefined) {
        await client.query('DELETE FROM project_coordinators WHERE application_id = $1', [id]);
        for (const coord of data.coordinators) {
          await client.query(`
            INSERT INTO project_coordinators (application_id, surname, name, patronymic, relation_to_team, contact_info, social_media_links, education, work_experience)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [id, coord.surname, coord.name, coord.patronymic || null, coord.relation_to_team || null, coord.contact_info || null, coord.social_media_links || null, coord.education || null, coord.work_experience || null]);
        }
      }

      if (data.dobro_responsible !== undefined) {
        await client.query('DELETE FROM dobro_responsible WHERE application_id = $1', [id]);
        for (const dobro of data.dobro_responsible) {
          await client.query(`
            INSERT INTO dobro_responsible (application_id, surname, name, patronymic, relation_to_team, contact_info, social_media_links)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [id, dobro.surname, dobro.name, dobro.patronymic || null, dobro.relation_to_team || null, dobro.contact_info || null, dobro.social_media_links || null]);
        }
      }

      if (data.project_plans !== undefined) {
        await client.query('DELETE FROM project_plans WHERE application_id = $1', [id]);
        for (const plan of data.project_plans) {
          await client.query(`
            INSERT INTO project_plans (application_id, task, event_name, event_description, deadline, results, fixation_form)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [id, plan.task, plan.event_name, plan.event_description || null, plan.deadline || null, plan.results || null, plan.fixation_form || null]);
        }
      }

      if (data.project_budget !== undefined) {
        await client.query('DELETE FROM project_budget WHERE application_id = $1', [id]);
        for (const budget of data.project_budget) {
          await client.query(`
            INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [id, budget.resource_type, budget.unit_cost || null, budget.quantity || null, budget.total_cost || null, budget.own_funds || null, budget.grant_funds || null, budget.comment || null]);
        }
      }

      await client.query('COMMIT');

      return await this.findById(id) as ApplicationWithRelations | null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Удалить заявку
   */
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM applications WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Получить все направления
   */
  static async getDirections() {
    try {
      const result = await pool.query('SELECT * FROM directions ORDER BY name');
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in getDirections:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить все статусы
   */
  static async getStatuses() {
    try {
      const result = await pool.query('SELECT * FROM application_statuses ORDER BY id');
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in getStatuses:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить все тендеры
   */
  static async getTenders() {
    try {
      const result = await pool.query('SELECT * FROM tenders ORDER BY name');
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in getTenders:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }
}
