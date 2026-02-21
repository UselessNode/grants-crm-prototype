import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { applicationService } from '../utils/applicationService';
import type {
  Application, Direction, Status, Tender,
  TeamMember, ProjectCoordinator, DobroResponsible,
  ProjectPlan, ProjectBudget, AdditionalMaterial
} from '../utils/types';

interface FormData {
  // Основная информация
  title: string;
  tender_id: string;
  direction_id: string;
  status_id: string;

  // Команда проекта
  team_members: TeamMember[];

  // Координатор
  coordinators: ProjectCoordinator[];
  implementation_experience: string;

  // Ответственный DOBRO.RU
  dobro_responsible: DobroResponsible[];

  // Описание проекта
  idea_description: string;
  importance_to_team: string;
  project_goal: string;
  project_tasks: string;

  // План
  project_plans: ProjectPlan[];

  // Результаты
  results_description: string;

  // Бюджет
  project_budget: ProjectBudget[];

  // Файлы
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
  deadline: '',
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
  status_id: '1',
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

export default function ApplicationForm() {
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
          const app = data.data as Application & {
            team_members?: TeamMember[];
            project_coordinators?: ProjectCoordinator[];
            dobro_responsible?: DobroResponsible[];
            project_plans?: ProjectPlan[];
            project_budget?: ProjectBudget[];
            additional_materials?: AdditionalMaterial[];
          };

          setFormData({
            title: app.title || '',
            tender_id: app.tender_id?.toString() || '',
            direction_id: app.direction_id?.toString() || '',
            status_id: app.status_id?.toString() || '1',
            team_members: app.team_members?.length ? app.team_members : [{ ...emptyTeamMember }],
            coordinators: app.project_coordinators?.length ? app.project_coordinators : [{ ...emptyCoordinator }],
            implementation_experience: app.implementation_experience || '',
            dobro_responsible: app.dobro_responsible?.length ? app.dobro_responsible : [{ ...emptyDobroResponsible }],
            idea_description: app.idea_description || '',
            importance_to_team: app.importance_to_team || '',
            project_goal: app.project_goal || '',
            project_tasks: app.project_tasks || '',
            project_plans: app.project_plans?.length ? app.project_plans : [{ ...emptyPlan }],
            results_description: app.results_description || '',
            project_budget: app.project_budget?.length ? app.project_budget : [{ ...emptyBudget }],
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

  // Обработчики для вложенных полей
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

  // Вычисление итога бюджета
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
        // Автопересчет итога
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

    // Валидация команды
    formData.team_members.forEach((member, idx) => {
      if (!member.surname.trim()) {
        newErrors[`team_member_${idx}`] = 'Фамилия обязательна';
      }
      if (!member.name.trim()) {
        newErrors[`team_member_${idx}_name`] = 'Имя обязательно';
      }
    });

    // Валидация координатора
    formData.coordinators.forEach((coord, idx) => {
      if (!coord.surname.trim()) {
        newErrors[`coordinator_${idx}`] = 'Фамилия обязательна';
      }
      if (!coord.name.trim()) {
        newErrors[`coordinator_${idx}_name`] = 'Имя обязательно';
      }
    });

    // Валидация ответственного DOBRO
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
        ...formData,
        tender_id: formData.tender_id ? parseInt(formData.tender_id) : null,
        direction_id: formData.direction_id ? parseInt(formData.direction_id) : null,
        status_id: formData.status_id ? parseInt(formData.status_id) : 1,
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
          <Link
            to="/applications"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Назад к списку
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Секция 1: Основная информация */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              1. Основная информация
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название проекта <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Введите название проекта"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Конкурс
                </label>
                <select
                  name="tender_id"
                  value={formData.tender_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Не выбран</option>
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Направление <span className="text-red-500">*</span>
                </label>
                <select
                  name="direction_id"
                  value={formData.direction_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.direction_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Не выбрано</option>
                  {directions.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Секция 2: Команда проекта */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              2. Состав команды проекта
            </h2>
            {formData.team_members.map((member, idx) => (
              <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">Участник #{idx + 1}</span>
                  {formData.team_members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('team_members', idx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Фамилия *</label>
                    <input
                      type="text"
                      value={member.surname}
                      onChange={(e) => handleArrayChange('team_members', idx, 'surname', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${errors[`team_member_${idx}`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Иванов"
                    />
                    {errors[`team_member_${idx}`] && <p className="mt-1 text-xs text-red-500">{errors[`team_member_${idx}`]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Имя *</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleArrayChange('team_members', idx, 'name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${errors[`team_member_${idx}_name`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Иван"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Отчество</label>
                    <input
                      type="text"
                      value={member.patronymic || ''}
                      onChange={(e) => handleArrayChange('team_members', idx, 'patronymic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Иванович"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Задачи в проекте</label>
                    <input
                      type="text"
                      value={member.tasks_in_project || ''}
                      onChange={(e) => handleArrayChange('team_members', idx, 'tasks_in_project', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Разработчик, дизайнер..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Контактные данные</label>
                    <input
                      type="text"
                      value={member.contact_info || ''}
                      onChange={(e) => handleArrayChange('team_members', idx, 'contact_info', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Телефон, email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Соц. сети</label>
                    <input
                      type="text"
                      value={member.social_media_links || ''}
                      onChange={(e) => handleArrayChange('team_members', idx, 'social_media_links', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="VK, Telegram..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('team_members', emptyTeamMember)}
              className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Добавить участника
            </button>
          </div>

          {/* Секция 3: Координатор проекта */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              3. Координатор проекта
            </h2>
            {formData.coordinators.map((coord, idx) => (
              <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">Координатор #{idx + 1}</span>
                  {formData.coordinators.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('coordinators', idx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Фамилия *</label>
                    <input
                      type="text"
                      value={coord.surname}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'surname', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${errors[`coordinator_${idx}`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Иванов"
                    />
                    {errors[`coordinator_${idx}`] && <p className="mt-1 text-xs text-red-500">{errors[`coordinator_${idx}`]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Имя *</label>
                    <input
                      type="text"
                      value={coord.name}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Иван"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Отчество</label>
                    <input
                      type="text"
                      value={coord.patronymic || ''}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'patronymic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Иванович"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Кем приходится команде</label>
                    <input
                      type="text"
                      value={coord.relation_to_team || ''}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'relation_to_team', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Руководитель, куратор..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Контактные данные</label>
                    <input
                      type="text"
                      value={coord.contact_info || ''}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'contact_info', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Телефон, email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Соц. сети</label>
                    <input
                      type="text"
                      value={coord.social_media_links || ''}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'social_media_links', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="VK, Telegram..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Образование</label>
                    <input
                      type="text"
                      value={coord.education || ''}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'education', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="ВУЗ, специальность"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Опыт работы</label>
                    <input
                      type="text"
                      value={coord.work_experience || ''}
                      onChange={(e) => handleArrayChange('coordinators', idx, 'work_experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Место работы, должность"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Опыт реализации проектов
              </label>
              <textarea
                name="implementation_experience"
                value={formData.implementation_experience}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Опишите опыт реализации подобных проектов"
              />
            </div>

            <button
              type="button"
              onClick={() => addArrayItem('coordinators', emptyCoordinator)}
              className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Добавить координатора
            </button>
          </div>

          {/* Секция 4: Ответственный за DOBRO.RU */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              4. Ответственный по работе с порталом "DOBRO.RU"
            </h2>
            {formData.dobro_responsible.map((dobro, idx) => (
              <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">Ответственный #{idx + 1}</span>
                  {formData.dobro_responsible.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('dobro_responsible', idx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Фамилия *</label>
                    <input
                      type="text"
                      value={dobro.surname}
                      onChange={(e) => handleArrayChange('dobro_responsible', idx, 'surname', e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${errors[`dobro_${idx}`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Иванов"
                    />
                    {errors[`dobro_${idx}`] && <p className="mt-1 text-xs text-red-500">{errors[`dobro_${idx}`]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Имя *</label>
                    <input
                      type="text"
                      value={dobro.name}
                      onChange={(e) => handleArrayChange('dobro_responsible', idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Иван"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Отчество</label>
                    <input
                      type="text"
                      value={dobro.patronymic || ''}
                      onChange={(e) => handleArrayChange('dobro_responsible', idx, 'patronymic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Иванович"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Кем приходится команде</label>
                    <input
                      type="text"
                      value={dobro.relation_to_team || ''}
                      onChange={(e) => handleArrayChange('dobro_responsible', idx, 'relation_to_team', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Волонтёр, координатор..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Контактные данные</label>
                    <input
                      type="text"
                      value={dobro.contact_info || ''}
                      onChange={(e) => handleArrayChange('dobro_responsible', idx, 'contact_info', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Телефон, email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Соц. сети</label>
                    <input
                      type="text"
                      value={dobro.social_media_links || ''}
                      onChange={(e) => handleArrayChange('dobro_responsible', idx, 'social_media_links', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="VK, Telegram..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('dobro_responsible', emptyDobroResponsible)}
              className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Добавить ответственного
            </button>
          </div>

          {/* Секция 5: Описание проекта */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              5. Описание проекта
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  5.1 Идея проекта и почему она должна быть реализована <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="idea_description"
                  value={formData.idea_description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.idea_description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Опишите вашу идею"
                />
                {errors.idea_description && <p className="mt-1 text-sm text-red-500">{errors.idea_description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  5.2 Почему вашей команде этот проект важен <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="importance_to_team"
                  value={formData.importance_to_team}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.importance_to_team ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Почему это важно для вашей команды"
                />
                {errors.importance_to_team && <p className="mt-1 text-sm text-red-500">{errors.importance_to_team}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  5.3 Цель проекта <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="project_goal"
                  value={formData.project_goal}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.project_goal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Какую цель вы хотите достичь"
                />
                {errors.project_goal && <p className="mt-1 text-sm text-red-500">{errors.project_goal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  5.4 Задачи проекта <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="project_tasks"
                  value={formData.project_tasks}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.project_tasks ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Перечислите основные задачи"
                />
                {errors.project_tasks && <p className="mt-1 text-sm text-red-500">{errors.project_tasks}</p>}
              </div>
            </div>
          </div>

          {/* Секция 6: План проекта */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              6. План проекта
            </h2>
            {formData.project_plans.map((plan, idx) => (
              <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">Этап #{idx + 1}</span>
                  {formData.project_plans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('project_plans', idx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Задача</label>
                    <input
                      type="text"
                      value={plan.task}
                      onChange={(e) => handleArrayChange('project_plans', idx, 'task', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Название задачи"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Мероприятие</label>
                    <input
                      type="text"
                      value={plan.event_name}
                      onChange={(e) => handleArrayChange('project_plans', idx, 'event_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Название мероприятия"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Описание мероприятия</label>
                    <textarea
                      value={plan.event_description || ''}
                      onChange={(e) => handleArrayChange('project_plans', idx, 'event_description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Подробное описание"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Сроки</label>
                    <input
                      type="date"
                      value={plan.deadline || ''}
                      onChange={(e) => handleArrayChange('project_plans', idx, 'deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Итоги</label>
                    <input
                      type="text"
                      value={plan.results || ''}
                      onChange={(e) => handleArrayChange('project_plans', idx, 'results', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Ожидаемые итоги"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Форма фиксации</label>
                    <input
                      type="text"
                      value={plan.fixation_form || ''}
                      onChange={(e) => handleArrayChange('project_plans', idx, 'fixation_form', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Отчёт, фото, видео..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('project_plans', emptyPlan)}
              className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Добавить этап
            </button>
          </div>

          {/* Секция 7: Результаты проекта */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              7. Результаты проекта
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Что изменилось по итогу проекта
              </label>
              <textarea
                name="results_description"
                value={formData.results_description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Опишите ожидаемые результаты"
              />
            </div>
          </div>

          {/* Секция 8: Бюджет */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              8. Бюджет проекта
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ресурс</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Стоимость ед.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Кол-во</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Итого</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Собственные</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Грант</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Комментарий</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.project_budget.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.resource_type}
                          onChange={(e) => handleBudgetChange(idx, 'resource_type', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Оборудование..."
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_cost ?? ''}
                          onChange={(e) => handleBudgetChange(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity ?? ''}
                          onChange={(e) => handleBudgetChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.total_cost?.toFixed(2) || '0.00'}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.own_funds ?? ''}
                          onChange={(e) => handleBudgetChange(idx, 'own_funds', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.grant_funds ?? ''}
                          onChange={(e) => handleBudgetChange(idx, 'grant_funds', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.comment || ''}
                          onChange={(e) => handleBudgetChange(idx, 'comment', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {formData.project_budget.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('project_budget', idx)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => addArrayItem('project_budget', emptyBudget)}
              className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Добавить статью расходов
            </button>

            {/* Итого */}
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Общая стоимость:</span>
                  <span className="ml-2 font-semibold">
                    {formData.project_budget.reduce((sum, item) => sum + (item.total_cost || 0), 0).toFixed(2)} ₽
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Собственные средства:</span>
                  <span className="ml-2 font-semibold">
                    {formData.project_budget.reduce((sum, item) => sum + (item.own_funds || 0), 0).toFixed(2)} ₽
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Запрашивается из гранта:</span>
                  <span className="ml-2 font-semibold">
                    {formData.project_budget.reduce((sum, item) => sum + (item.grant_funds || 0), 0).toFixed(2)} ₽
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Секция 9: Дополнительные материалы */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              9. Дополнительные материалы
            </h2>
            <div className="text-sm text-gray-600 mb-2">
              Допустимые форматы: *.pdf, *.xls, *.xlsx, *.doc, *.docx, *.ppt, *.pptx, *.odt
            </div>
            {formData.additional_materials.length === 0 ? (
              <div className="text-gray-500 text-sm">Файлы будут добавлены после сохранения заявки</div>
            ) : (
              <div className="space-y-2">
                {formData.additional_materials.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{file.file_name}</div>
                      {file.comment && <div className="text-sm text-gray-500">{file.comment}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
