import { UserPanelLayout } from '../components/UserPanel/UserPanelLayout';
import { Icon } from '../components/Icon';

// Временные тестовые данные
const documents = [
  {
    id: 1,
    title: 'Положение о гранте "Арбузный грант"',
    type: 'PDF',
    size: '2.4 МБ',
    date: '2026-03-01',
    category: 'Положения',
  },
  {
    id: 2,
    title: 'Методические рекомендации по заполнению заявки',
    type: 'PDF',
    size: '1.8 МБ',
    date: '2026-03-05',
    category: 'Методички',
  },
  {
    id: 3,
    title: 'Форма согласия на обработку персональных данных',
    type: 'PDF',
    size: '0.5 МБ',
    date: '2026-02-20',
    category: 'Формы',
  },
  {
    id: 4,
    title: 'Требования к оформлению проектов',
    type: 'PDF',
    size: '1.2 МБ',
    date: '2026-03-10',
    category: 'Положения',
  },
  {
    id: 5,
    title: 'Календарь мероприятий 2026',
    type: 'PDF',
    size: '3.1 МБ',
    date: '2026-01-15',
    category: 'Документы',
  },
];

const categories = ['Все', 'Положения', 'Методички', 'Формы', 'Документы'];

export default function Documents() {
  return (
    <UserPanelLayout title="Документы">
      <div className="max-w-6xl mx-auto">
        {/* Фильтр по категориям */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  cat === 'Все'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Список документов */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Размер
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действие
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Icon name="document" size={20} className="text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-xs text-gray-500">{doc.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                      <Icon name="download" size={16} />
                      Скачать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Информация */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Документы для участников</p>
              <p>
                В этом разделе размещены все необходимые документы для участия в грантовой программе.
                Рекомендуем ознакомиться с положением о гранте и методическими рекомендациями перед заполнением заявки.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserPanelLayout>
  );
}
