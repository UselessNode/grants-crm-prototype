import pool from '../config/database';
import { ProjectBudget, ProjectBudgetCreateData, BudgetSummary } from './types';

/**
 * Модель для работы с бюджетом проекта
 */
export class ProjectBudgetModel {
  /**
   * Получить все статьи бюджета для заявки
   */
  static async findByApplication(applicationId: number): Promise<ProjectBudget[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM project_budget WHERE application_id = $1 AND deleted_at IS NULL ORDER BY resource_type',
        [applicationId]
      );
      return result.rows;
    } catch (error) {
      console.warn('Database error in findByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить статью бюджета по ID
   */
  static async findById(id: number): Promise<ProjectBudget | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM project_budget WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in findById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать статью бюджета
   */
  static async create(data: ProjectBudgetCreateData, applicationId: number): Promise<ProjectBudget> {
    try {
      // Вычисляем total_cost если есть unit_cost и quantity
      const totalCost = data.unit_cost && data.quantity
        ? data.unit_cost * data.quantity
        : data.total_cost || null;

      const result = await pool.query(`
        INSERT INTO project_budget (
          application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        applicationId,
        data.resource_type,
        data.unit_cost || null,
        data.quantity || null,
        totalCost,
        data.own_funds || null,
        data.grant_funds || null,
        data.comment || null,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Создать несколько статей бюджета
   */
  static async createMany(budgets: ProjectBudgetCreateData[], applicationId: number): Promise<ProjectBudget[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const createdBudgets: ProjectBudget[] = [];
      for (const budget of budgets) {
        // Вычисляем total_cost
        const totalCost = budget.unit_cost && budget.quantity
          ? budget.unit_cost * budget.quantity
          : budget.total_cost || null;

        const result = await client.query(`
          INSERT INTO project_budget (
            application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          applicationId,
          budget.resource_type,
          budget.unit_cost || null,
          budget.quantity || null,
          totalCost,
          budget.own_funds || null,
          budget.grant_funds || null,
          budget.comment || null,
        ]);
        createdBudgets.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdBudgets;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Обновить статью бюджета
   */
  static async update(id: number, data: Partial<ProjectBudgetCreateData> & { own_funds?: number | null; grant_funds?: number | null }): Promise<ProjectBudget | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    const allowedFields: (keyof ProjectBudgetCreateData)[] = [
      'resource_type', 'unit_cost', 'quantity', 'total_cost', 'comment'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(data[field] as string | number | null);
        paramIndex++;
      }
    }

    // Добавляем own_funds и grant_funds
    if (data.own_funds !== undefined) {
      fields.push(`own_funds = $${paramIndex}`);
      values.push(data.own_funds);
      paramIndex++;
    }

    if (data.grant_funds !== undefined) {
      fields.push(`grant_funds = $${paramIndex}`);
      values.push(data.grant_funds);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    try {
      const result = await pool.query(`
        UPDATE project_budget
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
   * Удалить статью бюджета (мягкое удаление)
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE project_budget SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in delete:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Удалить все статьи бюджета для заявки
   */
  static async deleteByApplication(applicationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE project_budget SET deleted_at = CURRENT_TIMESTAMP WHERE application_id = $1',
        [applicationId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Заменить все статьи бюджета для заявки
   */
  static async replaceForApplication(applicationId: number, budgets: ProjectBudgetCreateData[]): Promise<ProjectBudget[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Удаляем старые статьи
      await client.query('DELETE FROM project_budget WHERE application_id = $1', [applicationId]);

      // Добавляем новые статьи
      const createdBudgets: ProjectBudget[] = [];
      for (const budget of budgets) {
        const totalCost = budget.unit_cost && budget.quantity
          ? budget.unit_cost * budget.quantity
          : budget.total_cost || null;

        const result = await client.query(`
          INSERT INTO project_budget (
            application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          applicationId,
          budget.resource_type,
          budget.unit_cost || null,
          budget.quantity || null,
          totalCost,
          budget.own_funds || null,
          budget.grant_funds || null,
          budget.comment || null,
        ]);
        createdBudgets.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdBudgets;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Получить сводку бюджета для заявки
   */
  static async getSummary(applicationId: number): Promise<BudgetSummary> {
    try {
      const result = await pool.query(`
        SELECT
          COALESCE(SUM(own_funds), 0) as total_own_funds,
          COALESCE(SUM(grant_funds), 0) as total_grant_funds,
          COALESCE(SUM(total_cost), 0) as total_cost
        FROM project_budget
        WHERE application_id = $1 AND deleted_at IS NULL
      `, [applicationId]);

      return {
        total_own_funds: parseFloat(result.rows[0].total_own_funds) || 0,
        total_grant_funds: parseFloat(result.rows[0].total_grant_funds) || 0,
        total_cost: parseFloat(result.rows[0].total_cost) || 0,
      };
    } catch (error) {
      console.warn('Database error in getSummary:', error instanceof Error ? error.message : 'Unknown error');
      return {
        total_own_funds: 0,
        total_grant_funds: 0,
        total_cost: 0,
      };
    }
  }

  /**
   * Получить распределение бюджета по типам ресурсов
   */
  static async getDistribution(applicationId: number): Promise<Record<string, { own: number; grant: number; total: number }>> {
    try {
      const result = await pool.query(`
        SELECT
          resource_type,
          COALESCE(SUM(own_funds), 0) as own_funds,
          COALESCE(SUM(grant_funds), 0) as grant_funds,
          COALESCE(SUM(total_cost), 0) as total_cost
        FROM project_budget
        WHERE application_id = $1 AND deleted_at IS NULL
        GROUP BY resource_type
        ORDER BY total_cost DESC
      `, [applicationId]);

      const distribution: Record<string, { own: number; grant: number; total: number }> = {};
      for (const row of result.rows) {
        distribution[row.resource_type] = {
          own: parseFloat(row.own_funds) || 0,
          grant: parseFloat(row.grant_funds) || 0,
          total: parseFloat(row.total_cost) || 0,
        };
      }
      return distribution;
    } catch (error) {
      console.warn('Database error in getDistribution:', error instanceof Error ? error.message : 'Unknown error');
      return {};
    }
  }
}
