import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import AuthModal from '../../features/auth/components/AuthModal';
import s from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'АП';

  return (
    <>
      <header className={s.header}>
        <div className={s.logo} onClick={() => navigate('/')}>
          <div className={s.logoIcon}>L</div>
          <span className={s.logoText}>LearnQuest</span>
        </div>

        <nav className={`${s.nav} lq-nav`}>
          <a className={pathname === '/catalog' ? s.navLinkActive : s.navLink} onClick={() => navigate('/catalog')}>Каталог</a>
          <a className={pathname === '/categories' ? s.navLinkActive : s.navLink} onClick={() => navigate('/catalog')}>Категории</a>
          {isAuthenticated && <a className={pathname === '/dashboard' ? s.navLinkActive : s.navLink} onClick={() => navigate('/dashboard')}>Моё обучение</a>}
        </nav>

        <div className={s.searchWrap}>
          <div className={`${s.searchInner} lq-search`}>
            <svg className={s.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
              <line x1="10.7" y1="10.7" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input className={s.searchInput} placeholder="Поиск курсов, авторов, тем…" />
          </div>
        </div>

        <div className={s.actions}>
          {!isAuthenticated ? (
            <>
              <button className={s.loginBtn} onClick={() => setAuthMode('login')}>Войти</button>
              <button className={`${s.registerBtn} lq-reg`} onClick={() => setAuthMode('register')}>Регистрация</button>
            </>
          ) : (
            <>
              <button className={s.logoutBtn} onClick={logout}>Выйти</button>
              <div className={s.avatar} onClick={() => navigate('/dashboard')}>{initials}</div>
            </>
          )}
        </div>
      </header>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      )}
    </>
  );
}
