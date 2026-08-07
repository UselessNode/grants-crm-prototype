// frontend/src/utils/application-helpers.ts
import type { BadgeProps } from "../components/ui/badge";

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusVariant = (statusName?: string): BadgeProps["variant"] => {
  const variants: Record<string, BadgeProps["variant"]> = {
    Черновик: "status-draft",
    Подана: "status-submitted",
    "На рассмотрении": "status-review",
    Одобрена: "status-approved",
    Отклонена: "status-rejected",
  };
  return variants[statusName || ""] || "default";
};

export const getReviews = (app: any): any[] => {
  return app?.application_reviews || app?.reviews || app?.expert_reviews || [];
};
