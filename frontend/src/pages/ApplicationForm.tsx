// ApplicationForm.tsx
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApplicationForm } from '../hooks/useApplicationForm';
import {
  BasicInfoSection,
  TeamMembersSection,
  CoordinatorsSection,
  DobroResponsibleSection,
  ProjectDescriptionSection,
  ProjectPlanSection,
  ProjectResultsSection,
  ProjectBudgetSection,
  AdditionalMaterialsSection,
} from '../components/ApplicationForm';
import type { ProjectCoordinator, DobroResponsible, ProjectPlan, ProjectBudget } from '../utils/types';
import { UserPanelLayout } from '../components/UserPanel/UserPanelLayout';
import { Icon } from '../components/Icon';

export default function ApplicationForm() {
  const {
    isEdit,
    formData,
    setFormData,
    directions,
    statuses,
    tenders,
    loading,
    saving,
    errors,
    handleChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleBudgetChange,
    handleSubmit,
    emptyTeamMember,
    emptyCoordinator,
    emptyDobroResponsible,
    emptyPlan,
    emptyBudget,
  } = useApplicationForm();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  if (loading) {
    return (
      <UserPanelLayout title={isEdit ? 'Редактирование заявки' : 'Новая заявка'}>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout title={isEdit ? 'Редактирование заявки' : 'Новая заявка'}>
      <form onSubmit={handleSubmit} className="space-y-6">

          {/* Секция 1: Основная информация */}
          <BasicInfoSection
            title={formData.title}
            tender_id={formData.tender_id}
            direction_id={formData.direction_id}
            directions={directions}
            tenders={tenders}
            errors={errors}
            onChange={handleChange}
          />

          {/* Секция 2: Команда проекта */}
          <TeamMembersSection
            team_members={formData.team_members}
            errors={errors}
            onChange={(index: number, field: keyof typeof emptyTeamMember, value: string) =>
              handleArrayChange('team_members', index, field, value)
            }
            onAdd={() => addArrayItem('team_members', emptyTeamMember)}
            onRemove={(index: number) => removeArrayItem('team_members', index)}
          />

          {/* Секция 3: Координатор проекта */}
          <CoordinatorsSection
            coordinators={formData.coordinators}
            implementation_experience={formData.implementation_experience}
            errors={errors}
            onChange={(index: number, field: keyof ProjectCoordinator, value: string) =>
              handleArrayChange('coordinators', index, field, value)
            }
            onExperienceChange={handleChange}
            onAdd={() => addArrayItem('coordinators', emptyCoordinator)}
            onRemove={(index: number) => removeArrayItem('coordinators', index)}
          />

          {/* Секция 4: Ответственный DOBRO.RU */}
          <DobroResponsibleSection
            dobro_responsible={formData.dobro_responsible}
            errors={errors}
            onChange={(index: number, field: keyof DobroResponsible, value: string) =>
              handleArrayChange('dobro_responsible', index, field, value)
            }
            onAdd={() => addArrayItem('dobro_responsible', emptyDobroResponsible)}
            onRemove={(index: number) => removeArrayItem('dobro_responsible', index)}
          />

          {/* Секция 5: Описание проекта */}
          <ProjectDescriptionSection
            idea_description={formData.idea_description}
            importance_to_team={formData.importance_to_team}
            project_goal={formData.project_goal}
            project_tasks={formData.project_tasks}
            errors={errors}
            onChange={handleChange}
          />

          {/* Секция 6: План проекта */}
          <ProjectPlanSection
            project_plans={formData.project_plans}
            onChange={(index: number, field: keyof ProjectPlan, value: string) =>
              handleArrayChange('project_plans', index, field, value)
            }
            onAdd={() => addArrayItem('project_plans', emptyPlan)}
            onRemove={(index: number) => removeArrayItem('project_plans', index)}
          />

          {/* Секция 7: Результаты проекта */}
          <ProjectResultsSection
            results_description={formData.results_description}
            onChange={handleChange}
          />

          {/* Секция 8: Бюджет проекта */}
          <ProjectBudgetSection
            project_budget={formData.project_budget}
            onBudgetChange={handleBudgetChange}
            onAdd={() => addArrayItem('project_budget', emptyBudget)}
            onRemove={(index: number) => removeArrayItem('project_budget', index)}
          />

          {/* Секция 9: Дополнительные материалы */}
          <AdditionalMaterialsSection
            additional_materials={formData.additional_materials}
          />

          {/* Кнопки действий */}
          <div className="form-actions">
            <button type="submit"
              disabled={saving}
              className="btn-submit"
            >
              {saving ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать заявку')}
            </button>
            <Link
              to="/applications"
              className="btn-cancel"
            >
              Отмена
            </Link>
          </div>
        </form>
    </UserPanelLayout>
  );
}
