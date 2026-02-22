// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ApplicationsList from './pages/ApplicationsList';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationView from './pages/ApplicationView';
import UIShowcase from './pages/UIShowcase';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/applications" replace />} />
        <Route path="/applications" element={<ApplicationsList />} />
        <Route path="/applications/new" element={<ApplicationForm />} />
        <Route path="/applications/:id" element={<ApplicationView />} />
        <Route path="/applications/:id/edit" element={<ApplicationForm />} />
        <Route path="/ui_showcase" element={<UIShowcase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
