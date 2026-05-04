// use-application-form.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { useToast } from '../context/toast-context';
import type {
  Application, Direction, Status, Tender,
  TeamMember, ProjectCoordinator, DobroResponsible,
  ProjectPlan, ProjectBudget, AdditionalMaterial
} from '../types';

// Вспомогательная функция для извлечения сообщения об ошибке
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Неизвестная ошибка';
};

export interface FormData {
  title: string;
  tender_id: string;
  direction_id: string;
  status_id: string;
  team_members: TeamMember[];
  coordinator: ProjectCoordinator | null;
  implementation_experience: string;
  dobro_responsible: DobroResponsible | null;
  idea_description: string;
  importance_to_team: string;
  project_goal: string;
  project_tasks: string;
  project_plans: ProjectPlan[];
  results_description: string;
  project_budget: ProjectBudget[];
  additional_materials: AdditionalMaterial[];
}

const emptyTeamMember: TeamMember = {
  surname: '',
  name: '',
  patronymic: '',
  tasks_in_project: '',
  contact_info: '',
  social_media_links: '',
  consent_file: null,
  is_minor: false,
};

const emptyPlan: ProjectPlan = {
  task: '',
  event_name: '',
  event_description: '',
  start_date: '',
  end_date: '',
  results: '',
  fixation_form: '',
};

const emptyBudget: ProjectBudget = {
  resource_type: '',
  unit_cost: 0,
  quantity: 1,
  total_cost: 0,
  own_funds: 0,
  grant_funds: 0,
  comment: '',
};

const initialFormData: FormData = {
  title: '',
  tender_id: '',
  direction_id: '',
  status_id: '1', // По умолчанию Черновик
  team_members: [{ ...emptyTeamMember }],
  coordinator: null,
  implementation_experience: '',
  dobro_responsible: null,
  idea_description: '',
  importance_to_team: '',
  project_goal: '',
  project_tasks: '',
  project_plans: [{ ...emptyPlan }],
  results_description: '',
  project_budget: [{ ...emptyBudget }],
  additional_materials: [],
};

export interface UseApplicationFormReturn {
  id: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
  isEdit: boolean;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  directions: Direction[];
  statuses: Status[];
  tenders: Tender[];
  loading: boolean;
  saving: boolean;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleArrayChange: <T,>(
    arrayName: keyof Pick<FormData, 'team_members' | 'project_plans' | 'project_budget'>,
    index: number,
    field: keyof T,
    value: unknown
  ) => void;
  addArrayItem: (
    arrayName: keyof Pick<FormData, 'team_members' | 'project_plans' | 'project_budget'>,
    emptyItem: TeamMember | ProjectPlan | ProjectBudget
  ) => void;
  removeArrayItem: (
    arrayName: keyof Pick<FormData, 'team_members' | 'project_plans' | 'project_budget'>,
    index: number
  ) => void;
  calculateBudgetTotal: (item: ProjectBudget) => number;
  handleBudgetChange: (index: number, field: keyof ProjectBudget, value: string | number) => void;
  handleCoordinatorChange: (coordinator: ProjectCoordinator | null) => void;
  handleDobroChange: (dobro: DobroResponsible | null) => void;
  validate: () => { valid: boolean; errorCount: number; errorKeys: string[] };
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  emptyTeamMember: TeamMember;
  emptyPlan: ProjectPlan;
  emptyBudget: ProjectBudget;
}

export function useApplicationForm(): UseApplicationFormReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const toast = useToast();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false); // Отслеживаем, была ли попытка отправки

  // Вспомогательная функция для преобразования даты в формат YYYY-MM-DD
  const formatDateForInput = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';

    // Если это строка, проверяем формат
    if (typeof dateValue === 'string') {
      // Если уже в формате YYYY-MM-DD, возвращаем как есть
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      // Если ISO формат (с временем), преобразуем в YYYY-MM-DD
      if (dateValue.includes('T')) {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      // Пробуем создать дату из строки
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return dateValue;
    }

    // Если это объект Date
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toISOString().split('T')[0];
      }
    }

    return '';
  };

  // Загрузка данных для редактирования
  useEffect(() => {
    const loadDirectories = async () => {
      try {
        const [directionsData, statusesData, tendersData] = await Promise.all([
          applicationService.getDirections(),
          applicationService.getStatuses(),
          applicationService.getTenders(),
        ]);
        setDirections(directionsData.data);
        setStatuses(statusesData.data);
        setTenders(tendersData.data);
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error);
      }
    };

    loadDirectories();

    if (isEdit) {
      const loadApplication = async () => {
        try {
          const data = await applicationService.getApplication(parseInt(id!));
          const app = data.data;

          setFormData({
            title: app.title || '',
            tender_id: app.tender_id?.toString() || '',
            direction_id: app.direction_id?.toString() || '',
            status_id: app.status_id?.toString() || '1',
            team_members: app.team_members && app.team_members.length > 0 ? app.team_members : [{ ...emptyTeamMember }],
            coordinator: app.project_coordinators && app.project_coordinators.length > 0 ? app.project_coordinators[0] : null,
            implementation_experience: app.implementation_experience || '',
            dobro_responsible: app.dobro_responsible && app.dobro_responsible.length > 0 ? app.dobro_responsible[0] : null,
            idea_description: app.idea_description || '',
            importance_to_team: app.importance_to_team || '',
            project_goal: app.project_goal || '',
            project_tasks: app.project_tasks || '',
            project_plans: app.project_plans && app.project_plans.length > 0
              ? app.project_plans.map(plan => ({
                  ...plan,
                  start_date: formatDateForInput(plan.start_date),
                  end_date: formatDateForInput(plan.end_date),
                }))
              : [{ ...emptyPlan }],
            results_description: app.results_description || '',
            project_budget: app.project_budget && app.project_budget.length > 0 ? app.project_budget : [{ ...emptyBudget }],
            additional_materials: app.additional_materials || [],
          });
        } catch (error) {
          console.error('Ошибка загрузки заявки:', error);
          const message = getErrorMessage(error);
          toast.error('Ошибка загрузки', `Не удалось загрузить заявку: ${message}`);
          navigate('/applications');
        } finally {
          setLoading(false);
        }
      };
      loadApplication();
    } else {
      setLoading(false);
    }
  }, [id, isEdit, navigate, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = <T,>(
    arrayName: keyof Pick<FormData, 'team_members' | 'project_plans' | 'project_budget'>,
    index: number,
    field: keyof T,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName] as T[]).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (
    arrayName: keyof Pick<FormData, 'team_members' | 'project_plans' | 'project_budget'>,
    emptyItem: TeamMember | ProjectPlan | ProjectBudget
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as any[]), { ...emptyItem }],
    }));
  };

  const removeArrayItem = (
    arrayName: keyof Pick<FormData, 'team_members' | 'project_plans' | 'project_budget'>,
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index),
    }));
  };

  const handleCoordinatorChange = (coordinator: ProjectCoordinator | null) => {
    setFormData(prev => ({ ...prev, coordinator }));
  };

  const handleDobroChange = (dobroResponsible: DobroResponsible | null) => {
    setFormData(prev => ({ ...prev, dobro_responsible: dobroResponsible }));
  };

  const calculateBudgetTotal = (item: ProjectBudget) => {
    const unitCost = Number(item.unit_cost) || 0;
    const quantity = Number(item.quantity) || 1;
    return unitCost * quantity;
  };

  const handleBudgetChange = (index: number, field: keyof ProjectBudget, value: string | number) => {
    setFormData((prev) => {
      const newBudget = prev.project_budget.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (['unit_cost', 'quantity'].includes(field)) {
          updated.total_cost = calculateBudgetTotal(updated);
        }
        return updated;
      });
      return { ...prev, project_budget: newBudget };
    });
  };

  const validate = (): { valid: boolean; errorCount: number; errorKeys: string[] } => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Название обязательно';
    if (!formData.idea_description.trim()) newErrors.idea_description = 'Описание идеи обязательно';
    if (!formData.importance_to_team.trim()) newErrors.importance_to_team = 'Важность для команды обязательна';
    if (!formData.project_goal.trim()) newErrors.project_goal = 'Цель проекта обязательна';
    if (!formData.project_tasks.trim()) newErrors.project_tasks = 'Задачи проекта обязательны';

    formData.team_members.forEach((member, idx) => {
      if (!member.surname.trim()) {
        newErrors[`team_member_${idx}`] = 'Фамилия обязательна';
      }
      if (!member.name.trim()) {
        newErrors[`team_member_${idx}_name`] = 'Имя обязательно';
      }
    });

    // Координатор — обязателен (показываем ошибку только после первой попытки отправки)
    if (touched && (!formData.coordinator || !formData.coordinator.team_member_id)) {
      newErrors['coordinator_0'] = 'Выберите координатора из списка участников';
    }

    // Ответственный DOBRO — необязателен

    // Валидация плана проекта
    formData.project_plans.forEach((plan, idx) => {
      if (!plan.task?.trim()) {
        newErrors[`project_plan_${idx}_task`] = 'Задача обязательна';
      }
      if (!plan.event_name?.trim()) {
        newErrors[`project_plan_${idx}_event_name`] = 'Название мероприятия обязательно';
      }
      if (!plan.event_description?.trim()) {
        newErrors[`project_plan_${idx}_event_description`] = 'Описание мероприятия обязательно';
      }
      if (!plan.start_date?.trim()) {
        newErrors[`project_plan_${idx}_start_date`] = 'Дата начала обязательна';
      }
      if (!plan.end_date?.trim()) {
        newErrors[`project_plan_${idx}_end_date`] = 'Дата окончания обязательна';
      }
      if (!plan.results?.trim()) {
        newErrors[`project_plan_${idx}_results`] = 'Результат мероприятия обязателен';
      }
      if (!plan.fixation_form?.trim()) {
        newErrors[`project_plan_${idx}_fixation_form`] = 'Форма фиксации обязательна';
      }
    });

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    const errorCount = errorKeys.length;
    return { valid: errorCount === 0, errorCount, errorKeys };
  };

  const scrollToError = useCallback((errorKey: string) => {
    // Пробуем найти по ID (для секций и полей с id)
    const byId = document.getElementById(errorKey);
    if (byId) {
      byId.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // Пробуем найти по name
    const byName = document.querySelector(`[name="${errorKey}"]`);
    if (byName) {
      byName.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // Для полей массивов — ищем по data-атрибуту или label
    const byDataError = document.querySelector(`[data-error="${errorKey}"]`);
    if (byDataError) {
      byDataError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true); // Помечаем, что была попытка отправки

    const { valid, errorCount, errorKeys } = validate();

    if (!valid) {
      // Показываем тост с количеством ошибок
      toast.warning(
        'Проверьте правильность заполнения формы',
        `Найдено ошибок: ${errorCount}. Исправьте их и попробуйте снова.`
      );

      // Скроллим к первой ошибке
      if (errorKeys.length > 0) {
        setTimeout(() => scrollToError(errorKeys[0]), 100);
      }
      return;
    }

    setSaving(true);
    try {
      // Лог для отладки FK ошибки
      if (isEdit) {
        console.log('[handleSubmit] team_members:', formData.team_members.map(m => ({ id: m.id, surname: m.surname })));
        console.log('[handleSubmit] coordinator:', formData.coordinator);
      }

      const submitData = {
        title: formData.title,
        tender_id: formData.tender_id ? parseInt(formData.tender_id) : null,
        direction_id: formData.direction_id ? parseInt(formData.direction_id) : null,
        status_id: formData.status_id ? parseInt(formData.status_id) : 1, // По умолчанию Черновик
        idea_description: formData.idea_description,
        importance_to_team: formData.importance_to_team,
        project_goal: formData.project_goal,
        project_tasks: formData.project_tasks,
        implementation_experience: formData.implementation_experience || undefined,
        results_description: formData.results_description || undefined,
        team_members: formData.team_members,
        coordinators: formData.coordinator ? [formData.coordinator] : [],
        dobro_responsible: formData.dobro_responsible ? [formData.dobro_responsible] : [],
        project_plans: formData.project_plans,
        project_budget: formData.project_budget,
        additional_materials: formData.additional_materials,
      };

      if (isEdit) {
        await applicationService.updateApplication(parseInt(id!), submitData);
        toast.success('Заявка обновлена', 'Изменения успешно сохранены');
      } else {
        await applicationService.createApplication(submitData);
        toast.success('Заявка создана', 'Ваша заявка успешно создана');
      }
      navigate('/applications');
    } catch (error: unknown) {
      console.error('Ошибка сохранения:', error);

      // Обрабатываем ошибки сервера
      const message = getErrorMessage(error);

      setErrors(prev => ({
        ...prev,
        _submit: message,
      }));

      toast.error('Ошибка сохранения', `Не удалось сохранить заявку: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    navigate,
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
    calculateBudgetTotal,
    handleBudgetChange,
    handleCoordinatorChange,
    handleDobroChange,
    validate,
    handleSubmit,
    emptyTeamMember,
    emptyPlan,
    emptyBudget,
  };
}
