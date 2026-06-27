import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import LogoIcon from '../shared/components/LogoIcon';
import s from './Studio.module.css';

type Tab = 'courses' | 'students' | 'income' | 'reviews';

export default function Studio() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('courses');
  const [menuOpen, setMenuOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'АК';
  const displayName = user?.username || 'Автор';

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'courses', label: 'Курсы' },
    { key: 'students', label: 'Студенты' },
    { key: 'income', label: 'Доходы' },
    { key: 'reviews', label: 'Отзывы' },
  ];

  return (
    <div className={s.layout}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.logo} onClick={() => navigate('/')}>
            <LogoIcon size={30} />
            <span className={s.logoText}>LearnQuest</span>
            <span className={s.studioBadge}>СТУДИЯ</span>
          </div>

          <nav className={s.nav}>
            {tabs.map(t => (
              <a
                key={t.key}
                className={tab === t.key ? s.navLinkActive : s.navLink}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </a>
            ))}
          </nav>

          <div className={s.spacer} />
          <button className={s.previewBtn} onClick={() => navigate('/')}>Предпросмотр сайта ↗</button>

          <button className={s.burger} onClick={() => setBurgerOpen(!burgerOpen)}>
            <span className={s.burgerLine} />
            <span className={s.burgerLine} />
            <span className={s.burgerLine} />
          </button>

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
                  <div className={s.menuDivider} />
                  <button className={s.menuItemLogout} onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
                    <span>Выйти</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {burgerOpen && (
          <>
            <div className={s.burgerOverlay} onClick={() => setBurgerOpen(false)} />
            <div className={s.burgerMenu}>
              {tabs.map(t => (
                <a
                  key={t.key}
                  className={tab === t.key ? s.burgerItemActive : s.burgerItem}
                  onClick={() => { setTab(t.key); setBurgerOpen(false); }}
                >
                  {t.label}
                </a>
              ))}
              <div className={s.burgerDivider} />
              <a className={s.burgerItem} onClick={() => { setBurgerOpen(false); navigate('/'); }}>
                Предпросмотр сайта ↗
              </a>
            </div>
          </>
        )}
      </header>

      {tab === 'courses' && (
        <main className={s.main}>
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>Здравствуйте, {displayName}</h1>
              <p className={s.pageSubtitle}>Управляйте своими курсами и отслеживайте результаты.</p>
            </div>
            <button className={s.newCourseBtn}>＋ Новый курс</button>
          </div>

          <div className={s.emptyState}>
            <div className={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18" /><path d="M4 4v10h16V4" /><path d="M12 14v4" /><path d="M9 21l3-3 3 3" /></svg>
            </div>
            <div className={s.emptyTitle}>У вас пока нет курсов</div>
            <p className={s.emptyText}>Создайте свой первый курс — загружайте уроки, устанавливайте цену и получайте до 70% с каждой продажи.</p>
            <button className={s.newCourseBtn} style={{ marginTop: 8 }}>＋ Создать первый курс</button>
          </div>
        </main>
      )}

      {tab === 'students' && (
        <main className={s.main}>
          <h1 className={s.pageTitle}>Студенты</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 24 }}>Прогресс по всем вашим курсам.</p>
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>
            </div>
            <div className={s.emptyTitle}>Раздел будет доступен позднее</div>
            <p className={s.emptyText}>Здесь появится информация о ваших студентах и их прогрессе по курсам.</p>
          </div>
        </main>
      )}

      {tab === 'income' && (
        <main className={s.main}>
          <h1 className={s.pageTitle}>Доходы и выплаты</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 24 }}>70% с каждой продажи — ваши.</p>
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <div className={s.emptyTitle}>Раздел будет доступен позднее</div>
            <p className={s.emptyText}>Здесь будет история выплат и статистика доходов по вашим курсам.</p>
          </div>
        </main>
      )}

      {tab === 'reviews' && (
        <main className={s.main}>
          <h1 className={s.pageTitle}>Отзывы и вопросы</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 24 }}>Отвечайте студентам, чтобы повысить рейтинг.</p>
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div className={s.emptyTitle}>Раздел будет доступен позднее</div>
            <p className={s.emptyText}>Здесь появятся отзывы и вопросы от ваших студентов.</p>
          </div>
        </main>
      )}
    </div>
  );
}
