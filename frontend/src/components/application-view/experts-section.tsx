import { Badge } from "../ui/badge";
import ExpertAssignment from "../ApplicationForm/expert-assignment";

interface ExpertReview {
  id: number;
  expert_id: number;
  review_status?: string;
  review_text?: string;
  expert: {
    id: number;
    surname: string;
    name: string;
    patronymic?: string | null;
  };
}

interface ExpertsSectionProps {
  applicationId: number;
  reviews: ExpertReview[];
  isAdmin: boolean;
  onSuccess?: () => void;
  formatDate: (date?: string | null) => string;
}

export function ExpertsSection({
  applicationId,
  reviews,
  isAdmin,
  onSuccess,
  formatDate,
}: ExpertsSectionProps) {
  const getVerdictVariant = (status?: string) => {
    if (status === "approved") return "status-approved";
    if (status === "rejected") return "status-rejected";
    return "default";
  };

  const getVerdictText = (status?: string) => {
    if (status === "approved") return "Одобрено";
    if (status === "rejected") return "Отклонено";
    return "Вердикт не предоставлен";
  };

  return (
    <div className="sidebar-card">
      <h3 className="sidebar-title">Эксперты</h3>
      <div className="experts-section">
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            const fullName = `${review.expert.surname} ${review.expert.name}${review.expert.patronymic ? " " + review.expert.patronymic : ""}`;
            const isDraft = !review.review_status || review.review_status === "draft";

            return (
              <div key={review.id || index} className="expert-item">
                <div className="expert-item-header">
                  <span className="expert-label">Эксперт {index + 1}</span>
                  {isAdmin && (
                    <span className="text-[10px] text-gray-400">ID: {review.expert_id}</span>
                  )}
                </div>
                <div className="expert-name">{fullName}</div>
                {!isDraft ? (
                  <>
                    <div className="expert-verdict">
                      <Badge variant={getVerdictVariant(review.review_status)}>
                        {getVerdictText(review.review_status)}
                      </Badge>
                    </div>
                    {review.review_text && (
                      <div className="expert-comment">{review.review_text}</div>
                    )}
                  </>
                ) : (
                  <div className="expert-verdict text-gray-500 text-[10px]">
                    {getVerdictText(review.review_status)}
                  </div>
                )}
                {index < reviews.length - 1 && <div className="expert-divider" />}
              </div>
            );
          })
        ) : (
          <div className="text-xs text-gray-500">Эксперты не назначены</div>
        )}

        {isAdmin && (
          <div className="expert-assignment-container">
            <ExpertAssignment
              applicationId={applicationId}
              currentExpert1Id={reviews[0]?.expert_id || undefined}
              currentExpert2Id={reviews[1]?.expert_id || undefined}
              onSuccess={onSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
}
