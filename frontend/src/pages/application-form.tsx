// ApplicationForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApplicationForm } from '../hooks/use-application-form';
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
  TableOfContents,
  type SectionError,
} from '../components/ApplicationForm';
import type { ProjectPlan, ProjectBudget, TeamMember } from '../types';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { Icon } from '../components/common/icon';
import './ApplicationForm.css';

const FORM_SECTIONS = [
  { id: 'section-1', number: 1, title: 'Основная информация' },
  { id: 'section-2', number: 2, title: 'Команда проекта' },
  { id: 'section-3', number: 3, title: 'Координатор проекта' },
  { id: 'section-4', number: 4, title: 'Ответственный DOBRO.RU' },
  { id: 'section-5', number: 5, title: 'Описание проекта' },
  { id: 'section-6', number: 6, title: 'План проекта' },
  { id: 'section-7', number: 7, title: 'Результаты проекта' },
  { id: 'section-8', number: 8, title: 'Бюджет проекта' },
  { id: 'section-9', number: 9, title: 'Доп. материалы' },
];

export function ApplicationForm() {
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
    handleCoordinatorChange,
    handleDobroChange,
    handleSubmit,
    emptyTeamMember,
    emptyPlan,
    emptyBudget,
  } = useApplicationForm();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentSection, setCurrentSection] = useState<string>('section-1');

  // Преобразование ошибок в формат для оглавления
  const sectionErrors: SectionError[] = [
    {
      sectionId: 'section-1',
      hasError: !!(errors.title || errors.tender_id || errors.direction_id),
      errorCount: [errors.title, errors.tender_id, errors.direction_id].filter(Boolean).length,
    },
    {
      sectionId: 'section-2',
      hasError: Object.keys(errors).some(key => key.startsWith('team_member')),
      errorCount: Object.keys(errors).filter(key => key.startsWith('team_member')).length,
    },
    {
      sectionId: 'section-3',
      hasError: Object.keys(errors).some(key => key.startsWith('coordinator_')) || !!errors.implementation_experience,
      errorCount: Object.keys(errors).filter(key => key.startsWith('coordinator_') || key === 'implementation_experience').length,
    },
    {
      sectionId: 'section-4',
      hasError: Object.keys(errors).some(key => key.startsWith('dobro_')),
      errorCount: Object.keys(errors).filter(key => key.startsWith('dobro_')).length,
    },
    {
      sectionId: 'section-5',
      hasError: !!(errors.idea_description || errors.importance_to_team || errors.project_goal || errors.project_tasks),
      errorCount: [errors.idea_description, errors.importance_to_team, errors.project_goal, errors.project_tasks].filter(Boolean).length,
    },
    {
      sectionId: 'section-6',
      hasError: Object.keys(errors).some(key => key.startsWith('project_plan_')),
      errorCount: Object.keys(errors).filter(key => key.startsWith('project_plan_')).length,
    },
    {
      sectionId: 'section-7',
      hasError: !!(errors.results_description),
      errorCount: errors.results_description ? 1 : 0,
    },
    {
      sectionId: 'section-8',
      hasError: false, // Валидация бюджета
      errorCount: 0,
    },
    {
      sectionId: 'section-9',
      hasError: false,
      errorCount: 0,
    },
  ];

  // Отслеживание текущей секции при скролле
  useEffect(() => {
    const handleScroll = () => {
      const sections = FORM_SECTIONS.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setCurrentSection(FORM_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
      setCurrentSection(sectionId);
    }
  };

  if (loading) {
    return (
      <UserPanelLayout showLogout={false}>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout showLogout={false}>
      <div className="ApplicationForm__layout">
        {/* Основной контент */}
        <div className="ApplicationForm__main">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Секция 1: Основная информация */}
            <div id="section-1">
              <BasicInfoSection
                title={formData.title}
                tender_id={formData.tender_id}
                direction_id={formData.direction_id}
                directions={directions}
                tenders={tenders}
                errors={errors}
                onChange={handleChange}
              />
            </div>

            {/* Секция 2: Команда проекта */}
            <div id="section-2">
              <TeamMembersSection
                team_members={formData.team_members}
                errors={errors}
                onChange={(index: number, field: keyof TeamMember, value: string | boolean | null | string[]) =>
                  handleArrayChange('team_members', index, field, value as any)
                }
                onAdd={() => addArrayItem('team_members', emptyTeamMember)}
                onRemove={(index: number) => removeArrayItem('team_members', index)}
              />
            </div>

            {/* Секция 3: Координатор проекта */}
            <div id="section-3">
              <CoordinatorsSection
                teamMembers={formData.team_members}
                coordinator={formData.coordinator}
                implementation_experience={formData.implementation_experience}
                errors={errors}
                showError={false} // Не показываем ошибку до отправки формы
                onCoordinatorChange={handleCoordinatorChange}
                onExperienceChange={handleChange}
              />
            </div>

            {/* Секция 4: Ответственный DOBRO.RU */}
            <div id="section-4">
              <DobroResponsibleSection
                teamMembers={formData.team_members}
                dobroResponsible={formData.dobro_responsible}
                errors={errors}
                onDobroChange={handleDobroChange}
              />
            </div>

            {/* Секция 5: Описание проекта */}
            <div id="section-5">
              <ProjectDescriptionSection
                idea_description={formData.idea_description}
                importance_to_team={formData.importance_to_team}
                project_goal={formData.project_goal}
                project_tasks={formData.project_tasks}
                errors={errors}
                onChange={handleChange}
              />
            </div>

            {/* Секция 6: План проекта */}
            <div id="section-6">
              <ProjectPlanSection
                project_plans={formData.project_plans}
                errors={errors}
                onChange={(index: number, field: keyof ProjectPlan, value: string) =>
                  handleArrayChange('project_plans', index, field, value)
                }
                onAdd={() => addArrayItem('project_plans', emptyPlan)}
                onRemove={(index: number) => removeArrayItem('project_plans', index)}
              />
            </div>

            {/* Секция 7: Результаты проекта */}
            <div id="section-7">
              <ProjectResultsSection
                results_description={formData.results_description}
                errors={errors}
                onChange={handleChange}
              />
            </div>

            {/* Секция 8: Бюджет проекта */}
            <div id="section-8">
              <ProjectBudgetSection
                project_budget={formData.project_budget}
                onBudgetChange={handleBudgetChange}
                onAdd={() => addArrayItem('project_budget', emptyBudget)}
                onRemove={(index: number) => removeArrayItem('project_budget', index)}
              />
            </div>

            {/* Секция 9: Дополнительные материалы */}
            <div id="section-9">
              <AdditionalMaterialsSection
                additional_materials={formData.additional_materials}
              />
            </div>

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

            {/* Ошибка сохранения */}
            {errors._submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <div className="flex items-start gap-2">
                  <Icon name="warning" size={16}/>
                  <span>{errors._submit}</span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Сайдбар с оглавлением */}
        <aside className="ApplicationForm__sidebar">
          <TableOfContents
            sections={FORM_SECTIONS}
            errors={sectionErrors}
            currentSection={currentSection}
            onSectionClick={handleSectionClick}
          />
        </aside>
      </div>
    </UserPanelLayout>
  );
}

export default ApplicationForm;
