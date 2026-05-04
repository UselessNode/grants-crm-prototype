import type { TeamMember, DobroResponsible } from '../../../types';
import './DobroResponsibleSection.css';

interface DobroResponsibleSectionProps {
  teamMembers: TeamMember[];
  dobroResponsible: DobroResponsible | null;
  errors: Record<string, string>;
  onDobroChange: (dobro: DobroResponsible | null) => void;
}

export function DobroResponsibleSection({
  teamMembers,
  dobroResponsible,
  errors,
  onDobroChange,
}: DobroResponsibleSectionProps) {
  const selectedMember = dobroResponsible?.team_member_id
    ? teamMembers.find(m => {
        // Для положительных ID ищем по реальному ID
        if (dobroResponsible!.team_member_id! > 0) {
          return m.id === dobroResponsible!.team_member_id;
        }
        // Для отрицательных ID (временных) ищем по индексу
        const memberIndex = -dobroResponsible!.team_member_id! - 1;
        const membersWithId = teamMembers.filter(m => m.id || true); // Все участники
        return membersWithId[memberIndex] === m;
      })
    : null;

  return (
    <div className="section-card DobroResponsibleSection">
      <h2 className="section-title">
        4. Ответственный по работе с порталом "DOBRO.RU"
      </h2>
      <p className="text-gray-500 text-sm mb-4">
        Выберите ответственного из числа участников команды.
      </p>

      <div className="section-card-item">
        <div>
          <label className="field-label">Участник</label>
          <select
            value={dobroResponsible?.team_member_id || ''}
            onChange={(e) => {
              const memberId = e.target.value ? parseInt(e.target.value) : null;
              if (memberId) {
                onDobroChange({
                  team_member_id: memberId,
                  relation_to_team: dobroResponsible?.relation_to_team || '',
                  dobro_link: dobroResponsible?.dobro_link || '',
                });
              } else {
                onDobroChange(null);
              }
            }}
            className="field-input"
          >
            <option value="">— Выберите участника —</option>
            {teamMembers.filter(m => m.id || true).map((member, idx) => {
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
          </div>
        )}

        {selectedMember && (
          <>
            <div className="mt-4">
              <label className="field-label">Отношение к команде</label>
              <input
                type="text"
                value={dobroResponsible?.relation_to_team || ''}
                onChange={(e) => onDobroChange({
                  ...dobroResponsible!,
                  relation_to_team: e.target.value,
                })}
                className="field-input"
                placeholder="Руководитель, координатор..."
              />
            </div>
            <div className="mt-4">
              <label className="field-label">Ссылка на DOBRO.RU</label>
              <input
                type="url"
                value={dobroResponsible?.dobro_link || ''}
                onChange={(e) => onDobroChange({
                  ...dobroResponsible!,
                  dobro_link: e.target.value,
                })}
                className="field-input"
                placeholder="https://dobro.ru/user/123456"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
