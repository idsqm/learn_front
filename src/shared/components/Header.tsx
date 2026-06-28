import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import AuthModal from '../../features/auth/components/AuthModal';
import LogoIcon from './LogoIcon';
import s from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'АП';

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      <header className={s.header}>
        <div className={s.logo} onClick={() => navigate('/')}>
          <LogoIcon size={32} />
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
            <input
              className={s.searchInput}
              placeholder="Поиск курсов, авторов, тем…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className={s.actions}>
          {!isAuthenticated ? (
            <>
              <button className={s.loginBtn} onClick={() => setAuthMode('login')}>Войти</button>
              <button className={`${s.registerBtn} lq-reg`} onClick={() => setAuthMode('register')}>Регистрация</button>
            </>
          ) : (
            <div className={s.avatarWrap}>
              <div className={s.avatar} onClick={() => setMenuOpen(!menuOpen)}>{initials}</div>
              {menuOpen && (
                <>
                  <div className={s.menuOverlay} onClick={() => setMenuOpen(false)} />
                  <div className={s.menu}>
                    <div className={s.menuUser}>
                      <div className={s.menuUserAvatar}>{initials}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className={s.menuUserName}>{user?.username || 'Пользователь'}</div>
                        <div className={s.menuUserEmail}>{user?.email || ''}</div>
                      </div>
                    </div>
                    <div className={s.menuDivider} />
                    <button className={s.menuItem} onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b6a76" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>
                      <span>ЛК ученика</span>
                    </button>
                    {user?.role === 'author' ? (
                      <button className={s.menuItem} onClick={() => { setMenuOpen(false); navigate('/studio'); }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b6a76" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18" /><path d="M4 4v10h16V4" /><path d="M12 14v4" /><path d="M9 21l3-3 3 3" /></svg>
                        <span style={{ flex: 1 }}>Кабинет учителя</span>
                        <span className={s.studioBadge}>СТУДИЯ</span>
                      </button>
                    ) : (
                      <button className={s.menuItem} onClick={() => { setMenuOpen(false); navigate('/become-author'); }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b6a76" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        <span>Стать автором</span>
                      </button>
                    )}
                    <div className={s.menuDivider} />
                    <button className={s.menuItemLogout} onClick={() => { setMenuOpen(false); logout(); }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
                      <span>Выйти</span>
                    </button>
                  </div>
                </>
              )}
            </div>
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
