// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ApplicationsList from './pages/ApplicationsList';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationView from './pages/ApplicationView';
import AdminPanel from './pages/AdminPanel';
import UIShowcase from './pages/UIShowcase';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Защищённые маршруты */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navigate to="/applications" replace />
            </PrivateRoute>
          }
        />
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
          path="/ui_showcase"
          element={
            <PrivateRoute>
              <UIShowcase />
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
