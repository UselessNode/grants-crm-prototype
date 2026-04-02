import './AdminDirectories.css';

type AdminDirectoriesProps = {
  directions: { id: number; name: string; description?: string | null }[];
  tenders: { id: number; name: string; description?: string | null }[];
};

export function AdminDirectories({ directions, tenders }: AdminDirectoriesProps) {
  return (
    <div className="AdminDirectories">
      {/* Направления */}
      <div className="AdminDirectories__card">
        <h2 className="AdminDirectories__title">Направления</h2>
        <ul className="AdminDirectories__list">
          {directions.map(d => (
            <li key={d.id} className="AdminDirectories__item">
              <div className="AdminDirectories__itemName">{d.name}</div>
              {d.description && (
                <div className="AdminDirectories__itemDescription">{d.description}</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Конкурсы */}
      <div className="AdminDirectories__card">
        <h2 className="AdminDirectories__title">Конкурсы (тендеры)</h2>
        <ul className="AdminDirectories__list">
          {tenders.map(t => (
            <li key={t.id} className="AdminDirectories__item">
              <div className="AdminDirectories__itemName">{t.name}</div>
              {t.description && (
                <div className="AdminDirectories__itemDescription">{t.description}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
