// useApplicationForm.ts
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationService } from '../utils/applicationService';
import type {
  Application, Direction, Status, Tender,
  TeamMember, ProjectCoordinator, DobroResponsible,
  ProjectPlan, ProjectBudget, AdditionalMaterial
} from '../utils/types';

export interface FormData {
  title: string;
  tender_id: string;
  direction_id: string;
  status_id: string;
  team_members: TeamMember[];
  coordinators: ProjectCoordinator[];
  implementation_experience: string;
  dobro_responsible: DobroResponsible[];
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
};

const emptyCoordinator: ProjectCoordinator = {
  surname: '',
  name: '',
  patronymic: '',
  relation_to_team: '',
  contact_info: '',
  social_media_links: '',
  education: '',
  work_experience: '',
};

const emptyDobroResponsible: DobroResponsible = {
  surname: '',
  name: '',
  patronymic: '',
  relation_to_team: '',
  contact_info: '',
  social_media_links: '',
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
  coordinators: [{ ...emptyCoordinator }],
  implementation_experience: '',
  dobro_responsible: [{ ...emptyDobroResponsible }],
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
    arrayName: keyof Pick<FormData, 'team_members' | 'coordinators' | 'dobro_responsible' | 'project_plans' | 'project_budget'>,
    index: number,
    field: keyof T,
    value: unknown
  ) => void;
  addArrayItem: (
    arrayName: keyof Pick<FormData, 'team_members' | 'coordinators' | 'dobro_responsible' | 'project_plans' | 'project_budget'>,
    emptyItem: TeamMember | ProjectCoordinator | DobroResponsible | ProjectPlan | ProjectBudget
  ) => void;
  removeArrayItem: (
    arrayName: keyof Pick<FormData, 'team_members' | 'coordinators' | 'dobro_responsible' | 'project_plans' | 'project_budget'>,
    index: number
  ) => void;
  calculateBudgetTotal: (item: ProjectBudget) => number;
  handleBudgetChange: (index: number, field: keyof ProjectBudget, value: string | number) => void;
  validate: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  emptyTeamMember: TeamMember;
  emptyCoordinator: ProjectCoordinator;
  emptyDobroResponsible: DobroResponsible;
  emptyPlan: ProjectPlan;
  emptyBudget: ProjectBudget;
}

export function useApplicationForm(): UseApplicationFormReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
            coordinators: app.project_coordinators && app.project_coordinators.length > 0 ? app.project_coordinators : [{ ...emptyCoordinator }],
            implementation_experience: app.implementation_experience || '',
            dobro_responsible: app.dobro_responsible && app.dobro_responsible.length > 0 ? app.dobro_responsible : [{ ...emptyDobroResponsible }],
            idea_description: app.idea_description || '',
            importance_to_team: app.importance_to_team || '',
            project_goal: app.project_goal || '',
            project_tasks: app.project_tasks || '',
            project_plans: app.project_plans && app.project_plans.length > 0 ? app.project_plans : [{ ...emptyPlan }],
            results_description: app.results_description || '',
            project_budget: app.project_budget && app.project_budget.length > 0 ? app.project_budget : [{ ...emptyBudget }],
            additional_materials: app.additional_materials || [],
          });
        } catch (error) {
          console.error('Ошибка загрузки заявки:', error);
          alert('Ошибка при загрузке заявки');
          navigate('/applications');
        } finally {
          setLoading(false);
        }
      };
      loadApplication();
    } else {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

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
    arrayName: keyof Pick<FormData, 'team_members' | 'coordinators' | 'dobro_responsible' | 'project_plans' | 'project_budget'>,
    index: number,
    field: keyof T,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (
    arrayName: keyof Pick<FormData, 'team_members' | 'coordinators' | 'dobro_responsible' | 'project_plans' | 'project_budget'>,
    emptyItem: TeamMember | ProjectCoordinator | DobroResponsible | ProjectPlan | ProjectBudget
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...emptyItem }],
    }));
  };

  const removeArrayItem = (
    arrayName: keyof Pick<FormData, 'team_members' | 'coordinators' | 'dobro_responsible' | 'project_plans' | 'project_budget'>,
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
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

  const validate = () => {
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

    formData.coordinators.forEach((coord, idx) => {
      if (!coord.surname.trim()) {
        newErrors[`coordinator_${idx}`] = 'Фамилия обязательна';
      }
      if (!coord.name.trim()) {
        newErrors[`coordinator_${idx}_name`] = 'Имя обязательно';
      }
    });

    formData.dobro_responsible.forEach((dobro, idx) => {
      if (!dobro.surname.trim()) {
        newErrors[`dobro_${idx}`] = 'Фамилия обязательна';
      }
      if (!dobro.name.trim()) {
        newErrors[`dobro_${idx}_name`] = 'Имя обязательно';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
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
        coordinators: formData.coordinators,
        dobro_responsible: formData.dobro_responsible,
        project_plans: formData.project_plans,
        project_budget: formData.project_budget,
        additional_materials: formData.additional_materials,
      };

      if (isEdit) {
        await applicationService.updateApplication(parseInt(id!), submitData);
        alert('Заявка успешно обновлена!');
      } else {
        await applicationService.createApplication(submitData);
        alert('Заявка успешно создана!');
      }
      navigate('/applications');
    } catch (error: unknown) {
      console.error('Ошибка сохранения:', error);
      const errorMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Ошибка при сохранении: ${errorMsg}`);
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
    validate,
    handleSubmit,
    emptyTeamMember,
    emptyCoordinator,
    emptyDobroResponsible,
    emptyPlan,
    emptyBudget,
  };
}
