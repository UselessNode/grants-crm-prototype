import { Link } from 'react-router-dom';

type AdminPanelHeaderProps = {
  title: string;
};

export function AdminPanelHeader({ title }: AdminPanelHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <Link
            to="/applications"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            ← К заявкам
          </Link>
        </div>
      </div>
    </header>
  );
}