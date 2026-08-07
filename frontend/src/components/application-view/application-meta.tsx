import { Badge, type BadgeProps } from "../ui/badge";

interface ApplicationMetaProps {
  statusName?: string;
  tenderName?: string;
  directionName?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  formatDate: (date?: string | null) => string;
  getStatusVariant: (statusName?: string) => BadgeProps["variant"];
}

export function ApplicationMeta({
  statusName,
  tenderName,
  directionName,
  createdAt,
  updatedAt,
  formatDate,
  getStatusVariant,
}: ApplicationMetaProps) {
  // Собираем все доступные элементы мета-информации
  const metaItems = [
    { label: "Статус", value: <Badge variant={getStatusVariant(statusName)}>{statusName || "Не указан"}</Badge> },
    { label: "Конкурс", value: tenderName },
    { label: "Направление", value: directionName },
    { label: "Создана", value: createdAt ? formatDate(createdAt) : null },
    { label: "Обновлена", value: updatedAt ? formatDate(updatedAt) : null },
  ].filter(item => item.value !== null && item.value !== undefined && item.value !== "");

  return (
    <div className="application-meta-container">
      <div className="application-meta">
        {metaItems.map((item, index) => (
          <div key={index} className="application-meta-item">
            <span className="application-meta-label">{item.label}</span>
            <span className="application-meta-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
