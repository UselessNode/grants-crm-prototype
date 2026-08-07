import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma, constants } from '../config/database'; // Пути не меняй, они корректны
import { ReviewStatus } from '../generated/prisma/client';

const REQUIRED_REVIEWS = 2;

export class ExpertController {

  /**
   * 1. Получить профиль эксперта
   */
  static async profile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Не авторизован' });
      }

      const user = await prisma.users.findUnique({
        where: { id: userId, deleted_at: null },
        include: { roles: true },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }
      if (user.role_id !== constants.EXPERT_ROLE_ID) {
        return res.status(403).json({ success: false, message: 'У вас нет прав эксперта' });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          surname: user.surname,
          name: user.name,
          patronymic: user.patronymic,
          email: user.email,
          role: user.roles?.name || 'Эксперт',
          created_at: user.created_at,
        },
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
   * 2. Получить список заявок эксперта
   */
  static async getApplications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Не авторизован' });
      }

      const user = await prisma.users.findUnique({
        where: { id: userId, deleted_at: null },
        select: { role_id: true },
      });
      if (!user || user.role_id !== constants.EXPERT_ROLE_ID) {
        return res.status(403).json({ success: false, message: 'Доступ разрешён только экспертам' });
      }

      const reviews = await prisma.application_reviews.findMany({
        where: {
          expert_id: userId,
          deleted_at: null,
          applications: { deleted_at: null },
        },
        include: {
          applications: {
            include: {
              application_statuses: true,
              directions: true,
              tenders: true,
            },
          },
        },
        orderBy: { applications: { created_at: 'desc' } },
      });

      const applications = reviews.map((review) => {
        const app = review.applications;
        return {
          id: app.id,
          title: app.title,
          status_id: app.status_id,
          status_name: app.application_statuses?.name || null,
          direction_id: app.direction_id,
          direction_name: app.directions?.name || null,
          tender_id: app.tender_id,
          tender_name: app.tenders?.name || null,
          created_at: app.created_at,
          submitted_at: app.submitted_at,
          updated_at: app.updated_at,
          review_status: review.review_status,
          comment: review.review_text,
          verdict_date: review.updated_at,
        };
      });

      res.json({ success: true, data: applications });
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
   * 3. Детальный просмотр заявки
   */
  static async getApplicationDetail(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Не авторизован' });
      }

      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID заявки' });
      }

      const review = await prisma.application_reviews.findFirst({
        where: {
          application_id: appId,
          expert_id: userId,
          deleted_at: null,
          applications: { deleted_at: null },
        },
        include: {
          applications: {
            include: {
              application_statuses: true,
              directions: true,
              tenders: true,
              users: {
                select: { surname: true, name: true, patronymic: true, email: true },
              },
              team_members: { where: { deleted_at: null } },
              project_plans: { where: { deleted_at: null } },
              project_budget: { where: { deleted_at: null } },
              additional_materials: { where: { deleted_at: null } },
              application_reviews: {
                where: { deleted_at: null },
                include: {
                  users: {
                    select: { surname: true, name: true, patronymic: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Заявка не найдена или у вас нет к ней доступа',
        });
      }

      const app = review.applications;
      const {
        users: owner,
        application_statuses: status,
        directions: direction,
        tenders: tender,
        application_reviews: expertReviews,
        team_members,
        project_plans,
        project_budget,
        additional_materials,
        ...appFields
      } = app;

      const coordinators = team_members.filter((m) => m.is_coordinator === true);
      const dobroResponsible = team_members.filter((m) => m.is_responsible === true);

      const result = {
        ...appFields,
        owner_surname: owner?.surname || null,
        owner_name: owner?.name || null,
        owner_patronymic: owner?.patronymic || null,
        owner_email: owner?.email || null,
        status_name: status?.name || null,
        direction_name: direction?.name || null,
        tender_name: tender?.name || null,
        expert_verdicts: expertReviews.map((r) => ({
          id: r.id,
          expert_id: r.expert_id,
          verdict: r.review_status,
          comment: r.review_text,
          created_at: r.created_at,
          updated_at: r.updated_at,
          surname: r.users?.surname || null,
          name: r.users?.name || null,
          patronymic: r.users?.patronymic || null,
        })),
        team_members,
        project_coordinators: coordinators,
        dobro_responsible: dobroResponsible,
        project_plans,
        project_budget,
        additional_materials,
      };

      res.json({ success: true, data: result });
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
   * 4. Сохранить черновик
   */
  static async saveDraft(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Не авторизован' });
      }

      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID заявки' });
      }

      const { comment } = req.body;

      // Проверка прав эксперта
      const user = await prisma.users.findUnique({
        where: { id: userId, deleted_at: null },
        select: { role_id: true },
      });
      if (!user || user.role_id !== constants.EXPERT_ROLE_ID) {
        return res.status(403).json({ success: false, message: 'Только эксперты могут сохранять черновики' });
      }

      // Проверка заявки
      const application = await prisma.applications.findUnique({
        where: { id: appId, deleted_at: null },
        select: { id: true },
      });
      if (!application) {
        return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      }

      // Проверяем, нет ли уже финального решения
      const existingFinal = await prisma.application_reviews.findFirst({
        where: {
          application_id: appId,
          expert_id: userId,
          deleted_at: null,
          review_status: { in: [ReviewStatus.approved, ReviewStatus.rejected] },
        },
      });
      if (existingFinal) {
        return res.status(403).json({
          success: false,
          message: 'Нельзя изменить финальное решение. Оно уже вынесено.',
        });
      }

      // UPSERT черновика
      const review = await prisma.application_reviews.upsert({
        where: {
          application_id_expert_id: { application_id: appId, expert_id: userId },
        },
        update: {
          review_status: ReviewStatus.draft,
          review_text: comment || undefined,
          updated_at: new Date(),
        },
        create: {
          application_id: appId,
          expert_id: userId,
          review_status: ReviewStatus.draft,
          review_text: comment || null,
        },
      });

      res.json({
        success: true,
        message: 'Черновик сохранён',
        data: {
          review_status: review.review_status,
          comment: review.review_text,
        },
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при сохранении черновика',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * 5. Завершить экспертизу
   */
  static async finalizeReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Не авторизован' });
      }

      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID заявки' });
      }

      const { verdict, comment } = req.body;
      if (!verdict || (verdict !== 'approved' && verdict !== 'rejected')) {
        return res.status(400).json({
          success: false,
          message: 'Вердикт должен быть "approved" или "rejected"',
        });
      }

      // Проверка прав эксперта
      const user = await prisma.users.findUnique({
        where: { id: userId, deleted_at: null },
        select: { role_id: true },
      });
      if (!user || user.role_id !== constants.EXPERT_ROLE_ID) {
        return res.status(403).json({ success: false, message: 'Только эксперты могут выносить решение' });
      }

      // Проверка заявки
      const application = await prisma.applications.findUnique({
        where: { id: appId, deleted_at: null },
        select: { id: true },
      });
      if (!application) {
        return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      }

      // Проверяем, что эксперт назначен на эту заявку
      const existingReview = await prisma.application_reviews.findFirst({
        where: {
          application_id: appId,
          expert_id: userId,
          deleted_at: null,
        },
      });

      if (!existingReview) {
        return res.status(403).json({
          success: false,
          message: 'Вы не назначены экспертом на эту заявку',
        });
      }

      // Если уже есть финальное решение, запрещаем перезапись
      if (existingReview.review_status === ReviewStatus.approved || existingReview.review_status === ReviewStatus.rejected) {
        return res.status(403).json({
          success: false,
          message: 'Финальное решение уже было вынесено. Изменение запрещено.',
        });
      }

      // Транзакция
      const result = await prisma.$transaction(async (tx) => {
        // 1. Обновляем ревью
        const updatedReview = await tx.application_reviews.update({
          where: { id: existingReview.id },
          data: {
            review_status: verdict === 'approved' ? ReviewStatus.approved : ReviewStatus.rejected,
            review_text: comment || null,
            updated_at: new Date(),
          },
        });

        // 2. Считаем количество финальных решений по этой заявке
        const finalizedCount = await tx.application_reviews.count({
          where: {
            application_id: appId,
            deleted_at: null,
            review_status: { in: [ReviewStatus.approved, ReviewStatus.rejected] },
          },
        });

        // 3. Если оба эксперта (или более) высказались – меняем статус заявки

        if (finalizedCount >= REQUIRED_REVIEWS) {
          const reviews = await tx.application_reviews.findMany({
            where: {
              application_id: appId,
              deleted_at: null,
              review_status: { in: [ReviewStatus.approved, ReviewStatus.rejected] },
            },
            select: { review_status: true },
          });

          const hasRejection = reviews.some((r) => r.review_status === ReviewStatus.rejected);
          const newStatusId = hasRejection ? constants.REJECTED_STATUS_ID : constants.CONFIRMED_STATUS_ID;
          if (newStatusId === null || newStatusId === undefined) {
            throw new Error(`Статус заявки не определён. Заявка ${appId}, эксперт ${userId}, hasRejection=${hasRejection}`);
          }
          await tx.applications.update({
            where: { id: appId },
            data: {
              status_id: newStatusId,
              updated_at: new Date(),
            },
          });
        }

        return updatedReview;
      });

      res.json({
        success: true,
        message: 'Экспертиза завершена',
        data: {
          verdict: result.review_status,
          comment: result.review_text,
        },
      });
    } catch (error) {
      console.error('Error finalizing review:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при завершении экспертизы',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Универсальный метод для сохранения/обновления вердикта
   */
  static async submitVerdict(req: AuthRequest, res: Response) {
    try {
      const { isDraft, verdict, comment } = req.body;
      // Если это черновик — вызываем saveDraft
      if (isDraft === true) {
        // Передаём управление в saveDraft, но чтобы не дублировать код,
        // можно вызвать saveDraft как статический метод, но проще скопировать логику
        // или сделать рефакторинг. Для скорости — просто продублируем.
        // Вместо дублирования — перенаправим вызов, но это сложно из-за res.
        // Сделаем отдельную реализацию:
        return await ExpertController.saveDraft(req, res);
      } else {
        // Иначе — финализация
        return await ExpertController.finalizeReview(req, res);
      }
    } catch (error) {
      console.error('Error in submitVerdict:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обработке вердикта',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}
