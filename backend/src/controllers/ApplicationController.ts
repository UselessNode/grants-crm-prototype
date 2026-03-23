import { Request, Response } from 'express';
import { ApplicationModel, ApplicationCreateData } from '../models/Application';
import { AuthRequest } from '../middleware/auth';

/**
 * Контроллер для управления заявками
 */
export class ApplicationController {
  /**
   * Получить список заявок с пагинацией, поиском и фильтрацией
   * GET /api/applications
   */
  static async index(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, direction_id, status_id } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      const result = await ApplicationModel.findAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string | undefined,
        direction_id: direction_id ? parseInt(direction_id as string) : undefined,
        status_id: status_id ? parseInt(status_id as string) : undefined,
        ownerId: userId,
        userRole: userRole as 'user' | 'admin',
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка заявок',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить заявку по ID
   * GET /api/applications/:id
   */
  static async show(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID заявки',
        });
      }

      const application = await ApplicationModel.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      // Проверяем права доступа: админ видит все, пользователь - только свои
      if (userRole !== 'admin' && application.owner_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Вы можете просматривать только свои заявки',
        });
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Создать новую заявку
   * POST /api/applications
   */
  static async create(req: AuthRequest, res: Response) {
    try {
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
      } = req.body;

      // Валидация обязательных полей
      if (!title || !idea_description || !importance_to_team || !project_goal || !project_tasks) {
        return res.status(400).json({
          success: false,
          message: 'Заполните все обязательные поля',
          errors: {
            title: !title ? 'Название обязательно' : null,
            idea_description: !idea_description ? 'Описание идеи обязательно' : null,
            importance_to_team: !importance_to_team ? 'Важность для команды обязательна' : null,
            project_goal: !project_goal ? 'Цель проекта обязательна' : null,
            project_tasks: !project_tasks ? 'Задачи проекта обязательны' : null,
          },
        });
      }

      const applicationData: ApplicationCreateData = {
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
      };

      const ownerId = req.user?.userId;
      const newApplication = await ApplicationModel.create(applicationData, ownerId);

      res.status(201).json({
        success: true,
        message: 'Заявка успешно создана',
        data: newApplication,
      });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Обновить заявку
   * PUT /api/applications/:id
   */
  static async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID заявки',
        });
      }

      const application = await ApplicationModel.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      const updatedApplication = await ApplicationModel.update(id, req.body, userId, userRole as 'user' | 'admin');

      res.json({
        success: true,
        message: 'Заявка успешно обновлена',
        data: updatedApplication,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Удалить заявку
   * DELETE /api/applications/:id
   */
  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID заявки',
        });
      }

      const application = await ApplicationModel.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      // Проверяем, можно ли удалить заявку (статус должен позволять удаление)
      if (application.status_id && application.status_id !== 1 && application.status_id !== 5) {
        return res.status(403).json({
          success: false,
          message: 'Нельзя удалить заявку в текущем статусе',
        });
      }

      await ApplicationModel.delete(id, userId, userRole as 'user' | 'admin');

      res.json({
        success: true,
        message: 'Заявка успешно удалена',
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Подать заявку
   * POST /api/applications/:id/submit
   */
  static async submit(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID заявки',
        });
      }

      const application = await ApplicationModel.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      const updatedApplication = await ApplicationModel.submit(id, userId, userRole as 'user' | 'admin');

      res.json({
        success: true,
        message: 'Заявка успешно подана',
        data: updatedApplication,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка при подаче заявки',
      });
    }
  }

  /**
   * Получить список направлений
   * GET /api/directions
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
   * Получить список статусов
   * GET /api/statuses
   */
  static async getStatuses(req: AuthRequest, res: Response) {
    try {
      const statuses = await ApplicationModel.getStatuses();

      res.json({
        success: true,
        data: statuses,
      });
    } catch (error) {
      console.error('Error fetching statuses:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении статусов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить список тендеров
   * GET /api/tenders
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
   * Получить список ролей
   * GET /api/roles
   */
  static async getRoles(req: AuthRequest, res: Response) {
    try {
      // Только администраторы могут получать список ролей
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

      const { UserModel } = await import('../models/User');
      const roles = await UserModel.getRoles();

      res.json({
        success: true,
        data: roles,
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении ролей',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Выставить вердикт эксперта
   * POST /api/applications/:id/verdict
   */
  static async addVerdict(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const expertId = req.body.expertId;
      const { verdict, comment } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID заявки',
        });
      }

      if (!expertId || !verdict) {
        return res.status(400).json({
          success: false,
          message: 'expertId и verdict обязательны',
        });
      }

      if (verdict !== 'approved' && verdict !== 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'verdict должен быть "approved" или "rejected"',
        });
      }

      const application = await ApplicationModel.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена',
        });
      }

      // Проверяем, является ли пользователь одним из экспертов
      const isExpert = application.expert1?.id === expertId || application.expert2?.id === expertId;
      if (!isExpert && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Вы не являетесь экспертом этой заявки',
        });
      }

      await ApplicationModel.addVerdict(id, parseInt(expertId), verdict, comment || null);

      // Проверяем, все ли эксперты выставили вердикты
      const allVerdictsIn = await ApplicationModel.areAllVerdictsIn(id);

      res.json({
        success: true,
        message: 'Вердикт успешно выставлен',
        data: {
          allVerdictsIn,
        },
      });
    } catch (error) {
      console.error('Error adding verdict:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при выставлении вердикта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить заявки, назначенные эксперту
   * GET /api/expert/:id/applications
   */
  static async getExpertApplications(req: AuthRequest, res: Response) {
    try {
      const expertId = parseInt(req.params.id);

      if (isNaN(expertId)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный ID эксперта',
        });
      }

      // Только администраторы или сам эксперт
      if (req.user?.role !== 'admin') {
        // Здесь можно добавить проверку, что запрашивающий является этим экспертом
        // Но пока оставим доступным для админа
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён',
        });
      }

      const applications = await ApplicationModel.findByExpert(expertId);

      res.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error('Error fetching expert applications:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заявок эксперта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}
