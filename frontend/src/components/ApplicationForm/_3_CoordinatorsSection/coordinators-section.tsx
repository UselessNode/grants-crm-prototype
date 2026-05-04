import type { TeamMember, ProjectCoordinator } from '../../../types';
import './CoordinatorsSection.css';

interface CoordinatorsSectionProps {
  teamMembers: TeamMember[];
  coordinator: ProjectCoordinator | null;
  implementation_experience: string;
  errors: Record<string, string>;
  showError?: boolean; // Показывать ли ошибку валидации
  onCoordinatorChange: (coordinator: ProjectCoordinator | null) => void;
  onExperienceChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function CoordinatorsSection({
  teamMembers,
  coordinator,
  implementation_experience,
  errors,
  showError = true,
  onCoordinatorChange,
  onExperienceChange,
}: CoordinatorsSectionProps) {
  // Фильтруем только совершеннолетних участников
  // Примечание: согласие можно загрузить позже, но координатор должен быть совершеннолетним
  const eligibleMembers = teamMembers.filter(m => !m.is_minor);

  const selectedMember = coordinator?.team_member_id
    ? teamMembers.find(m => {
        // Для положительных ID ищем по реальному ID
        if (coordinator!.team_member_id! > 0) {
          return m.id === coordinator!.team_member_id;
        }
        // Для отрицательных ID (временных) ищем по индексу
        const memberIndex = -coordinator!.team_member_id! - 1;
        const eligibleList = teamMembers.filter(m => !m.is_minor);
        return eligibleList[memberIndex] === m;
      })
    : null;

  return (
    <div className="section-card">
      <h2 className="section-title">
        3. Координатор проекта
      </h2>
      <p className="text-gray-500 text-sm mb-4">
        Выберите координатора из числа совершеннолетних участников команды.
      </p>

      <div className="section-card-item">
        <div>
          <label className="field-label">
            Участник <span className="required-mark">*</span>
          </label>
          <select
            value={coordinator?.team_member_id || ''}
            onChange={(e) => {
              const memberId = e.target.value ? parseInt(e.target.value) : null;
              if (memberId) {
                onCoordinatorChange({
                  team_member_id: memberId,
                  relation_to_team: coordinator?.relation_to_team || '',
                  education: coordinator?.education || '',
                  work_experience: coordinator?.work_experience || '',
                });
              } else {
                onCoordinatorChange(null);
              }
            }}
            className={`field-input ${showError && errors['coordinator_0'] ? 'field-input-error' : ''}`}
            data-error="coordinator_0"
          >
            <option value="">— Выберите участника —</option>
            {eligibleMembers.map((member, idx) => {
              // Для участников без ID используем отрицательный индекс как временный идентификатор
              const tempId = member.id ? member.id : -(idx + 1);
              return (
                <option key={tempId} value={tempId}>
                  {member.surname} {member.name} {member.patronymic || ''}
                  {!member.id}
                </option>
              );
            })}
          </select>
          {showError && errors['coordinator_0'] && <p className="field-error">{errors['coordinator_0']}</p>}
        </div>

        {selectedMember && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Контакты:</span> {selectedMember.contact_info || 'не указаны'}
            </p>
            {selectedMember.social_media_links && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Соц. сети:</span> {selectedMember.social_media_links}
              </p>
            )}
            {(!selectedMember.consent_files || selectedMember.consent_files.length === 0) && (
              <p className="text-sm text-yellow-700 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>У участника ещё не загружено согласие на обработку персональных данных</span>
              </p>
            )}
          </div>
        )}

        {selectedMember && (
          <>
            <div className="mt-4">
              <label className="field-label">Отношение к команде</label>
              <input
                type="text"
                value={coordinator?.relation_to_team || ''}
                onChange={(e) => onCoordinatorChange({
                  ...coordinator!,
                  relation_to_team: e.target.value,
                })}
                className="field-input"
                placeholder="Руководитель, наставник..."
              />
            </div>
            <div className="mt-4">
              <label className="field-label">Образование</label>
              <input
                type="text"
                value={coordinator?.education || ''}
                onChange={(e) => onCoordinatorChange({
                  ...coordinator!,
                  education: e.target.value,
                })}
                className="field-input"
                placeholder="ВУЗ, специальность"
              />
            </div>
            <div className="mt-4">
              <label className="field-label">Опыт работы</label>
              <textarea
                value={coordinator?.work_experience || ''}
                onChange={(e) => onCoordinatorChange({
                  ...coordinator!,
                  work_experience: e.target.value,
                })}
                className="field-input-lg"
                placeholder="Описание опыта работы"
                rows={3}
              />
            </div>
          </>
        )}
      </div>

      {/* Описание опыта работы команды */}
      <div className="mt-6">
        <label className="field-label-lg">Описание опыта работы команды</label>
        <textarea
          name="implementation_experience"
          value={implementation_experience}
          onChange={onExperienceChange}
          className="field-input-lg"
          placeholder="Расскажите о предыдущих проектах команды..."
          rows={4}
        />
        {errors['implementation_experience'] && (
          <p className="field-error-lg">{errors['implementation_experience']}</p>
        )}
      </div>
    </div>
  );
}
