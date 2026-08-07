import "./application-view.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationService } from "../../services/applicationService";
import { useAuthStore } from "../../store/auth-store";
import { useToast } from "../../context/toast-context";
import { UserPanelLayout } from "../UserPanel/user-panel-layout";
import { ApplicationMeta } from "./application-meta";
import { ResponsiblePersons } from "./responsible-persons";
import { ExpertsSection } from "./experts-section";
import { TeamMembersList } from "./team-members-list";
import { ProjectDescription } from "./project-description";
import { ProjectPlanList } from "./project-plan-list";
import { ProjectBudgetTable } from "./project-budget-table";
import { AdditionalMaterials } from "./additional-materials";
import { ActionButtons } from "./action-buttons";
import { downloadPdf } from "../../services/pdf-generator";
import {
  formatDate,
  formatMoney,
  getStatusVariant,
  getReviews,
} from "../../utils/application-helpers";
import type { Application } from "../../types";

export function ApplicationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const appData = await applicationService.getApplication(parseInt(id!));
        setApplication(appData.data);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        toast.error("Ошибка загрузки", "Не удалось загрузить заявку");
        navigate("/applications");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadApplication();
  }, [id, navigate, toast]);

  const refreshApplication = async () => {
    try {
      const appData = await applicationService.getApplication(parseInt(id!));
      setApplication(appData.data);
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleExportPdf = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) {
      toast.error("Ошибка", "Не найден контент для экспорта");
      return;
    }
    const filename = `Заявка-${application?.id ?? ""}.pdf`;
    await downloadPdf(element, filename, {
      orientation: "portrait",
      format: "a4",
      printStyles: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `,
    });
  };

  const handleDelete = async () => {
    if (
      application?.status_name !== "Черновик" &&
      application?.status_name !== "Отклонена"
    ) {
      toast.warning("Внимание", "Нельзя удалить заявку в текущем статусе");
      return;
    }

    if (!confirm("Вы уверены, что хотите удалить эту заявку?")) return;

    try {
      await applicationService.deleteApplication(parseInt(id!));
      toast.success("Успешно", "Заявка удалена");
      navigate("/applications");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast.error("Ошибка удаления", "Не удалось удалить заявку");
    }
  };

  const handleSubmit = async () => {
    if (!application) return;

    const membersWithoutConsent = (application.team_members || []).filter(
      (m) => !m.consent_files || m.consent_files.length === 0,
    );

    if (membersWithoutConsent.length > 0) {
      const names = membersWithoutConsent
        .map((m) => `${m.surname} ${m.name}`)
        .join(", ");
      const removed = confirm(
        `ВНИМАНИЕ: У следующих участников отсутствуют файлы согласия на обработку персональных данных:\n\n` +
          `${names}\n\n` +
          `Участники без согласия НЕ СМОГУТ быть поданы вместе с заявкой.\n\n` +
          `Нажмите «ОК», чтобы удалить их и подать заявку, или «Отмена» для возврата.`,
      );

      if (!removed) return;

      try {
        const updatedTeamMembers = (application.team_members ?? []).filter(
          (m) => m.consent_files && m.consent_files.length > 0,
        );

        await applicationService.updateApplication(parseInt(id!), {
          team_members: updatedTeamMembers,
        });

        toast.warning(
          "Участники удалены",
          `Удалено участников без согласия: ${membersWithoutConsent.length}. Заявка будет подана без них.`,
        );

        await refreshApplication();
      } catch (error) {
        console.error("Ошибка удаления участников:", error);
        toast.error("Ошибка удаления участников", "Не удалось удалить участников без согласия");
        return;
      }
    }

    if (
      !confirm(
        "Вы уверены, что хотите подать эту заявку? После подачи редактирование будет недоступно.",
      )
    ) return;

    try {
      await applicationService.submitApplication(parseInt(id!));
      toast.success("Успешно", "Заявка успешно подана!");
      await refreshApplication();
    } catch (error) {
      console.error("Ошибка подачи:", error);
      toast.error("Ошибка подачи заявки", "Не удалось подать заявку");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }
  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Заявка не найдена</div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const reviews = getReviews(application);

  const canEdit = isAdmin || application.status_name === "Черновик" || application.status_name === "Одобрена" || application.status_name === "Отклонена";
  const canSubmit = application.status_name === "Черновик";
  const canDelete = application.status_name === "Черновик" || application.status_name === "Отклонена";

  return (
    <UserPanelLayout showLogout={false}>
      <div className="application-actions max-w-7xl mx-auto px-2 sm:px-4 py-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Просмотр заявки #{application.id}</h2>
          <ActionButtons
            applicationId={application.id!}
            statusName={application.status_name}
            isAdmin={isAdmin}
            canEdit={canEdit}
            canSubmit={canSubmit}
            canDelete={canDelete}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      <div className="application-view-layout">
        <div className="application-view-content" id="pdf-content">
          <ApplicationMeta
            statusName={application.status_name}
            tenderName={application.tender?.name}
            directionName={application.direction?.name}
            createdAt={application.created_at}
            updatedAt={(application as any).updated_at}
            formatDate={formatDate}
            getStatusVariant={getStatusVariant}
          />
          <ResponsiblePersons application={application} />
          <TeamMembersList members={application.team_members || []} />
          <ProjectDescription application={application} />
          <ProjectPlanList plans={application.project_plans || []} />
          <ProjectBudgetTable
            items={application.project_budget || []}
            formatMoney={formatMoney}
          />
        </div>

        <div className="application-view-sidebar">
          <ExpertsSection
            applicationId={application.id!}
            reviews={reviews}
            isAdmin={isAdmin}
            onSuccess={refreshApplication}
            formatDate={formatDate}
          />
          <AdditionalMaterials materials={application.additional_materials || []} />
        </div>
      </div>
    </UserPanelLayout>
  );
}

export default ApplicationView;
