type AdminDirectoriesProps = {
  directions: { id: number; name: string; description?: string | null }[];
  tenders: { id: number; name: string; description?: string | null }[];
};

export function AdminDirectories({ directions, tenders }: AdminDirectoriesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Направления */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Направления</h2>
        <ul className="space-y-2">
          {directions.map(d => (
            <li key={d.id} className="p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">{d.name}</div>
              {d.description && (
                <div className="text-sm text-gray-500 mt-1">{d.description}</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Конкурсы */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Конкурсы (тендеры)</h2>
        <ul className="space-y-2">
          {tenders.map(t => (
            <li key={t.id} className="p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">{t.name}</div>
              {t.description && (
                <div className="text-sm text-gray-500 mt-1">{t.description}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}