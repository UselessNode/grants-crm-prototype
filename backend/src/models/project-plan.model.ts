import pool from '../config/database';
import { ProjectPlan, ProjectPlanCreateData } from './types';

/**
 * Модель для работы с планом проекта
 */
export class ProjectPlanModel {
  /**
   * Получить все планы проекта для заявки
   */
  static async findByApplication(applicationId: number): Promise<ProjectPlan[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM project_plans WHERE application_id = $1 AND deleted_at IS NULL ORDER BY start_date, event_name',
        [applicationId]
      );
      return result.rows;
    } catch (error) {
      console.warn('Database error in findByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить план проекта по ID
   */
  static async findById(id: number): Promise<ProjectPlan | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM project_plans WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in findById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать план проекта
   */
  static async create(data: ProjectPlanCreateData, applicationId: number): Promise<ProjectPlan> {
    try {
      const result = await pool.query(`
        INSERT INTO project_plans (
          application_id, task, event_name, event_description, start_date, end_date, results, fixation_form
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        applicationId,
        data.task,
        data.event_name,
        data.event_description || null,
        data.start_date || null,
        data.end_date || null,
        data.results || null,
        data.fixation_form || null,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Создать несколько планов проекта
   */
  static async createMany(plans: ProjectPlanCreateData[], applicationId: number): Promise<ProjectPlan[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const createdPlans: ProjectPlan[] = [];
      for (const plan of plans) {
        const result = await client.query(`
          INSERT INTO project_plans (
            application_id, task, event_name, event_description, start_date, end_date, results, fixation_form
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
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
        createdPlans.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdPlans;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Обновить план проекта
   */
  static async update(id: number, data: Partial<ProjectPlanCreateData>): Promise<ProjectPlan | null> {
    const fields: string[] = [];
    const values: (string | Date | null)[] = [];
    let paramIndex = 1;

    const allowedFields: (keyof ProjectPlanCreateData)[] = [
      'task', 'event_name', 'event_description', 'start_date', 'end_date', 'results', 'fixation_form'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(data[field] as string | Date | null);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    try {
      const result = await pool.query(`
        UPDATE project_plans
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in update:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Удалить план проекта (мягкое удаление)
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE project_plans SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in delete:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Удалить все планы проекта для заявки
   */
  static async deleteByApplication(applicationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE project_plans SET deleted_at = CURRENT_TIMESTAMP WHERE application_id = $1',
        [applicationId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Заменить все планы проекта для заявки
   */
  static async replaceForApplication(applicationId: number, plans: ProjectPlanCreateData[]): Promise<ProjectPlan[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Удаляем старые планы
      await client.query('DELETE FROM project_plans WHERE application_id = $1', [applicationId]);

      // Добавляем новые планы
      const createdPlans: ProjectPlan[] = [];
      for (const plan of plans) {
        const result = await client.query(`
          INSERT INTO project_plans (
            application_id, task, event_name, event_description, start_date, end_date, results, fixation_form
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
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
        createdPlans.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdPlans;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
