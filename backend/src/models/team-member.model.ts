import pool from '../config/database';
import {
  TeamMember,
  TeamMemberCreateData,
  ProjectCoordinator,
  DobroResponsible,
} from './types';

/**
 * Модель для работы с членами команды
 */
export class TeamMemberModel {
  /**
   * Получить всех членов команды для заявки
   */
  static async findByApplication(applicationId: number): Promise<TeamMember[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM team_members WHERE application_id = $1 AND deleted_at IS NULL ORDER BY surname, name',
        [applicationId]
      );
      return result.rows;
    } catch (error) {
      console.warn('Database error in findByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить חברа команды по ID
   */
  static async findById(id: number): Promise<TeamMember | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM team_members WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in findById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать члена команды
   */
  static async create(data: TeamMemberCreateData, applicationId: number): Promise<TeamMember> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(`
        INSERT INTO team_members (
          application_id, surname, name, patronymic, tasks_in_project, contact_info,
          social_media_links, forum_url, is_responsible, is_coordinator,
          education, work_experience, is_adult, consent_file_path
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        applicationId,
        data.surname,
        data.name,
        data.patronymic || null,
        data.tasks_in_project || null,
        data.contact_info || null,
        data.social_media_links || null,
        data.forum_url || null,
        data.is_responsible || false,
        data.is_coordinator || false,
        data.education || null,
        data.work_experience || null,
        data.is_adult || false,
        data.consent_file_path || null,
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Обновить члена команды
   */
  static async update(id: number, data: Partial<TeamMemberCreateData>): Promise<TeamMember | null> {
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    const allowedFields: (keyof TeamMemberCreateData)[] = [
      'surname', 'name', 'patronymic', 'tasks_in_project', 'contact_info',
      'social_media_links', 'forum_url', 'is_responsible', 'is_coordinator',
      'education', 'work_experience', 'is_adult', 'consent_file_path'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(data[field] as string | number | boolean | null);
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
        UPDATE team_members
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
   * Удалить члена команды (мягкое удаление)
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE team_members SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in delete:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Удалить всех членов команды для заявки
   */
  static async deleteByApplication(applicationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE team_members SET deleted_at = CURRENT_TIMESTAMP WHERE application_id = $1',
        [applicationId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // ==================== Координаторы проекта ====================

  /**
   * Получить всех координаторов проекта для заявки
   */
  static async getCoordinators(applicationId: number): Promise<ProjectCoordinator[]> {
    try {
      const result = await pool.query(`
        SELECT c.*, tm.surname, tm.name, tm.patronymic
        FROM project_coordinators c
        LEFT JOIN team_members tm ON c.team_member_id = tm.id
        WHERE c.application_id = $1 AND c.deleted_at IS NULL
        ORDER BY tm.surname, tm.name
      `, [applicationId]);
      return result.rows;
    } catch (error) {
      console.warn('Database error in getCoordinators:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Создать координатора проекта
   */
  static async createCoordinator(
    applicationId: number,
    teamMemberId: number,
    data: {
      relation_to_team?: string | null;
      education?: string | null;
      work_experience?: string | null;
    }
  ): Promise<ProjectCoordinator> {
    try {
      const result = await pool.query(`
        INSERT INTO project_coordinators (application_id, team_member_id, relation_to_team, education, work_experience)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [applicationId, teamMemberId, data.relation_to_team || null, data.education || null, data.work_experience || null]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удалить всех координаторов для заявки
   */
  static async deleteCoordinatorsByApplication(applicationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE project_coordinators SET deleted_at = CURRENT_TIMESTAMP WHERE application_id = $1',
        [applicationId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteCoordinatorsByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // ==================== Ответственные за Добро ====================

  /**
   * Получить всех ответственных за Добро для заявки
   */
  static async getDobroResponsible(applicationId: number): Promise<DobroResponsible[]> {
    try {
      const result = await pool.query(`
        SELECT d.*, tm.surname, tm.name, tm.patronymic
        FROM dobro_responsible d
        LEFT JOIN team_members tm ON d.team_member_id = tm.id
        WHERE d.application_id = $1 AND d.deleted_at IS NULL
        ORDER BY tm.surname, tm.name
      `, [applicationId]);
      return result.rows;
    } catch (error) {
      console.warn('Database error in getDobroResponsible:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Создать ответственного за Добро
   */
  static async createDobroResponsible(
    applicationId: number,
    teamMemberId: number,
    data: {
      relation_to_team?: string | null;
      dobro_link?: string | null;
    }
  ): Promise<DobroResponsible> {
    try {
      const result = await pool.query(`
        INSERT INTO dobro_responsible (application_id, team_member_id, relation_to_team, dobro_link)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [applicationId, teamMemberId, data.relation_to_team || null, data.dobro_link || null]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удалить всех ответственных за Добро для заявки
   */
  static async deleteDobroResponsibleByApplication(applicationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE dobro_responsible SET deleted_at = CURRENT_TIMESTAMP WHERE application_id = $1',
        [applicationId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteDobroResponsibleByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}
