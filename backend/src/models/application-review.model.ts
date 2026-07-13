import pool from '../config/database';
import {
  Expert,
  ApplicationReview,
  ExpertVerdict,
  ReviewCreateData,
  VerdictCreateData,
  ReviewStatistics,
} from './types';

/**
 * Модель для работы с рецензиями экспертов
 */
export class ApplicationReviewModel {
  /**
   * Получить всех экспертов
   */
  static async getAllExperts(): Promise<Expert[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM experts WHERE deleted_at IS NULL ORDER BY surname, name'
      );
      return result.rows;
    } catch (error) {
      console.warn('Database error in getAllExperts:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить эксперта по ID
   */
  static async getExpertById(id: number): Promise<Expert | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM experts WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in getExpertById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать эксперта
   */
  static async createExpert(data: {
    surname: string;
    name: string;
    patronymic?: string | null;
    extra_info?: string | null;
    user_id?: number | null;
    status?: string | null;
    specialization_id?: number | null;
  }): Promise<Expert> {
    try {
      const result = await pool.query(`
        INSERT INTO experts (
          surname, name, patronymic, extra_info, user_id, status, specialization_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        data.surname,
        data.name,
        data.patronymic || null,
        data.extra_info || null,
        data.user_id || null,
        data.status || 'active',
        data.specialization_id || null,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Обновить эксперта
   */
  static async updateExpert(
    id: number,
    data: Partial<{
      surname: string;
      name: string;
      patronymic: string | null;
      extra_info: string | null;
      user_id: number | null;
      status: string | null;
      specialization_id: number | null;
    }>
  ): Promise<Expert | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    if (data.surname !== undefined) {
      fields.push(`surname = $${paramIndex++}`);
      values.push(data.surname);
    }

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.patronymic !== undefined) {
      fields.push(`patronymic = $${paramIndex++}`);
      values.push(data.patronymic);
    }

    if (data.extra_info !== undefined) {
      fields.push(`extra_info = $${paramIndex++}`);
      values.push(data.extra_info);
    }

    if (data.user_id !== undefined) {
      fields.push(`user_id = $${paramIndex++}`);
      values.push(data.user_id);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (data.specialization_id !== undefined) {
      fields.push(`specialization_id = $${paramIndex++}`);
      values.push(data.specialization_id);
    }

    if (fields.length === 0) {
      return this.getExpertById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    try {
      const result = await pool.query(`
        UPDATE experts
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in updateExpert:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Удалить эксперта (мягкое удаление)
   */
  static async deleteExpert(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE experts SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteExpert:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // ==================== Рецензии ====================

  /**
   * Получить все рецензии для заявки
   */
  static async findReviewsByApplication(applicationId: number): Promise<ApplicationReview[]> {
    try {
      const result = await pool.query(`
        SELECT ar.*, e.surname, e.name, e.patronymic
        FROM application_reviews ar
        LEFT JOIN experts e ON ar.expert_id = e.id
        WHERE ar.application_id = $1 AND ar.deleted_at IS NULL
        ORDER BY ar.created_at DESC
      `, [applicationId]);
      return result.rows;
    } catch (error) {
      console.warn('Database error in findReviewsByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить рецензию по ID
   */
  static async getReviewById(id: number): Promise<ApplicationReview | null> {
    try {
      const result = await pool.query(`
        SELECT ar.*, e.surname, e.name, e.patronymic
        FROM application_reviews ar
        LEFT JOIN experts e ON ar.expert_id = e.id
        WHERE ar.id = $1 AND ar.deleted_at IS NULL
      `, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in getReviewById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать рецензию
   */
  static async createReview(data: ReviewCreateData): Promise<ApplicationReview> {
    try {
      const result = await pool.query(`
        INSERT INTO application_reviews (
          application_id, expert_id, review_status, review_text
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        data.application_id,
        data.expert_id,
        data.review_status || 'in_progress',
        data.review_text || null,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Обновить рецензию
   */
  static async updateReview(
    id: number,
    data: Partial<ReviewCreateData>
  ): Promise<ApplicationReview | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    if (data.review_status !== undefined) {
      fields.push(`review_status = $${paramIndex++}`);
      values.push(data.review_status);
    }

    if (data.review_text !== undefined) {
      fields.push(`review_text = $${paramIndex++}`);
      values.push(data.review_text);
    }

    if (fields.length === 0) {
      return this.getReviewById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    try {
      const result = await pool.query(`
        UPDATE application_reviews
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in updateReview:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Удалить рецензию (мягкое удаление)
   */
  static async deleteReview(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE application_reviews SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteReview:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // ==================== Вердикты экспертов ====================

  /**
   * Получить все вердикты для заявки
   */
  static async findVerdictsByApplication(applicationId: number): Promise<ExpertVerdict[]> {
    try {
      const result = await pool.query(`
        SELECT ev.*, e.surname, e.name, e.patronymic
        FROM expert_verdicts ev
        LEFT JOIN experts e ON ev.expert_id = e.id
        WHERE ev.application_id = $1
        ORDER BY ev.created_at DESC
      `, [applicationId]);
      return result.rows;
    } catch (error) {
      console.warn('Database error in findVerdictsByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить вердикт по ID
   */
  static async getVerdictById(id: number): Promise<ExpertVerdict | null> {
    try {
      const result = await pool.query(`
        SELECT ev.*, e.surname, e.name, e.patronymic
        FROM expert_verdicts ev
        LEFT JOIN experts e ON ev.expert_id = e.id
        WHERE ev.id = $1
      `, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in getVerdictById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Добавить вердикт эксперта
   * Автоматически меняет статус заявки, если все эксперты выставили вердикты
   */
  static async addVerdict(data: VerdictCreateData): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Проверяем, есть ли уже вердикт от этого эксперта
      const existing = await client.query(
        'SELECT id FROM expert_verdicts WHERE application_id = $1 AND expert_id = $2',
        [data.application_id, data.expert_id]
      );

      if (existing.rows.length > 0) {
        // Обновляем существующий вердикт
        await client.query(`
          UPDATE expert_verdicts
          SET verdict = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
          WHERE application_id = $3 AND expert_id = $4
        `, [data.verdict, data.comment || null, data.application_id, data.expert_id]);
      } else {
        // Создаём новый вердикт
        await client.query(`
          INSERT INTO expert_verdicts (application_id, expert_id, verdict, comment)
          VALUES ($1, $2, $3, $4)
        `, [data.application_id, data.expert_id, data.verdict, data.comment || null]);
      }

      // Проверяем, все ли эксперты выставили вердикты
      const verdictsResult = await client.query(
        'SELECT COUNT(*) as count FROM expert_verdicts WHERE application_id = $1',
        [data.application_id]
      );
      const verdictCount = parseInt(verdictsResult.rows[0].count);

      // Получаем информацию о заявке
      const appResult = await client.query(
        'SELECT expert_1, expert_2 FROM applications WHERE id = $1',
        [data.application_id]
      );
      const app = appResult.rows[0];
      const expectedExpertCount = [app.expert_1, app.expert_2].filter((e: number | null) => e !== null).length;

      // Если все эксперты выставили вердикты, меняем статус заявки
      if (verdictCount >= expectedExpertCount && expectedExpertCount > 0) {
        // Получаем все вердикты
        const allVerdicts = await client.query(
          'SELECT verdict FROM expert_verdicts WHERE application_id = $1',
          [data.application_id]
        );

        // Проверяем, есть ли хотя бы один 'rejected'
        const hasRejection = allVerdicts.rows.some((v: { verdict: string }) => v.verdict === 'rejected');

        // Если есть отклонение — статус "Отклонена" (id=5), иначе "Одобрена" (id=4)
        const newStatusId = hasRejection ? 5 : 4;

        await client.query(`
          UPDATE applications
          SET status_id = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [newStatusId, data.application_id]);
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
   * Удалить вердикт
   */
  static async deleteVerdict(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM expert_verdicts WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteVerdict:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Назначить экспертов на заявку
   */
  static async assignExpertsToApplication(
    applicationId: number,
    expert1Id: number | null,
    expert2Id: number | null
  ): Promise<boolean> {
    try {
      const result = await pool.query(`
        UPDATE applications
        SET expert_1 = $1, expert_2 = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [expert1Id, expert2Id, applicationId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in assignExpertsToApplication:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Получить статистику по рецензиям
   */
  static async getReviewStatistics(): Promise<ReviewStatistics> {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_reviews,
          COUNT(CASE WHEN review_status = 'completed' THEN 1 END) as approved_count,
          COUNT(CASE WHEN review_status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN review_status = 'in_progress' OR review_status IS NULL THEN 1 END) as pending_count
        FROM application_reviews
        WHERE deleted_at IS NULL
      `);

      return {
        total_reviews: parseInt(result.rows[0].total_reviews) || 0,
        approved_count: parseInt(result.rows[0].approved_count) || 0,
        rejected_count: parseInt(result.rows[0].rejected_count) || 0,
        pending_count: parseInt(result.rows[0].pending_count) || 0,
      };
    } catch (error) {
      console.warn('Database error in getReviewStatistics:', error instanceof Error ? error.message : 'Unknown error');
      return {
        total_reviews: 0,
        approved_count: 0,
        rejected_count: 0,
        pending_count: 0,
      };
    }
  }

  /**
   * Получить количество необработанных вердиктов для эксперта
   */
  static async getPendingVerdictsCount(expertId: number): Promise<number> {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count
        FROM expert_verdicts ev
        JOIN applications a ON ev.application_id = a.id
        WHERE ev.expert_id = $1
        AND (a.status_id = 2 OR a.status_id = 3)
      `, [expertId]);
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.warn('Database error in getPendingVerdictsCount:', error instanceof Error ? error.message : 'Unknown error');
      return 0;
    }
  }
}
