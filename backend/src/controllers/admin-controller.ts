import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import { ApplicationModel } from '../models/application';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

/**
 * Контроллер для админ-панели
 */
export class AdminController {
  /**
   * Получить статистику для админ-панели
   * GET /api/admin/stats
   */
  static async stats(req: AuthRequest, res: Response) {
    try {
      // Получаем общую статистику
      const [usersCount, applicationsCount] = await Promise.all([
        UserModel.findAll({ page: 1, limit: 1 }),
        ApplicationModel.findAll({ page: 1, limit: 1 }),
      ]);

      res.json({
        success: true,
        data: {
          users: usersCount.pagination.total,
          applications: applicationsCount.pagination.total,
        },
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении статистики',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить список всех пользователей
   * GET /api/admin/users
   */
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { page, limit } = req.query;

      const result = await UserModel.findAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении пользователей',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить все заявки (для админ-панели)
   * GET /api/admin/applications
   */
  static async getApplications(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, direction_id, status_id } = req.query;

      const result = await ApplicationModel.findAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        search: search as string | undefined,
        direction_id: direction_id ? parseInt(direction_id as string) : undefined,
        status_id: status_id ? parseInt(status_id as string) : undefined,
        userRole: 'admin',
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заявок',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить все направления
   * GET /api/admin/directions
   */
  static async getDirections(req: AuthRequest, res: Response) {
    try {
      const directions = await ApplicationModel.getDirections();

      res.json({
        success: true,
        data: directions,
      });
    } catch (error) {
      console.error('Error fetching directions:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении направлений',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить все тендеры (конкурсы)
   * GET /api/admin/tenders
   */
  static async getTenders(req: AuthRequest, res: Response) {
    try {
      const tenders = await ApplicationModel.getTenders();

      res.json({
        success: true,
        data: tenders,
      });
    } catch (error) {
      console.error('Error fetching tenders:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении тендеров',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Создать направление
   * POST /api/admin/directions
   */
  static async createDirection(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, message: 'Название направления обязательно' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(`
          INSERT INTO directions (name, description)
          VALUES ($1, $2)
          RETURNING *
        `, [name, description || null]);
        await client.query('COMMIT');

        res.json({ success: true, data: result.rows[0] });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating direction:', error);
      res.status(500).json({ success: false, message: 'Ошибка при создании направления', error: error instanceof Error ? error.message : 'Неизвестная ошибка' });
    }
  }

  /**
   * Обновить направление
   * PUT /api/admin/directions/:id
   */
  static async updateDirection(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(`
          UPDATE directions
          SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `, [name || null, description || null, parseInt(id)]);

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Направление не найдено' });
        }

        await client.query('COMMIT');
        res.json({ success: true, data: result.rows[0] });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating direction:', error);
      res.status(500).json({ success: false, message: 'Ошибка при обновлении направления', error: error instanceof Error ? error.message : 'Неизвестная ошибка' });
    }
  }

  /**
   * Удалить направление
   * DELETE /api/admin/directions/:id
   */
  static async deleteDirection(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Проверяем связанные заявки
        const check = await client.query('SELECT COUNT(*) FROM applications WHERE direction_id = $1', [parseInt(id)]);
        const count = parseInt(check.rows[0].count);
        if (count > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: `Нельзя удалить направление: использовано в ${count} заявке(ах)` });
        }

        const result = await client.query('DELETE FROM directions WHERE id = $1 RETURNING *', [parseInt(id)]);
        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Направление не найдено' });
        }

        await client.query('COMMIT');
        res.json({ success: true });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error deleting direction:', error);
      res.status(500).json({ success: false, message: 'Ошибка при удалении направления', error: error instanceof Error ? error.message : 'Неизвестная ошибка' });
    }
  }

  /**
   * Создать тендер (конкурс)
   * POST /api/admin/tenders
   */
  static async createTender(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, message: 'Название тендера обязательно' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(`
          INSERT INTO tenders (name, description)
          VALUES ($1, $2)
          RETURNING *
        `, [name, description || null]);
        await client.query('COMMIT');

        res.json({ success: true, data: result.rows[0] });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating tender:', error);
      res.status(500).json({ success: false, message: 'Ошибка при создании тендера', error: error instanceof Error ? error.message : 'Неизвестная ошибка' });
    }
  }

  /**
   * Обновить тендер
   * PUT /api/admin/tenders/:id
   */
  static async updateTender(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(`
          UPDATE tenders
          SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `, [name || null, description || null, parseInt(id)]);

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Тендер не найден' });
        }

        await client.query('COMMIT');
        res.json({ success: true, data: result.rows[0] });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating tender:', error);
      res.status(500).json({ success: false, message: 'Ошибка при обновлении тендера', error: error instanceof Error ? error.message : 'Неизвестная ошибка' });
    }
  }

  /**
   * Удалить тендер
   * DELETE /api/admin/tenders/:id
   */
  static async deleteTender(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Проверяем связанные заявки
        const check = await client.query('SELECT COUNT(*) FROM applications WHERE tender_id = $1', [parseInt(id)]);
        const count = parseInt(check.rows[0].count);
        if (count > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: `Нельзя удалить тендер: использовано в ${count} заявке(ах)` });
        }

        const result = await client.query('DELETE FROM tenders WHERE id = $1 RETURNING *', [parseInt(id)]);
        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ success: false, message: 'Тендер не найден' });
        }

        await client.query('COMMIT');
        res.json({ success: true });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error deleting tender:', error);
      res.status(500).json({ success: false, message: 'Ошибка при удалении тендера', error: error instanceof Error ? error.message : 'Неизвестная ошибка' });
    }
  }

  /**
   * Получить всех экспертов
   * GET /api/admin/experts
   */
  static async getExperts(req: AuthRequest, res: Response) {
    try {
      const experts = await ApplicationModel.getExperts();

      res.json({
        success: true,
        data: experts,
      });
    } catch (error) {
      console.error('Error fetching experts:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении экспертов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Назначить экспертов на заявку
   * PUT /api/admin/applications/:id/experts
   */
  static async assignExperts(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { expert1Id, expert2Id } = req.body;

      const application = await ApplicationModel.assignExperts(
        parseInt(id),
        expert1Id ? parseInt(expert1Id) : null,
        expert2Id ? parseInt(expert2Id) : null
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error('Error assigning experts:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при назначении экспертов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Изменить статус заявки (только для администратора)
   * POST /api/admin/applications/:id/change-status
   */
  static async changeStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status_id } = req.body;

      if (!status_id || isNaN(parseInt(status_id))) {
        return res.status(400).json({
          success: false,
          message: 'status_id обязателен и должен быть числом',
        });
      }

      const application = await ApplicationModel.updateStatus(
        parseInt(id),
        parseInt(status_id),
        'admin'
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      res.json({
        success: true,
        message: 'Статус заявки успешно изменён',
        data: application,
      });
    } catch (error) {
      console.error('Error changing application status:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка при изменении статуса заявки',
      });
    }
  }

  /**
   * Получить вердикты экспертов для заявки
   * GET /api/admin/applications/:id/verdicts
   */
  static async getVerdicts(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const application = await ApplicationModel.findById(parseInt(id));

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      res.json({
        success: true,
        data: application.expert_verdicts || [],
      });
    } catch (error) {
      console.error('Error fetching verdicts:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении вердиктов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Добавить эксперта
   * POST /api/admin/experts
   */
  static async addExpert(req: AuthRequest, res: Response) {
    try {
      const { surname, name, patronymic, extra_info } = req.body;

      if (!surname || !name) {
        return res.status(400).json({
          success: false,
          message: 'Фамилия и имя обязательны',
        });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const result = await client.query(`
          INSERT INTO experts (surname, name, patronymic, extra_info)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [surname, name, patronymic || null, extra_info || null]);

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Эксперт успешно добавлен',
          data: result.rows[0],
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error adding expert:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при добавлении эксперта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Обновить данные пользователя
   * PUT /api/admin/users/:id
   */
  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { surname, name, patronymic, role_id } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const result = await client.query(`
          UPDATE users
          SET
            surname = $1,
            name = $2,
            patronymic = $3,
            role_id = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
          RETURNING *
        `, [surname || null, name || null, patronymic || null, role_id || 1, parseInt(id)]);

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            message: 'Пользователь не найден',
          });
        }

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Пользователь успешно обновлён',
          data: result.rows[0],
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении пользователя',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Удалить пользователя
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Нельзя удалить самого себя
      if (req.user && req.user.userId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Нельзя удалить самого себя',
        });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Проверяем, есть ли у пользователя заявки
        const applicationsCheck = await client.query(
          'SELECT COUNT(*) FROM applications WHERE owner_id = $1',
          [userId]
        );

        const applicationsCount = parseInt(applicationsCheck.rows[0].count);

        if (applicationsCount > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Нельзя удалить пользователя: у него есть ${applicationsCount} заявка(ок)`,
          });
        }

        // Мягкое удаление - устанавливаем deleted_at
        await client.query(
          'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Пользователь успешно удалён',
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении пользователя',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Обновить данные эксперта
   * PUT /api/admin/experts/:id
   */
  static async updateExpert(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { surname, name, patronymic, extra_info } = req.body;

      if (!surname || !name) {
        return res.status(400).json({
          success: false,
          message: 'Фамилия и имя обязательны',
        });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const result = await client.query(`
          UPDATE experts
          SET
            surname = $1,
            name = $2,
            patronymic = $3,
            extra_info = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
          RETURNING *
        `, [surname, name, patronymic || null, extra_info || null, parseInt(id)]);

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            message: 'Эксперт не найден',
          });
        }

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Эксперт успешно обновлён',
          data: result.rows[0],
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating expert:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении эксперта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Удалить эксперта
   * DELETE /api/admin/experts/:id
   */
  static async deleteExpert(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const expertId = parseInt(id);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Проверяем, назначен ли эксперт на заявки
        const assignmentsCheck = await client.query(`
          SELECT COUNT(*) FROM (
            SELECT 1 FROM applications WHERE expert_1 = $1
            UNION ALL
            SELECT 1 FROM applications WHERE expert_2 = $1
          ) AS assignments
        `, [expertId]);

        const assignmentsCount = parseInt(assignmentsCheck.rows[0].count);

        if (assignmentsCount > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Нельзя удалить эксперта: он назначен на ${assignmentsCount} заявка(ок)`,
          });
        }

        // Удаляем вердикты эксперта (каскадно)
        await client.query('DELETE FROM expert_verdicts WHERE expert_id = $1', [expertId]);

        // Удаляем эксперта
        await client.query('DELETE FROM experts WHERE id = $1', [expertId]);

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Эксперт успешно удалён',
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error deleting expert:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении эксперта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}
