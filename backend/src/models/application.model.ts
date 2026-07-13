import pool from '../config/database';
import {
  Application,
  ApplicationWithRelations,
  ApplicationCreateData,
  ApplicationFilterOptions,
  PaginatedResult,
  ApplicationStatus,
  Direction,
  Tender,
} from './types';

export { ApplicationCreateData };

/**
 * Модель для работы с заявками
 */
export class ApplicationModel {
  /**
   * Получить все заявки с пагинацией, поиском и фильтрацией
   */
  static async findAll(options: ApplicationFilterOptions = {}): Promise<PaginatedResult<any>> {
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
          t.name as tender_name,
          u.email as owner_email,
          COALESCE(CONCAT(u.surname, ' ', u.name)) as owner_name
        FROM applications a
        LEFT JOIN directions d ON a.direction_id = d.id
        LEFT JOIN application_statuses s ON a.status_id = s.id
        LEFT JOIN tenders t ON a.tender_id = t.id
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
   * Получить заявку по ID с основными связанными данными
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
      const [teamMembers, projectPlans, projectBudget, additionalMaterials] = await Promise.all([
        pool.query('SELECT * FROM team_members WHERE application_id = $1 AND deleted_at IS NULL', [id]),
        pool.query('SELECT * FROM project_plans WHERE application_id = $1 AND deleted_at IS NULL', [id]),
        pool.query('SELECT * FROM project_budget WHERE application_id = $1 AND deleted_at IS NULL', [id]),
        pool.query('SELECT * FROM additional_materials WHERE application_id = $1 AND deleted_at IS NULL', [id]),
      ]);

      return {
        ...application,
        team_members: teamMembers.rows,
        project_plans: projectPlans.rows,
        project_budget: projectBudget.rows,
        additional_materials: additionalMaterials.rows,
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

      // Вставляем team_members
      if (team_members && team_members.length > 0) {
        for (const member of team_members) {
          await client.query(`
            INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, forum_url, is_responsible, is_coordinator, education, work_experience, is_adult, consent_file_path)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `, [
            applicationId,
            member.surname,
            member.name,
            member.patronymic || null,
            member.tasks_in_project || null,
            member.contact_info || null,
            member.social_media_links || null,
            member.forum_url || null,
            member.is_responsible || false,
            member.is_coordinator || false,
            member.education || null,
            member.work_experience || null,
            member.is_adult || false,
            member.consent_file_path || null,
          ]);
        }
      }

      // Вставляем project_plans
      if (project_plans && project_plans.length > 0) {
        for (const plan of project_plans) {
          await client.query(`
            INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            applicationId,
            plan.task,
            plan.event_name,
            plan.event_description || null,
            plan.start_date || null,
            plan.end_date || null,
            plan.results || null,
            plan.fixation_form || null,
          ]);
        }
      }

      // Вставляем project_budget
      if (project_budget && project_budget.length > 0) {
        for (const budget of project_budget) {
          await client.query(`
            INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, own_funds, grant_funds, comment)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            applicationId,
            budget.resource_type,
            budget.unit_cost || null,
            budget.quantity || null,
            budget.own_funds || null,
            budget.grant_funds || null,
            budget.comment || null,
          ]);
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
  static async update(
    id: number,
    data: Partial<ApplicationCreateData> & { team_members?: any[]; project_plans?: any[]; project_budget?: any[] },
    userId?: number,
    userRole?: 'user' | 'admin'
  ): Promise<ApplicationWithRelations | null> {
    const client = await pool.connect();
    try {
      // Проверяем права доступа
      const existingApp = await this.findById(id);

      if (!existingApp) {
        throw new Error('Заявка не найдена');
      }

      // Администратор может редактировать любые заявки
      if (userRole !== 'admin') {
        if (existingApp.owner_id !== userId && existingApp.owner_id !== null) {
          throw new Error('Доступ запреён. Вы можете редактировать только свои заявки');
        }

        // Проверяем, можно ли редактировать заявку в текущем статусе
        const editableStatuses = [1, 4, 5]; // Черновик, Одобрена, Отклонена
        if (existingApp.status_id && !editableStatuses.includes(existingApp.status_id)) {
          throw new Error(`Редактирование запрещено. Заявку можно редактировать только в статусах: Черновик, Одобрена, Отклонена`);
        }
      }

      await client.query('BEGIN');

      // Обновляем основную заявку
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
            INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, forum_url, is_responsible, is_coordinator, education, work_experience, is_adult, consent_file_path)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `, [
            id,
            member.surname,
            member.name,
            member.patronymic || null,
            member.tasks_in_project || null,
            member.contact_info || null,
            member.social_media_links || null,
            member.forum_url || null,
            member.is_responsible || false,
            member.is_coordinator || false,
            member.education || null,
            member.work_experience || null,
            member.is_adult || false,
            member.consent_file_path || null,
          ]);
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
            INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, own_funds, grant_funds, comment)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [id, budget.resource_type, budget.unit_cost || null, budget.quantity || null, budget.own_funds || null, budget.grant_funds || null, budget.comment || null]);
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
          throw new Error('Доступ запреён. Вы можете удалять только свои заявки');
        }
      }

      const result = await pool.query('UPDATE applications SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database connection error in delete:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
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
        throw new Error('Доступ запреён. Вы можете подавать только свои заявки');
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
   */
  static async updateStatus(id: number, newStatusId: number, userRole?: 'user' | 'admin'): Promise<ApplicationWithRelations | null> {
    const client = await pool.connect();
    try {
      // Проверяем, что пользователь — администратор
      if (userRole !== 'admin') {
        throw new Error('Доступ запреён. Только администратор может менять статус заявки');
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
   * Получить все направления
   */
  static async getDirections(): Promise<Direction[]> {
    try {
      const result = await pool.query('SELECT * FROM directions WHERE deleted_at IS NULL ORDER BY name');
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in getDirections:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить все статусы
   */
  static async getStatuses(): Promise<ApplicationStatus[]> {
    try {
      const result = await pool.query('SELECT * FROM application_statuses WHERE deleted_at IS NULL ORDER BY id');
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in getStatuses:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить все тендеры
   */
  static async getTenders(): Promise<Tender[]> {
    try {
      const result = await pool.query('SELECT * FROM tenders WHERE deleted_at IS NULL ORDER BY name');
      return result.rows;
    } catch (error) {
      console.warn('Database connection error in getTenders:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить заявки, назначенные эксперту
   */
  static async findByExpert(expertId: number): Promise<any[]> {
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
