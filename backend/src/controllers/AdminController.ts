import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { ApplicationModel } from '../models/Application';
import { AuthRequest } from '../middleware/auth';

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
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
   * Получить всех экспертов
   * GET /api/admin/experts
   */
  static async getExperts(req: AuthRequest, res: Response) {
    try {
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
   * Получить вердикты экспертов для заявки
   * GET /api/admin/applications/:id/verdicts
   */
  static async getVerdicts(req: AuthRequest, res: Response) {
    try {
      // Только администраторы
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
}
