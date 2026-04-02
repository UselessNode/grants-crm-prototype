import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { AdminDirectories as AdminDirectoriesComponent } from '../components/admin-panel';

export function AdminDirectories() {
  const [directions, setDirections] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [tenders, setTenders] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dirsData, tendersData] = await Promise.all([
          adminService.getDirections(),
          adminService.getTenders(),
        ]);
        setDirections(dirsData.data);
        setTenders(tendersData.data);
      } catch (err) {
        setError('Ошибка загрузки справочников');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <AdminDirectoriesComponent directions={directions} tenders={tenders} />
      )}
    </UserPanelLayout>
  );
}

export default AdminDirectories;
