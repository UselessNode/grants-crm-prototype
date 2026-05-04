// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApplicationsList } from './pages/applications-list';
import { ApplicationForm } from './pages/application-form';
import { ApplicationView } from './pages/application-view';
import { AdminPanel } from './pages/admin-panel';
import { AdminUsers } from './pages/admin-users';
import { AdminExperts } from './pages/admin-experts';
import { AdminDirectories } from './pages/admin-directories';
import { UiShowcase } from './pages/ui-showcase';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Profile } from './pages/profile';
import { Documents } from './pages/documents-list';
import { NotFoundPage } from './pages/not-found';
import { PrivateRoute } from './components/common/private-route';
import { useAuthStore } from './store/auth-store';
import { ToastProvider } from './context/toast-context';

function HomeRedirect() {
  const { user } = useAuthStore();
  // Все пользователи идут на страницу заявок, администратор видит там вкладки админ-панели
  return <Navigate to="/applications" replace />;
}

// Компонент для защиты профиля от администраторов
function ProfileWrapper() {
  const { user } = useAuthStore();
  if (user?.role === 'admin') {
    return <Navigate to="/applications" replace />;
  }
  return <Profile />;
}

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Главная страница — редирект в зависимости от роли */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomeRedirect />
            </PrivateRoute>
          }
        />

        {/* Пользовательские маршруты с вкладками */}
        <Route
          path="/applications"
          element={
            <PrivateRoute>
              <ApplicationsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications/new"
          element={
            <PrivateRoute>
              <ApplicationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <PrivateRoute>
              <ApplicationView />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications/:id/edit"
          element={
            <PrivateRoute>
              <ApplicationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <PrivateRoute>
              <Documents />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfileWrapper />
            </PrivateRoute>
          }
        />

        <Route
          path="/ui-showcase"
          element={
            <PrivateRoute>
              <UiShowcase />
            </PrivateRoute>
          }
        />

        {/* Админские маршруты */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/experts"
          element={
            <PrivateRoute>
              <AdminExperts />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/directories"
          element={
            <PrivateRoute>
              <AdminDirectories />
            </PrivateRoute>
          }
        />

        {/* Страница 404 — должна быть последней */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  </ToastProvider>
  );
}

export default App;
