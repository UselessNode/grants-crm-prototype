import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// 1. Инициализация Prisma
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] // Убрали 'query' для экономии RAM на проде
});

// 2. Класс для кэширования констант из БД
class AppConstants {
  public EXPERT_ROLE_ID: number | null = null;
  public ADMIN_ROLE_ID: number | null = null;
  public USER_ROLE_ID: number | null = null;

  public DRAFT_STATUS_ID: number | null = null;
  public SUBMITTED_STATUS_ID: number | null = null;
  public UNDER_REVIEW_STATUS_ID: number | null = null;
  public CONFIRMED_STATUS_ID: number | null = null;
  public REJECTED_STATUS_ID: number | null = null;

  public async load(): Promise<void> {
    try {
      const roles = await prisma.roles.findMany({ select: { id: true, name: true } });
      const roleMap = new Map(roles.map(r => [r.name.toLowerCase(), r.id]));

      this.EXPERT_ROLE_ID = roleMap.get('expert') || null;
      this.ADMIN_ROLE_ID = roleMap.get('admin') || null;
      this.USER_ROLE_ID = roleMap.get('user') || null;

      const statuses = await prisma.application_statuses.findMany({ select: { id: true, name: true } });
      const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s.id]));

      this.DRAFT_STATUS_ID = statusMap.get('черновик') || null;
      this.SUBMITTED_STATUS_ID = statusMap.get('подана') || null;
      this.UNDER_REVIEW_STATUS_ID = statusMap.get('на рассмотрении') || null;
      this.CONFIRMED_STATUS_ID = statusMap.get('одобрена') || null;
      this.REJECTED_STATUS_ID = statusMap.get('отклонена') || null;

      console.log('✅ Константы загружены из БД:', {
        roles: { expert: this.EXPERT_ROLE_ID, admin: this.ADMIN_ROLE_ID },
        statuses: { draft: this.DRAFT_STATUS_ID, confirmed: this.CONFIRMED_STATUS_ID, rejected: this.REJECTED_STATUS_ID }
      });

      if (!this.EXPERT_ROLE_ID || !this.CONFIRMED_STATUS_ID) {
        throw new Error('Критические константы не найдены в БД. Возможно в БД несовпадают данные.');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки констант из БД:', error);
      throw error;
    }
  }
}

export const constants = new AppConstants();
