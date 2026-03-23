/**
 * Пример использования Prisma Client
 *
 * Когда сеть заработает, выполните:
 * 1. npm install
 * 2. npm run prisma:migrate
 * 3. npm run prisma:generate
 *
 * Затем замените текущие модели на этот пример
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ApplicationModelPrisma {
  /**
   * Получить все заявки с пагинацией
   */
  static async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    direction_id?: number;
    status_id?: number;
    ownerId?: number;
    userRole?: 'user' | 'admin';
  } = {}) {
    const { page = 1, limit = 10, search, direction_id, status_id, ownerId, userRole = 'user' } = options;
    const skip = (page - 1) * limit;

    // Фильтры
    const where: any = {};

    // Обычные пользователи видят только свои заявки
    if (userRole !== 'admin') {
      where.ownerId = ownerId || 0;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { ideaDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (direction_id) {
      where.directionId = direction_id;
    }

    if (status_id) {
      where.statusId = status_id;
    }

    // Получаем данные
    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          direction: true,
          status: true,
          owner: true,
        },
      }),
      prisma.application.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить заявку по ID со всеми связанными данными
   */
  static async findById(id: number) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        direction: true,
        status: true,
        tender: true,
        teamMembers: true,
        projectCoordinators: true,
        dobroResponsibles: true,
        projectPlans: true,
        projectBudget: true,
        additionalMaterials: true,
        expert1Relation: true,
        expert2Relation: true,
      },
    });
  }

  /**
   * Создать заявку
   */
  static async create(data: any, ownerId?: number | null) {
    const {
      team_members,
      coordinators,
      dobro_responsible,
      project_plans,
      project_budget,
      ...appData
    } = data;

    return prisma.application.create({
      data: {
        ...appData,
        ownerId: ownerId || null,
        teamMembers: team_members?.length ? {
          create: team_members.map((m: any) => ({
            surname: m.surname,
            name: m.name,
            patronymic: m.patronymic,
            tasksInProject: m.tasks_in_project,
            contactInfo: m.contact_info,
            socialMediaLinks: m.social_media_links,
          }))
        } : undefined,
        projectCoordinators: coordinators?.length ? {
          create: coordinators.map((c: any) => ({
            surname: c.surname,
            name: c.name,
            patronymic: c.patronymic,
            relationToTeam: c.relation_to_team,
            contactInfo: c.contact_info,
            socialMediaLinks: c.social_media_links,
            education: c.education,
            workExperience: c.work_experience,
          }))
        } : undefined,
        dobroResponsibles: dobro_responsible?.length ? {
          create: dobro_responsible.map((d: any) => ({
            surname: d.surname,
            name: d.name,
            patronymic: d.patronymic,
            relationToTeam: d.relation_to_team,
            contactInfo: d.contact_info,
            socialMediaLinks: d.social_media_links,
            profileLinks: d.profile_links, // НОВОЕ ПОЛЕ
          }))
        } : undefined,
        projectPlans: project_plans?.length ? {
          create: project_plans.map((p: any) => ({
            task: p.task,
            eventName: p.event_name,
            eventDescription: p.event_description,
            startDate: p.start_date,
            endDate: p.end_date,
            results: p.results,
            fixationForm: p.fixation_form,
          }))
        } : undefined,
        projectBudget: project_budget?.length ? {
          create: project_budget.map((b: any) => ({
            resourceType: b.resource_type,
            unitCost: b.unit_cost,
            quantity: b.quantity,
            totalCost: b.total_cost,
            ownFunds: b.own_funds,
            grantFunds: b.grant_funds,
            comment: b.comment,
          }))
        } : undefined,
      },
      include: {
        teamMembers: true,
        projectCoordinators: true,
        dobroResponsibles: true,
        projectPlans: true,
        projectBudget: true,
      },
    });
  }

  /**
   * Обновить заявку
   */
  static async update(id: number, data: any) {
    const {
      team_members,
      coordinators,
      dobro_responsible,
      project_plans,
      project_budget,
      ...appData
    } = data;

    return prisma.application.update({
      where: { id },
      data: {
        ...appData,
        // Полная замена связанных данных
        teamMembers: team_members ? {
          deleteMany: {},
          create: team_members.map((m: any) => ({
            surname: m.surname,
            name: m.name,
            patronymic: m.patronymic,
            tasksInProject: m.tasks_in_project,
            contactInfo: m.contact_info,
            socialMediaLinks: m.social_media_links,
          }))
        } : undefined,
        dobroResponsibles: dobro_responsible ? {
          deleteMany: {},
          create: dobro_responsible.map((d: any) => ({
            surname: d.surname,
            name: d.name,
            patronymic: d.patronymic,
            relationToTeam: d.relation_to_team,
            contactInfo: d.contact_info,
            socialMediaLinks: d.social_media_links,
            profileLinks: d.profile_links,
          }))
        } : undefined,
        // ... аналогично для других связанных данных
      },
    });
  }

  /**
   * Удалить заявку
   */
  static async delete(id: number) {
    return prisma.application.delete({
      where: { id },
    });
  }

  /**
   * Получить все направления
   */
  static async getDirections() {
    return prisma.direction.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Получить все статусы
   */
  static async getStatuses() {
    return prisma.applicationStatus.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Получить все тендеры
   */
  static async getTenders() {
    return prisma.tender.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Получить всех экспертов (для выпадающего списка)
   */
  static async getExperts() {
    return prisma.expert.findMany({
      orderBy: [{ surname: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Создать эксперта
   */
  static async createExpert(data: {
    surname: string;
    name: string;
    patronymic?: string | null;
    extraInfo?: string | null;
  }) {
    return prisma.expert.create({
      data: {
        surname: data.surname,
        name: data.name,
        patronymic: data.patronymic,
        extraInfo: data.extraInfo,
      },
    });
  }
}

// Не забудьте закрыть соединение при завершении работы приложения
// process.on('beforeExit', async () => {
//   await prisma.$disconnect();
// });
