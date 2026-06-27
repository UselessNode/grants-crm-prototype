import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

/**
 * Контроллер для работы экспертов
 * GET  /api/expert/profile          — профиль эксперта
 * GET  /api/expert/applications     — список заявок эксперта
 * GET  /api/expert/applications/:id — детальный просмотр заявки
 * POST /api/expert/applications/:id/verdict — вынести вердикт
 */
export class ExpertController {

  /**
   * Получить профиль эксперта (связка users + experts)
   */
  static async profile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      const result = await pool.query(`
        SELECT
          e.id,
          e.surname,
          e.name,
          e.patronymic,
          e.extra_info,
          e.status,
          e.specialization_id,
          d.name as specialization_name,
          e.created_at
        FROM experts e
        LEFT JOIN directions d ON e.specialization_id = d.id
        WHERE e.user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Профиль эксперта не найден',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error fetching expert profile:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении профиля эксперта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить список заявок, назначенных эксперту
   */
  static async getApplications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      // Получаем expert_id по user_id
      const expertResult = await pool.query(
        'SELECT id FROM experts WHERE user_id = $1',
        [userId]
      );

      if (expertResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Профиль эксперта не найден',
        });
      }

      const expertId = expertResult.rows[0].id;

      const applications = await pool.query(`
        SELECT
          a.id,
          a.title,
          a.status_id,
          s.name as status_name,
          a.direction_id,
          d.name as direction_name,
          a.tender_id,
          t.name as tender_name,
          a.created_at,
          a.submitted_at,
          a.updated_at,
          -- Вердикты эксперта по этой заявке
          ev.verdict,
          ev.comment,
          ev.created_at as verdict_date
        FROM applications a
        LEFT JOIN application_statuses s ON a.status_id = s.id
        LEFT JOIN directions d ON a.direction_id = d.id
        LEFT JOIN tenders t ON a.tender_id = t.id
        LEFT JOIN expert_verdicts ev ON ev.application_id = a.id AND ev.expert_id = $1
        WHERE (a.expert_1 = $1 OR a.expert_2 = $1)
          AND a.deleted_at IS NULL
        ORDER BY a.created_at DESC
      `, [expertId]);

      res.json({
        success: true,
        data: applications.rows,
      });
    } catch (error) {
      console.error('Error fetching expert applications:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заявок',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Детальный просмотр заявки для эксперта (с полной информацией)
   */
  static async getApplicationDetail(req: AuthRequest, res: Response) {
    try {
      const appId = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (isNaN(appId)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID заявки',
        });
      }

      // Получаем expert_id по user_id
      const expertResult = await pool.query(
        'SELECT id FROM experts WHERE user_id = $1',
        [userId]
      );

      if (expertResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Профиль эксперта не найден',
        });
      }

      const expertId = expertResult.rows[0].id;

      // Получаем заявку с привязкой, что эксперт назначен на неё
      const appResult = await pool.query(`
        SELECT
          a.*,
          s.name as status_name,
          d.name as direction_name,
          t.name as tender_name,
          u.surname as owner_surname,
          u.name as owner_name,
          u.patronymic as owner_patronymic,
          u.email as owner_email,
          e1.surname as expert1_surname,
          e1.name as expert1_name,
          e1.patronymic as expert1_patronymic,
          e2.surname as expert2_surname,
          e2.name as expert2_name,
          e2.patronymic as expert2_patronymic
        FROM applications a
        LEFT JOIN application_statuses s ON a.status_id = s.id
        LEFT JOIN directions d ON a.direction_id = d.id
        LEFT JOIN tenders t ON a.tender_id = t.id
        LEFT JOIN users u ON a.owner_id = u.id
        LEFT JOIN experts e1 ON a.expert_1 = e1.id
        LEFT JOIN experts e2 ON a.expert_2 = e2.id
        WHERE a.id = $1
          AND (a.expert_1 = $2 OR a.expert_2 = $2)
          AND a.deleted_at IS NULL
      `, [appId, expertId]);

      if (appResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена или у вас нет к ней доступа',
        });
      }

      const application = appResult.rows[0];

      // Получаем связанные данные
      const [
        teamMembers,
        coordinators,
        dobro,
        plans,
        budget,
        materials,
        verdicts
      ] = await Promise.all([
        pool.query('SELECT * FROM team_members WHERE application_id = $1', [appId]),
        pool.query(`
          SELECT c.*, tm.surname, tm.name, tm.patronymic
          FROM project_coordinators c
          LEFT JOIN team_members tm ON c.team_member_id = tm.id
          WHERE c.application_id = $1
        `, [appId]),
        pool.query(`
          SELECT d.*, tm.surname, tm.name, tm.patronymic
          FROM dobro_responsible d
          LEFT JOIN team_members tm ON d.team_member_id = tm.id
          WHERE d.application_id = $1
        `, [appId]),
        pool.query('SELECT * FROM project_plans WHERE application_id = $1', [appId]),
        pool.query('SELECT * FROM project_budget WHERE application_id = $1', [appId]),
        pool.query('SELECT * FROM additional_materials WHERE application_id = $1', [appId]),
        pool.query(`
          SELECT ev.*, e.surname, e.name, e.patronymic
          FROM expert_verdicts ev
          LEFT JOIN experts e ON ev.expert_id = e.id
          WHERE ev.application_id = $1
        `, [appId]),
      ]);

      res.json({
        success: true,
        data: {
          ...application,
          team_members: teamMembers.rows,
          project_coordinators: coordinators.rows,
          dobro_responsible: dobro.rows,
          project_plans: plans.rows,
          project_budget: budget.rows,
          additional_materials: materials.rows,
          expert_verdicts: verdicts.rows,
        },
      });
    } catch (error) {
      console.error('Error fetching application detail:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Вынести (или обновить) вердикт эксперта по заявке
   */
  static async submitVerdict(req: AuthRequest, res: Response) {
    try {
      const appId = parseInt(req.params.id);
      const userId = req.user?.userId;
      const { verdict, comment } = req.body;

      if (isNaN(appId)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID заявки',
        });
      }

      if (!verdict || (verdict !== 'approved' && verdict !== 'rejected')) {
        return res.status(400).json({
          success: false,
          message: 'Вердикт должен быть "approved" или "rejected"',
        });
      }

      // Получаем expert_id по user_id
      const expertResult = await pool.query(
        'SELECT id FROM experts WHERE user_id = $1 AND status = $2',
        [userId, 'approved']
      );

      if (expertResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Ваш профиль эксперта не подтверждён или не найден',
        });
      }

      const expertId = expertResult.rows[0].id;

      // Проверяем, что эксперт назначен на эту заявку
      const appCheck = await pool.query(`
        SELECT id FROM applications
        WHERE id = $1 AND (expert_1 = $2 OR expert_2 = $2) AND deleted_at IS NULL
      `, [appId, expertId]);

      if (appCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Вы не назначены экспертом на эту заявку',
        });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // UPSERT: вставляем или обновляем вердикт
        await client.query(`
          INSERT INTO expert_verdicts (application_id, expert_id, verdict, comment)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (application_id, expert_id)
          DO UPDATE SET verdict = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
        `, [appId, expertId, verdict, comment || null]);

        // Проверяем, оба ли эксперта вынесли вердикт
        const verdictCountResult = await client.query(`
          SELECT COUNT(*) as count FROM expert_verdicts WHERE application_id = $1
        `, [appId]);
        const verdictCount = parseInt(verdictCountResult.rows[0].count);

        if (verdictCount >= 2) {
          // Оба эксперта высказались — определяем итог
          const allVerdicts = await client.query(`
            SELECT verdict FROM expert_verdicts WHERE application_id = $1
          `, [appId]);

          const hasRejection = allVerdicts.rows.some((v: { verdict: string }) => v.verdict === 'rejected');
          const newStatusId = hasRejection ? 5 : 4; // 5 - отклонена, 4 - одобрена

          await client.query(`
            UPDATE applications
            SET status_id = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [newStatusId, appId]);
        }

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Вердикт успешно сохранён',
          data: {
            verdict,
            comment: comment || null,
          },
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error submitting verdict:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при сохранении вердикта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}