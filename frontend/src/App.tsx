// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApplicationsList } from './pages/applications-list';
import { ApplicationForm } from './pages/application-form';
import { ApplicationView } from './pages/application-view';
import { AdminPanel } from './pages/admin-panel';
import { UiShowcase } from './pages/ui-showcase';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Profile } from './pages/profile';
import { Documents } from './pages/documents';
import { PrivateRoute } from './components/common/private-route';
import { useAuthStore } from './store/auth-store';

function HomeRedirect() {
  const { user } = useAuthStore();
  const redirectTo = user?.role === 'admin' ? '/admin' : '/applications';
  return <Navigate to={redirectTo} replace />;
}

export function App() {
  return (
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
              <Profile />
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

        {/* Админ-панель (доступ только для admin) */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
