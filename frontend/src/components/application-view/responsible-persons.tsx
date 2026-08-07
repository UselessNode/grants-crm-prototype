import type { Application, TeamMember } from "../../types";

interface ResponsiblePersonsProps {
  application: Application;
}

// Вспомогательные функции для извлечения координатора и добро-ответственного
function getCoordinatorPerson(app: Application): TeamMember | undefined {
  if ((app as any).coordinator) return (app as any).coordinator as TeamMember;
  if (app.project_coordinators && app.project_coordinators.length) {
    const pc = app.project_coordinators[0] as any;
    if (pc.team_member) return pc.team_member as TeamMember;
    if (app.team_members && pc.team_member_id) {
      return app.team_members.find((m) => m.id === pc.team_member_id);
    }
  }
  if (app.team_members) {
    const found = (app.team_members as TeamMember[]).find(
      (m) => (m as any).is_coordinator || (m as any).is_project_coordinator,
    );
    if (found) return found;
  }
  return undefined;
}

function getDobroPerson(app: Application): TeamMember | undefined {
  const maybe = (app as any).dobro_responsible ?? app.dobro_responsible;
  if (!maybe) return undefined;
  if (Array.isArray(maybe)) {
    if (maybe.length === 0) return undefined;
    const dr = maybe[0] as any;
    if (!dr) return undefined;
    if (dr.team_member) return dr.team_member as TeamMember;
    if (app.team_members && dr.team_member_id) {
      return app.team_members.find((m) => m.id === dr.team_member_id);
    }
  } else {
    if ((maybe as any).team_member) return (maybe as any).team_member as TeamMember;
    if ((maybe as any).surname || (maybe as any).name) return maybe as TeamMember;
  }
  return undefined;
}

function formatPersonDetails(person: TeamMember | undefined): { name: string; position: string; contact: string } {
  if (!person) {
    return { name: "нет данных", position: "", contact: "" };
  }
  
  const fullName = `${person.surname} ${person.name}${person.patronymic ? " " + person.patronymic : ""}`;
  const position = (person as any).position || "";
  const contact = person.contact_info || "";
  
  return { name: fullName, position, contact };
}

export function ResponsiblePersons({ application }: ResponsiblePersonsProps) {
  const coordinator = getCoordinatorPerson(application);
  const dobro = getDobroPerson(application);
  
  const coordinatorDetails = formatPersonDetails(coordinator);
  const dobroDetails = formatPersonDetails(dobro);

  return (
    <div className="application-section">
      <h3 className="application-section-title">Ответственные лица</h3>

      {/* Координатор */}
      <div className="responsible-card">
        <div className="info-card-title">Координатор проекта</div>
        <div className="responsible-name">{coordinatorDetails.name}</div>
        {(coordinatorDetails.position || coordinatorDetails.contact) && (
          <div className="responsible-details">
            {coordinatorDetails.position && <div>Должность: {coordinatorDetails.position}</div>}
            {coordinatorDetails.contact && <div>Контакты: {coordinatorDetails.contact}</div>}
          </div>
        )}
      </div>

      {/* Ответственный от Добро.ру */}
      <div className="responsible-card">
        <div className="info-card-title">Ответственный от Добро.ру</div>
        <div className="responsible-name">{dobroDetails.name}</div>
        {(dobroDetails.position || dobroDetails.contact) && (
          <div className="responsible-details">
            {dobroDetails.position && <div>Должность: {dobroDetails.position}</div>}
            {dobroDetails.contact && <div>Контакты: {dobroDetails.contact}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
