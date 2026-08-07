import type { TeamMember } from "../../types";

interface TeamMembersListProps {
  members: TeamMember[];
}

export function TeamMembersList({ members }: TeamMembersListProps) {
  if (!members || members.length === 0) return null;

  return (
    <div className="application-section">
      <h3 className="application-section-title">Команда проекта ({members.length} чел.)</h3>
      <div className="space-y-1">
        {members.map((member, index) => {
          const fullName = `${member.surname} ${member.name}${member.patronymic ? " " + member.patronymic : ""}`;
          const tasks = (member as any).tasks_in_project;
          const contact = member.contact_info;
          const social = (member as any).social_media_links;
          const isMinor = (member as any).is_minor;
          const hasDetails = tasks || contact || social;

          return (
            <div key={member.id || index} className="team-member-card">
              <div className="team-member-name">
                {index + 1}. {fullName}
                {isMinor && <span className="text-[10px] text-orange-600 ml-1">(несовершеннолетний)</span>}
              </div>
              {hasDetails && (
                <div className="team-member-details">
                  {tasks && <div>Задачи: {tasks}</div>}
                  {contact && <div>Контакты: {contact}</div>}
                  {social && <div>Соцсети: {social}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
