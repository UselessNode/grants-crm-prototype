import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { Prisma } from '../generated/prisma/client';
import { AuthRequest } from '../middleware/auth';

// Хелпер для проверки прав: админ видит всё, юзер - только своё
const checkAccess = (app: any, userId: number, userRole: string) => {
  if (userRole === 'admin') return true;
  return app.owner_id === userId;
};

export class ApplicationController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10, search, direction_id, status_id } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role || 'user';

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: Prisma.applicationsWhereInput = { deleted_at: null };

      if (userRole !== 'admin') {
        where.owner_id = userId;
      }
      if (search) where.title = { contains: search as string, mode: 'insensitive' };
      if (direction_id) where.direction_id = Number(direction_id);
      if (status_id) where.status_id = Number(status_id);

      const [total, data] = await Promise.all([
        prisma.applications.count({ where }),
        prisma.applications.findMany({
          where,
          skip,
          take,
          orderBy: { created_at: 'desc' },
          include: {
            application_statuses: { select: { name: true } },
            directions: { select: { name: true } },
            users: { select: { surname: true, name: true, patronymic: true } },
          },
        }),
      ]);

      res.json({
        success: true,
        data,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении списка заявок' });
    }
  }

  static async show(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Некорректный ID' });

      const application = await prisma.applications.findFirst({
        where: { id, deleted_at: null },
        include: {
          application_statuses: true,
          directions: true,
          tenders: true,
          users: { select: { id: true, surname: true, name: true, patronymic: true, email: true } },
          team_members: true,
          project_plans: true,
          project_budget: true,
          additional_materials: true,
          application_reviews: { include: { users: { select: { surname: true, name: true } } } },
        },
      });

      if (!application) return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      if (!checkAccess(application, req.user!.userId, req.user!.role)) {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
      }

      res.json({ success: true, data: application });
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении заявки' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const {
        title, idea_description, importance_to_team, project_goal, project_tasks,
        tender_id, direction_id, status_id = 1, implementation_experience, results_description,
        team_members, project_plans, project_budget
      } = req.body;

      if (!title || !idea_description || !importance_to_team || !project_goal || !project_tasks) {
        return res.status(400).json({ success: false, message: 'Заполните все обязательные поля' });
      }

      // Prisma создаст заявку и все связанные таблицы одним запросом (Nested Writes)
      const newApplication = await prisma.applications.create({
        data: {
          owner_id: req.user!.userId,
          title, idea_description, importance_to_team, project_goal, project_tasks,
          tender_id: tender_id || null,
          direction_id: direction_id || null,
          status_id,
          implementation_experience: implementation_experience || null,
          results_description: results_description || null,
          team_members: team_members?.length ? { createMany: { data: team_members } } : undefined,
          project_plans: project_plans?.length ? { createMany: { data: project_plans } } : undefined,
          project_budget: project_budget?.length ? { createMany: { data: project_budget } } : undefined,
        },
        include: { team_members: true, project_plans: true, project_budget: true },
      });

      res.status(201).json({ success: true, message: 'Заявка успешно создана', data: newApplication });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ success: false, message: 'Ошибка при создании заявки' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Некорректный ID' });

      const application = await prisma.applications.findUnique({ where: { id, deleted_at: null } });
      if (!application) return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      if (!checkAccess(application, req.user!.userId, req.user!.role)) {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
      }

      const { title, idea_description, importance_to_team, project_goal, project_tasks, direction_id, tender_id } = req.body;

      const updatedApplication = await prisma.applications.update({
        where: { id },
        data: {
          title, idea_description, importance_to_team, project_goal, project_tasks,
          direction_id: direction_id ?? undefined,
          tender_id: tender_id ?? undefined,
          updated_at: new Date(),
        },
      });

      res.json({ success: true, message: 'Заявка успешно обновлена', data: updatedApplication });
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ success: false, message: 'Ошибка при обновлении заявки' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Некорректный ID' });

      const application = await prisma.applications.findUnique({ where: { id, deleted_at: null } });
      if (!application) return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      if (!checkAccess(application, req.user!.userId, req.user!.role)) {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
      }

      if (application.status_id !== 1 && application.status_id !== 5) {
        return res.status(403).json({ success: false, message: 'Нельзя удалить заявку в текущем статусе' });
      }

      await prisma.applications.update({ where: { id }, data: { deleted_at: new Date() } });
      res.json({ success: true, message: 'Заявка успешно удалена' });
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({ success: false, message: 'Ошибка при удалении заявки' });
    }
  }

  static async submit(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Некорректный ID' });

      const application = await prisma.applications.findUnique({ where: { id, deleted_at: null } });
      if (!application) return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      if (!checkAccess(application, req.user!.userId, req.user!.role)) {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
      }

      const updatedApplication = await prisma.applications.update({
        where: { id },
        data: { status_id: 2, submitted_at: new Date(), updated_at: new Date() },
      });

      res.json({ success: true, message: 'Заявка успешно подана', data: updatedApplication });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ success: false, message: 'Ошибка при подаче заявки' });
    }
  }

  static async changeStatus(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status_id } = req.body;
      if (isNaN(id) || !status_id) return res.status(400).json({ success: false, message: 'Некорректные данные' });

      const updatedApplication = await prisma.applications.update({
        where: { id, deleted_at: null },
        data: { status_id: Number(status_id), updated_at: new Date() },
      });

      res.json({ success: true, message: 'Статус изменён', data: updatedApplication });
    } catch (error) {
      console.error('Error changing status:', error);
      res.status(500).json({ success: false, message: 'Ошибка при изменении статуса' });
    }
  }

  // --- Справочники ---
  static async getDirections(req: AuthRequest, res: Response) {
    const data = await prisma.directions.findMany({ where: { deleted_at: null } });
    res.json({ success: true, data });
  }

  static async getStatuses(req: AuthRequest, res: Response) {
    const data = await prisma.application_statuses.findMany({ where: { deleted_at: null }, orderBy: { id: 'asc' } });
    res.json({ success: true, data });
  }

  static async getTenders(req: AuthRequest, res: Response) {
    const data = await prisma.tenders.findMany({ where: { deleted_at: null } });
    res.json({ success: true, data });
  }

  static async getRoles(req: AuthRequest, res: Response) {
    const data = await prisma.roles.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, data });
  }

  // --- Экспертная часть ---
  static async addVerdict(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { verdict, comment } = req.body;
      const expertId = req.user!.userId; // Берём ID из токена, а не из body (безопаснее)

      if (isNaN(id) || !verdict) return res.status(400).json({ success: false, message: 'Некорректные данные' });
      if (!['approved', 'rejected'].includes(verdict)) {
        return res.status(400).json({ success: false, message: 'verdict должен быть "approved" или "rejected"' });
      }

      const application = await prisma.applications.findUnique({ where: { id, deleted_at: null } });
      if (!application) return res.status(404).json({ success: false, message: 'Заявка не найдена' });

      // Upsert: обновляет существующий вердикт или создаёт новый
      await prisma.application_reviews.upsert({
        where: { application_id_expert_id: { application_id: id, expert_id: expertId } },
        update: { review_status: verdict, review_text: comment || null, updated_at: new Date() },
        create: { application_id: id, expert_id: expertId, review_status: verdict, review_text: comment || null },
      });

      const reviewsCount = await prisma.application_reviews.count({ where: { application_id: id, deleted_at: null } });

      res.json({
        success: true,
        message: 'Вердикт успешно сохранён',
        data: { allVerdictsIn: reviewsCount >= 2, verdictsCount: reviewsCount },
      });
    } catch (error) {
      console.error('Error adding verdict:', error);
      res.status(500).json({ success: false, message: 'Ошибка при выставлении вердикта' });
    }
  }

  static async getExpertApplications(req: AuthRequest, res: Response) {
    try {
      const expertId = req.user!.userId;

      const applications = await prisma.applications.findMany({
        where: {
          deleted_at: null,
          application_reviews: { some: { expert_id: expertId, deleted_at: null } }
        },
        include: {
          application_statuses: { select: { name: true } },
          application_reviews: { where: { expert_id: expertId }, select: { review_status: true, review_text: true } }
        }
      });

      res.json({ success: true, data: applications });
    } catch (error) {
      console.error('Error fetching expert applications:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении заявок' });
    }
  }
}
