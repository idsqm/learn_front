import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './features/auth/store/authStore';
import Header from './shared/components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CoursePage from './pages/CoursePage';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import BecomeAuthor from './pages/BecomeAuthor';
import VerifyEmail from './pages/VerifyEmail';

function MainContent() {
  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfd' }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/categories" element={<Catalog />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/become-author" element={<BecomeAuthor />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const initialize = useAuthStore(s => s.initialize);
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <Routes>
      <Route path="/studio/*" element={<Studio />} />
      <Route path="/*" element={<MainContent />} />
    </Routes>
  );
}
