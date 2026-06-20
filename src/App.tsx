import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './features/auth/store/authStore';
import Header from './shared/components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CoursePage from './pages/CoursePage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => { initialize(); }, [initialize]);

  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfd' }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/categories" element={<Catalog />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
