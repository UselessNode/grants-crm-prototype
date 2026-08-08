import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { Prisma, ReviewStatus } from '../generated/prisma/client';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  static async stats(req: AuthRequest, res: Response) {
    try {
      const [usersCount, applicationsCount] = await Promise.all([
        prisma.users.count({ where: { deleted_at: null } }),
        prisma.applications.count({ where: { deleted_at: null } }),
      ]);

      res.json({
        success: true,
        data: { users: usersCount, applications: applicationsCount },
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении статистики' });
    }
  }

  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [total, data] = await Promise.all([
        prisma.users.count({ where: { deleted_at: null } }),
        prisma.users.findMany({
          skip,
          take: limit,
          where: { deleted_at: null },
          include: { roles: { select: { name: true } } },
          orderBy: { created_at: 'desc' },
        }),
      ]);

      res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении пользователей' });
    }
  }

  static async getApplications(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { search, direction_id, status_id } = req.query;
      const skip = (page - 1) * limit;

      const where: Prisma.applicationsWhereInput = { deleted_at: null };
      if (search) where.title = { contains: search as string, mode: 'insensitive' };
      if (direction_id) where.direction_id = Number(direction_id);
      if (status_id) where.status_id = Number(status_id);

      const [total, data] = await Promise.all([
        prisma.applications.count({ where }),
        prisma.applications.findMany({
          skip,
          take: limit,
          where,
          orderBy: { created_at: 'desc' },
          include: {
            users: { select: { surname: true, name: true, email: true } },
            application_statuses: { select: { name: true } },
            directions: { select: { name: true } },
            tenders: { select: { name: true } },
            application_reviews: {
              where: { deleted_at: null },
              include: {
                users: { select: { surname: true, name: true, patronymic: true } },
              },
            },
          },
        }),
      ]);

      res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении заявок' });
    }
  }

  static async getDirections(req: AuthRequest, res: Response) {
    const data = await prisma.directions.findMany({ where: { deleted_at: null }, orderBy: { name: 'asc' } });
    res.json({ success: true, data });
  }

  static async getTenders(req: AuthRequest, res: Response) {
    const data = await prisma.tenders.findMany({ where: { deleted_at: null }, orderBy: { name: 'asc' } });
    res.json({ success: true, data });
  }

  static async createDirection(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Название обязательно' });

      const data = await prisma.directions.create({ data: { name, description: description || null } });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error creating direction:', error);
      res.status(500).json({ success: false, message: 'Ошибка при создании направления' });
    }
  }

  static async updateDirection(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, description } = req.body;

      const data = await prisma.directions.update({
        where: { id },
        data: { name, description: description || null, updated_at: new Date() },
      });
      res.json({ success: true, data });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найдено' });
      res.status(500).json({ success: false, message: 'Ошибка при обновлении' });
    }
  }

  static async deleteDirection(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);

      // Проверка на связанные заявки
      const count = await prisma.applications.count({ where: { direction_id: id, deleted_at: null } });
      if (count > 0) {
        return res.status(400).json({ success: false, message: `Нельзя удалить: используется в ${count} заявке(ах)` });
      }

      await prisma.directions.update({ where: { id }, data: { deleted_at: new Date() } });
      res.json({ success: true });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найдено' });
      res.status(500).json({ success: false, message: 'Ошибка при удалении' });
    }
  }

  static async createTender(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Название обязательно' });

      const data = await prisma.tenders.create({ data: { name, description: description || null } });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Ошибка при создании тендера' });
    }
  }

  static async updateTender(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, description } = req.body;

      const data = await prisma.tenders.update({
        where: { id },
        data: { name, description: description || null, updated_at: new Date() },
      });
      res.json({ success: true, data });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найдено' });
      res.status(500).json({ success: false, message: 'Ошибка при обновлении' });
    }
  }

  static async deleteTender(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);

      const count = await prisma.applications.count({ where: { tender_id: id, deleted_at: null } });
      if (count > 0) {
        return res.status(400).json({ success: false, message: `Нельзя удалить: используется в ${count} заявке(ах)` });
      }

      await prisma.tenders.update({ where: { id }, data: { deleted_at: new Date() } });
      res.json({ success: true });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найдено' });
      res.status(500).json({ success: false, message: 'Ошибка при удалении' });
    }
  }

  static async getExperts(req: AuthRequest, res: Response) {
    try {
      const expertRole = await prisma.roles.findUnique({ where: { name: 'expert' } });
      const data = await prisma.users.findMany({
        where: { role_id: expertRole?.id, deleted_at: null },
        select: { id: true, surname: true, name: true, patronymic: true, email: true }
      });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Ошибка при получении экспертов' });
    }
  }

  static async assignExperts(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { expert1Id, expert2Id } = req.body;

      const expertsToAssign = [expert1Id, expert2Id]
        .filter(Boolean)
        .map((expId: any) => ({
          application_id: id,
          expert_id: Number(expId),
          review_status: ReviewStatus.draft,
        }));

      if (expertsToAssign.length === 0) {
        return res.status(400).json({ success: false, message: 'Не указаны эксперты' });
      }

      // Удаляем все старые назначения для этой заявки
      await prisma.application_reviews.deleteMany({
        where: { application_id: id },
      });

      // Вставляем новые
      await prisma.application_reviews.createMany({
        data: expertsToAssign,
        skipDuplicates: true, // на всякий случай
      });

      res.json({ success: true, message: 'Эксперты назначены' });
    } catch (error) {
      console.error('Error assigning experts:', error);
      res.status(500).json({ success: false, message: 'Ошибка при назначении экспертов' });
    }
  }

  static async changeStatus(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status_id } = req.body;
      if (!status_id) return res.status(400).json({ success: false, message: 'status_id обязателен' });

      const data = await prisma.applications.update({
        where: { id },
        data: { status_id: Number(status_id), updated_at: new Date() },
      });
      res.json({ success: true, message: 'Статус изменён', data });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      res.status(500).json({ success: false, message: 'Ошибка при изменении статуса' });
    }
  }

  static async getVerdicts(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await prisma.application_reviews.findMany({
        where: { application_id: id, deleted_at: null },
        include: { users: { select: { surname: true, name: true } } }, // users здесь - это эксперт
      });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Ошибка при получении вердиктов' });
    }
  }

  static async addExpert(req: AuthRequest, res: Response) {
    try {
      const { surname, name, patronymic, email, password } = req.body;
      if (!surname || !name) return res.status(400).json({ success: false, message: 'Фамилия и имя обязательны' });

      const expertRole = await prisma.roles.findUnique({ where: { name: 'expert' } });
      if (!expertRole) return res.status(500).json({ success: false, message: 'Роль expert не найдена в БД' });

      let passwordHash = '';
      if (email && password) {
        passwordHash = await bcrypt.hash(password, 10);
      } else {
        return res.status(400).json({ success: false, message: 'Для создания эксперта нужны email и password' });
      }

      const data = await prisma.users.create({
        data: {
          email,
          password_hash: passwordHash,
          surname,
          name,
          patronymic: patronymic || null,
          role_id: expertRole.id,
        },
      });

      res.json({ success: true, message: 'Эксперт успешно добавлен', data });
    } catch (error) {
      if ((error as any).code === 'P2002') return res.status(409).json({ success: false, message: 'Email уже занят' });
      res.status(500).json({ success: false, message: 'Ошибка при добавлении эксперта' });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { surname, name, patronymic, role_id } = req.body;

      const data = await prisma.users.update({
        where: { id },
        data: { surname, name, patronymic, role_id: role_id || 1, updated_at: new Date() },
      });
      res.json({ success: true, message: 'Пользователь обновлён', data });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найден' });
      res.status(500).json({ success: false, message: 'Ошибка при обновлении' });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      if (req.user?.userId === id) return res.status(400).json({ success: false, message: 'Нельзя удалить самого себя' });

      const count = await prisma.applications.count({ where: { owner_id: id, deleted_at: null } });
      if (count > 0) {
        return res.status(400).json({ success: false, message: `Нельзя удалить: у пользователя ${count} заявка(ок)` });
      }

      await prisma.users.update({ where: { id }, data: { deleted_at: new Date() } });
      res.json({ success: true, message: 'Пользователь удалён' });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найден' });
      res.status(500).json({ success: false, message: 'Ошибка при удалении' });
    }
  }

  // Обновление эксперта = обновление пользователя с ролью эксперта
  static async updateExpert(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { surname, name, patronymic } = req.body;
      if (!surname || !name) return res.status(400).json({ success: false, message: 'Фамилия и имя обязательны' });

      const data = await prisma.users.update({
        where: { id },
        data: { surname, name, patronymic: patronymic || null, updated_at: new Date() },
      });
      res.json({ success: true, message: 'Эксперт обновлён', data });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найден' });
      res.status(500).json({ success: false, message: 'Ошибка при обновлении' });
    }
  }

  static async deleteExpert(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);

      // Проверяем, назначен ли эксперт на заявки (через таблицу reviews)
      const count = await prisma.application_reviews.count({ where: { expert_id: id, deleted_at: null } });
      if (count > 0) {
        return res.status(400).json({ success: false, message: `Нельзя удалить: эксперт назначен на ${count} заявка(ок)` });
      }

      // Мягкое удаление пользователя-эксперта
      await prisma.users.update({ where: { id }, data: { deleted_at: new Date() } });
      res.json({ success: true, message: 'Эксперт удалён' });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Не найден' });
      res.status(500).json({ success: false, message: 'Ошибка при удалении' });
    }
  }

  // ============ КРИТЕРИИ ОЦЕНКИ ============

  static async getEvaluationCriteria(req: AuthRequest, res: Response) {
    try {
      const tenderId = Number(req.query.tender_id);
      
      if (!tenderId) {
        return res.status(400).json({ success: false, message: 'tender_id обязателен' });
      }

      const data = await prisma.evaluation_criteria.findMany({
        where: { tender_id: tenderId, deleted_at: null },
        orderBy: { created_at: 'asc' },
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching evaluation criteria:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении критериев оценки' });
    }
  }

  static async getEvaluationCriteriaByTender(req: AuthRequest, res: Response) {
    try {
      const tenderId = Number(req.params.tender_id);
      
      const data = await prisma.evaluation_criteria.findMany({
        where: { tender_id: tenderId, deleted_at: null },
        orderBy: { created_at: 'asc' },
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching evaluation criteria by tender:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении критериев оценки' });
    }
  }

  static async createEvaluationCriteria(req: AuthRequest, res: Response) {
    try {
      const { tender_id, name, description, min_value, max_value, weight, config } = req.body;
      
      if (!tender_id || !name) {
        return res.status(400).json({ success: false, message: 'tender_id и name обязательны' });
      }

      // Проверяем, существует ли тендер
      const tender = await prisma.tenders.findUnique({ where: { id: tender_id } });
      if (!tender) {
        return res.status(404).json({ success: false, message: 'Тендер не найден' });
      }

      const data = await prisma.evaluation_criteria.create({
        data: {
          tender_id: Number(tender_id),
          name,
          description: description || null,
          min_value: Number(min_value) || 0,
          max_value: Number(max_value) || 10,
          weight: Number(weight) || 1,
          config: config || null,
        },
      });

      res.json({ success: true, data, message: 'Критерий оценки создан' });
    } catch (error) {
      console.error('Error creating evaluation criteria:', error);
      res.status(500).json({ success: false, message: 'Ошибка при создании критерия оценки' });
    }
  }

  static async updateEvaluationCriteria(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, description, min_value, max_value, weight, config } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'name обязателен' });
      }

      const data = await prisma.evaluation_criteria.update({
        where: { id },
        data: {
          name,
          description: description || null,
          min_value: Number(min_value) || 0,
          max_value: Number(max_value) || 10,
          weight: Number(weight) || 1,
          config: config || null,
          updated_at: new Date(),
        },
      });

      res.json({ success: true, data, message: 'Критерий оценки обновлён' });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Критерий не найден' });
      console.error('Error updating evaluation criteria:', error);
      res.status(500).json({ success: false, message: 'Ошибка при обновлении критерия оценки' });
    }
  }

  static async deleteEvaluationCriteria(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);

      await prisma.evaluation_criteria.update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      res.json({ success: true, message: 'Критерий оценки удалён' });
    } catch (error) {
      if ((error as any).code === 'P2025') return res.status(404).json({ success: false, message: 'Критерий не найден' });
      console.error('Error deleting evaluation criteria:', error);
      res.status(500).json({ success: false, message: 'Ошибка при удалении критерия оценки' });
    }
  }

  // Создание стандартного набора критериев для нового тендера
  static async createDefaultEvaluationCriteria(req: AuthRequest, res: Response) {
    try {
      const { tender_id } = req.body;
      
      if (!tender_id) {
        return res.status(400).json({ success: false, message: 'tender_id обязателен' });
      }

      // Проверяем, существует ли тендер
      const tender = await prisma.tenders.findUnique({ where: { id: tender_id } });
      if (!tender) {
        return res.status(404).json({ success: false, message: 'Тендер не найден' });
      }

      // Удаляем существующие критерии для этого тендера
      await prisma.evaluation_criteria.deleteMany({
        where: { tender_id: tender_id },
      });

      // Стандартный набор критериев из TODO.md
      const defaultCriteria = [
        { name: 'Крутость', min_value: 0, max_value: 10, weight: 2, description: 'Оценка крутости проекта' },
        { name: 'Стиль', min_value: 0, max_value: 100, weight: 3, description: 'Оценка стиля presentation' },
        { name: 'Актуальность', min_value: 0, max_value: 10, weight: 1.5, description: 'Актуальность тематики' },
        { name: 'Инновационность', min_value: 0, max_value: 10, weight: 2, description: 'Степень инновационности' },
        { name: 'Реализуемость', min_value: 0, max_value: 10, weight: 1.5, description: 'Возможность реализации' },
      ];

      const createdCriteria = await prisma.evaluation_criteria.createMany({
        data: defaultCriteria.map(criteria => ({
          tender_id: tender_id,
          name: criteria.name,
          description: criteria.description,
          min_value: criteria.min_value,
          max_value: criteria.max_value,
          weight: criteria.weight,
        })),
      });

      res.json({ 
        success: true, 
        message: `Создано ${createdCriteria.count} стандартных критериев оценки`,
        data: defaultCriteria
      });
    } catch (error) {
      console.error('Error creating default evaluation criteria:', error);
      res.status(500).json({ success: false, message: 'Ошибка при создании стандартных критериев оценки' });
    }
  }
}
