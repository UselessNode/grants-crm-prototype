import { Link } from "react-router-dom";
import { Icon } from "../common/icon";

interface ActionButtonsProps {
  applicationId: number;
  statusName?: string;
  isAdmin: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canDelete: boolean;
  onSubmit: () => void;
  onDelete: () => void;
  onExportPdf: () => void;
}

export function ActionButtons({
  applicationId,
  isAdmin,
  canEdit,
  canSubmit,
  canDelete,
  onSubmit,
  onDelete,
  onExportPdf,
}: ActionButtonsProps) {
  const buttonClass = "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition";
  const disabledClass = "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center gap-1">
      {canEdit ? (
        <Link
          to={`/applications/${applicationId}/edit`}
          className={`${buttonClass} text-gray-700 bg-white border border-gray-300 hover:bg-gray-50`}
        >
          <Icon name="edit" size={14} />
          <span className="hidden sm:inline">Редактировать</span>
        </Link>
      ) : (
        <span className={`${buttonClass} ${disabledClass}`}>
          <Icon name="edit" size={14} />
          <span className="hidden sm:inline">Редактировать</span>
        </span>
      )}

      {canSubmit ? (
        <button
          onClick={onSubmit}
          className={`${buttonClass} text-white bg-blue-600 hover:bg-blue-700`}
        >
          <Icon name="check" size={14} />
          <span className="hidden sm:inline">Подать</span>
        </button>
      ) : (
        <span className={`${buttonClass} ${disabledClass}`}>
          <Icon name="check" size={14} />
          <span className="hidden sm:inline">Подать</span>
        </span>
      )}

      {canDelete ? (
        <button
          onClick={onDelete}
          className={`${buttonClass} text-red-600 bg-white border border-red-200 hover:bg-red-50`}
          title="Удалить заявку"
        >
          <Icon name="trash" size={14} />
          <span className="hidden sm:inline">Удалить</span>
        </button>
      ) : (
        <span
          className={`${buttonClass} ${disabledClass}`}
          title="Удаление доступно только для черновиков и отклонённых заявок"
        >
          <Icon name="trash" size={14} />
          <span className="hidden sm:inline">Удалить</span>
        </span>
      )}

      <button
        onClick={onExportPdf}
        className={`${buttonClass} text-gray-700 bg-white border border-gray-300 hover:bg-gray-50`}
      >
        <Icon name="download" size={14} />
        <span className="hidden sm:inline">PDF</span>
      </button>

      <Link
        to="/applications"
        className={`${buttonClass} text-gray-700 bg-white border border-gray-300 hover:bg-gray-50`}
      >
        <Icon name="arrow-left" size={14} />
        <span className="hidden sm:inline">Назад</span>
      </Link>
    </div>
  );
}
