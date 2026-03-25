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
  owner_id?: number | null;
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
  expert1?: Expert | null;
  expert2?: Expert | null;
  expert_verdicts?: ExpertVerdict[];
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
  is_editable?: boolean;
  is_deletable?: boolean;
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

export interface Expert {
  id?: number;
  surname: string;
  name: string;
  patronymic?: string | null;
  extra_info?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ExpertVerdict {
  id?: number;
  application_id: number;
  expert_id: number;
  verdict: 'approved' | 'rejected';
  comment?: string | null;
  created_at?: Date;
  updated_at?: Date;
  expert?: Expert;
}

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
    ownerId?: number;
    userRole?: 'user' | 'admin';
  } = {}) {
    try {
      const { page = 1, limit = 10, search, direction_id, status_id, ownerId, userRole = 'user' } = options;
      const offset = (page - 1) * limit;

      let whereConditions: string[] = [];
      let params: (string | number)[] = [];
      let paramIndex = 1;

      // Разграничение доступа: обычные пользователи видят только свои заявки
      if (userRole !== 'admin') {
        whereConditions.push(`a.owner_id = $${paramIndex}`);
        params.push(ownerId || 0);
        paramIndex++;
      }

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
          s.name as status_name,
          u.email as owner_email,
          COALESCE(CONCAT(u.surname, ' ', u.name)) as owner_name
        FROM applications a
        LEFT JOIN directions d ON a.direction_id = d.id
        LEFT JOIN application_statuses s ON a.status_id = s.id
        LEFT JOIN users u ON a.owner_id = u.id
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
          t.name as tender_name,
          e1.surname as expert1_surname,
          e1.name as expert1_name,
          e1.patronymic as expert1_patronymic,
          e2.surname as expert2_surname,
          e2.name as expert2_name,
          e2.patronymic as expert2_patronymic
        FROM applications a
        LEFT JOIN directions d ON a.direction_id = d.id
        LEFT JOIN application_statuses s ON a.status_id = s.id
        LEFT JOIN tenders t ON a.tender_id = t.id
        LEFT JOIN experts e1 ON a.expert_1 = e1.id
        LEFT JOIN experts e2 ON a.expert_2 = e2.id
        WHERE a.id = $1
      `, [id]);

      if (appResult.rows.length === 0) {
        return null;
      }

      const application = appResult.rows[0];

      // Получаем связанные данные параллельно
      const [teamMembers, coordinators, dobro, plans, budget, materials, verdicts] = await Promise.all([
        pool.query('SELECT * FROM team_members WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM project_coordinators WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM dobro_responsible WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM project_plans WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM project_budget WHERE application_id = $1', [id]),
        pool.query('SELECT * FROM additional_materials WHERE application_id = $1', [id]),
        pool.query(`
          SELECT ev.*, e.surname, e.name, e.patronymic
          FROM expert_verdicts ev
          LEFT JOIN experts e ON ev.expert_id = e.id
          WHERE ev.application_id = $1
        `, [id]),
      ]);

      // Формируем объекты экспертов
      const expert1 = application.expert1_surname ? {
        id: application.expert_1,
        surname: application.expert1_surname,
        name: application.expert1_name,
        patronymic: application.expert1_patronymic,
      } : null;

      const expert2 = application.expert2_surname ? {
        id: application.expert_2,
        surname: application.expert2_surname,
        name: application.expert2_name,
        patronymic: application.expert2_patronymic,
      } : null;

      // Добавляем данные об экспертах к вердиктам
      const verdictsWithExpert = verdicts.rows.map((v) => ({
        ...v,
        expert: {
          id: v.expert_id,
          surname: v.surname,
          name: v.name,
          patronymic: v.patronymic,
        },
      }));

      return {
        ...application,
        expert1,
        expert2,
        expert_verdicts: verdictsWithExpert,
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
  static async create(data: ApplicationCreateData, ownerId?: number | null): Promise<ApplicationWithRelations> {
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
          title, tender_id, direction_id, status_id, owner_id, idea_description, importance_to_team,
          project_goal, project_tasks, implementation_experience, results_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        title,
        tender_id || null,
        direction_id || null,
        status_id || 1,
        ownerId || null,
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
            INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [applicationId, plan.task, plan.event_name, plan.event_description || null, plan.start_date || null, plan.end_date || null, plan.results || null, plan.fixation_form || null]);
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
  static async update(id: number, data: Partial<ApplicationCreateData>, userId?: number, userRole?: 'user' | 'admin'): Promise<ApplicationWithRelations | null> {
    const client = await pool.connect();
    try {
      // Проверяем права доступа
      const existingApp = await this.findById(id);

      if (!existingApp) {
        throw new Error('Заявка не найдена');
      }

      // Администратор может редактировать любые заявки
      // Пользователь может редактировать только свои заявки
      if (userRole !== 'admin') {
        if (existingApp.owner_id !== userId && existingApp.owner_id !== null) {
          throw new Error('Доступ запрещён. Вы можете редактировать только свои заявки');
        }

        // Проверяем, можно ли редактировать заявку в текущем статусе
        // Администратор может редактировать в любом статусе (в т.ч. для исправления ошибок)
        // Пользователь может редактировать только статусы с флагом is_editable = true
        // По умолчанию: Черновик (id=1) и Отклонена (id=5) имеют is_editable = true
        // Также добавляем Одобрена (id=4) для редактирования пользователем
        const editableStatuses = [1, 4, 5]; // Черновик, Одобрена, Отклонена
        if (existingApp.status_id && !editableStatuses.includes(existingApp.status_id)) {
          throw new Error(`Редактирование запрещено. Заявку можно редактировать только в статусах: Черновик, Одобрена, Отклонена`);
        }
      }

      await client.query('BEGIN');

      const fields: string[] = [];
      const values: (string | number | null)[] = [];
      let paramIndex = 1;

      const allowedFields: (keyof Application)[] = [
        'title', 'tender_id', 'direction_id', 'status_id', 'owner_id', 'idea_description',
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
            INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [id, plan.task, plan.event_name, plan.event_description || null, plan.start_date || null, plan.end_date || null, plan.results || null, plan.fixation_form || null]);
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
  static async delete(id: number, userId?: number, userRole?: 'user' | 'admin'): Promise<boolean> {
    try {
      // Проверяем права доступа
      if (userRole !== 'admin') {
        const existingApp = await this.findById(id);
        if (existingApp && existingApp.owner_id !== userId && existingApp.owner_id !== null) {
          throw new Error('Доступ запрещён. Вы можете удалять только свои заявки');
        }
      }

      const result = await pool.query('DELETE FROM applications WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database connection error in delete:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
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
   * Подать заявку (смена статуса на "Подана")
   */
  static async submit(id: number, userId?: number, userRole?: 'user' | 'admin'): Promise<ApplicationWithRelations | null> {
    const client = await pool.connect();
    try {
      const application = await this.findById(id);

      if (!application) {
        throw new Error('Заявка не найдена');
      }

      // Проверяем права доступа
      if (userRole !== 'admin' && application.owner_id !== userId) {
        throw new Error('Доступ запрещён. Вы можете подавать только свои заявки');
      }

      // Проверяем, можно ли подать заявку (только из черновика)
      if (application.status_id !== 1) {
        throw new Error('Заявку можно подать только из статуса "Черновик"');
      }

      // Проверяем заполненность обязательных полей
      const requiredFields = {
        'Название': application.title,
        'Описание идеи': application.idea_description,
        'Важность для команды': application.importance_to_team,
        'Цель проекта': application.project_goal,
        'Задачи проекта': application.project_tasks,
      };

      const emptyFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || value.trim() === '')
        .map(([name]) => name);

      if (emptyFields.length > 0) {
        throw new Error(`Не заполнены обязательные поля: ${emptyFields.join(', ')}`);
      }

      await client.query('BEGIN');

      // Обновляем статус на "Подана" (id=2) и устанавливаем дату подачи
      await client.query(`
        UPDATE applications
        SET status_id = 2, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

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
   * Изменить статус заявки (только для администратора)
   * Позволяет администратору перевести заявку в любой статус
   */
  static async updateStatus(id: number, newStatusId: number, userRole?: 'user' | 'admin'): Promise<ApplicationWithRelations | null> {
    const client = await pool.connect();
    try {
      // Проверяем, что пользователь — администратор
      if (userRole !== 'admin') {
        throw new Error('Доступ запрещён. Только администратор может менять статус заявки');
      }

      const application = await this.findById(id);

      if (!application) {
        throw new Error('Заявка не найдена');
      }

      // Проверяем, что статус существует
      const statuses = await this.getStatuses();
      const statusExists = statuses.some(s => s.id === newStatusId);

      if (!statusExists) {
        throw new Error('Некорректный ID статуса');
      }

      await client.query('BEGIN');

      // Обновляем статус
      await client.query(`
        UPDATE applications
        SET status_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newStatusId, id]);

      // Если заявка подаётся (переход в статус "Подана"), устанавливаем дату подачи
      if (newStatusId === 2 && application.status_id !== 2) {
        await client.query(`
          UPDATE applications
          SET submitted_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [id]);
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

  /**
   * Получить всех экспертов
   */
  static async getExperts() {
    try {
      const result = await pool.query('SELECT * FROM experts ORDER BY surname, name');
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in getExperts:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Назначить экспертов на заявку
   */
  static async assignExperts(applicationId: number, expert1Id: number | null, expert2Id: number | null): Promise<ApplicationWithRelations | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        UPDATE applications
        SET expert_1 = $1, expert_2 = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [expert1Id, expert2Id, applicationId]);

      await client.query('COMMIT');
      return await this.findById(applicationId) as ApplicationWithRelations | null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Добавить вердикт эксперта
   * Автоматически меняет статус заявки, если все эксперты выставили вердикты
   */
  static async addVerdict(applicationId: number, expertId: number, verdict: 'approved' | 'rejected', comment?: string | null): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Проверяем, есть ли уже вердикт от этого эксперта
      const existing = await client.query(
        'SELECT id FROM expert_verdicts WHERE application_id = $1 AND expert_id = $2',
        [applicationId, expertId]
      );

      if (existing.rows.length > 0) {
        // Обновляем существующий вердикт
        await client.query(`
          UPDATE expert_verdicts
          SET verdict = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
          WHERE application_id = $1 AND expert_id = $2
        `, [verdict, comment || null]);
      } else {
        // Создаём новый вердикт
        await client.query(`
          INSERT INTO expert_verdicts (application_id, expert_id, verdict, comment)
          VALUES ($1, $2, $3, $4)
        `, [applicationId, expertId, verdict, comment || null]);
      }

      // Проверяем, все ли эксперты выставили вердикты
      const verdictsResult = await client.query(
        'SELECT COUNT(*) as count FROM expert_verdicts WHERE application_id = $1',
        [applicationId]
      );
      const verdictCount = parseInt(verdictsResult.rows[0].count);

      // Если оба эксперта выставили вердикты (2 вердикта), меняем статус заявки
      if (verdictCount >= 2) {
        // Получаем все вердикты
        const allVerdicts = await client.query(
          'SELECT verdict FROM expert_verdicts WHERE application_id = $1',
          [applicationId]
        );

        // Проверяем, есть ли хотя бы один 'rejected'
        const hasRejection = allVerdicts.rows.some((v: { verdict: string }) => v.verdict === 'rejected');

        // Если есть отклонение — статус "Отклонена" (id=5), иначе "Одобрена" (id=4)
        const newStatusId = hasRejection ? 5 : 4;

        await client.query(`
          UPDATE applications
          SET status_id = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [newStatusId, applicationId]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Получить заявки, назначенные эксперту
   */
  static async findByExpert(expertId: number) {
    try {
      const result = await pool.query(`
        SELECT a.*, s.name as status_name
        FROM applications a
        LEFT JOIN application_statuses s ON a.status_id = s.id
        WHERE (a.expert_1 = $1 OR a.expert_2 = $1) AND a.deleted_at IS NULL
        ORDER BY a.created_at DESC
      `, [expertId]);
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in findByExpert:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }
}
