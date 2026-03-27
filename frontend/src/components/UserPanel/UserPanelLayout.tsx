import { UserPanelTabs } from './UserPanelTabs';
import Logo from '../Logo';

type UserPanelLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function UserPanelLayout({ title, children }: UserPanelLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер с логотипом */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo variant="page" />
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>
      </header>

      {/* Вкладки */}
      <UserPanelTabs />

      {/* Контент */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
