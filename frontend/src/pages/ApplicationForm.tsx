// ApplicationForm.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import type { TeamMember, ProjectCoordinator, DobroResponsible, ProjectPlan, ProjectBudget } from '../utils/types';

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

  // Состояния для выбранных участников
  const [selectedCoordinator, setSelectedCoordinator] = useState<TeamMember | undefined>(undefined);
  const [selectedDobroResponsible, setSelectedDobroResponsible] = useState<TeamMember | undefined>(undefined);

  // При загрузке НЕ ищем автоматически — пользователь должен выбрать сам
  // Состояния остаются undefined по умолчанию

  // Обработчик выбора координатора
  const handleSelectCoordinator = (member: TeamMember | undefined) => {
    if (member) {
      // Копируем данные в координаторы
      const coordinator: ProjectCoordinator = {
        surname: member.surname,
        name: member.name,
        patronymic: member.patronymic || '',
        relation_to_team: member.tasks_in_project || '',
        contact_info: member.contact_info || '',
        social_media_links: member.social_media_links || '',
        education: '',
        work_experience: '',
      };
      // Заменяем первого координатора или добавляем нового
      if (formData.coordinators.length > 0) {
        handleArrayChange('coordinators', 0, 'surname', coordinator.surname);
        handleArrayChange('coordinators', 0, 'name', coordinator.name);
        handleArrayChange('coordinators', 0, 'patronymic', coordinator.patronymic);
        handleArrayChange('coordinators', 0, 'relation_to_team', coordinator.relation_to_team);
        handleArrayChange('coordinators', 0, 'contact_info', coordinator.contact_info);
        handleArrayChange('coordinators', 0, 'social_media_links', coordinator.social_media_links);
      } else {
        addArrayItem('coordinators', coordinator);
      }
      setSelectedCoordinator(member);
    } else {
      setSelectedCoordinator(undefined);
    }
  };

  // Обработчик выбора ответственного DOBRO.RU
  const handleSelectDobroResponsible = (member: TeamMember | undefined) => {
    if (member) {
      // Копируем данные в ответственные
      const dobro: DobroResponsible = {
        surname: member.surname,
        name: member.name,
        patronymic: member.patronymic || '',
        relation_to_team: member.tasks_in_project || '',
        contact_info: member.contact_info || '',
        social_media_links: member.social_media_links || '',
      };
      // Заменяем первого ответственного или добавляем нового
      if (formData.dobro_responsible.length > 0) {
        handleArrayChange('dobro_responsible', 0, 'surname', dobro.surname);
        handleArrayChange('dobro_responsible', 0, 'name', dobro.name);
        handleArrayChange('dobro_responsible', 0, 'patronymic', dobro.patronymic);
        handleArrayChange('dobro_responsible', 0, 'relation_to_team', dobro.relation_to_team);
        handleArrayChange('dobro_responsible', 0, 'contact_info', dobro.contact_info);
        handleArrayChange('dobro_responsible', 0, 'social_media_links', dobro.social_media_links);
      } else {
        addArrayItem('dobro_responsible', dobro);
      }
      setSelectedDobroResponsible(member);
    } else {
      setSelectedDobroResponsible(undefined);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            {isEdit ? 'Редактирование заявки' : 'Новая заявка'}
          </h1>
          <Link to="/applications" className="btn-ghost">
            ← Назад к списку
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-6 px-4">
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
            selectedCoordinator={selectedCoordinator}
            selectedDobroResponsible={selectedDobroResponsible}
            errors={errors}
            onChange={(index: number, field: keyof TeamMember, value: string) =>
              handleArrayChange('team_members', index, field, value)
            }
            onSelectCoordinator={handleSelectCoordinator}
            onSelectDobroResponsible={handleSelectDobroResponsible}
            onAdd={() => addArrayItem('team_members', emptyTeamMember)}
            onRemove={(index: number) => removeArrayItem('team_members', index)}
          />

          {/* Секция 3: Координатор проекта */}
          <CoordinatorsSection
            selectedCoordinator={selectedCoordinator}
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
            selectedDobroResponsible={selectedDobroResponsible}
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
          <div className="flex gap-4 pt-4 border-t sticky bottom-4 bg-gray-50 p-4 rounded-lg">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать заявку')}
            </button>
            <Link
              to="/applications"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-center font-medium"
            >
              Отмена
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
