import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import LogoIcon from '../shared/components/LogoIcon';
import s from './Studio.module.css';

type Tab = 'courses' | 'students' | 'income' | 'reviews';

const mockStats = [
  { l: 'Выручка за 30 дн', v: '₽89 400', d: '+12% к прошлому мес.' },
  { l: 'Новых студентов', v: '284', d: '+18% к прошлому мес.' },
  { l: 'Всего студентов', v: '14 360', d: '+2% за неделю' },
  { l: 'Средний рейтинг', v: '4.87', d: '+0.02 за месяц' },
];

const mockCourses = [
  { title: 'Цифровая фотография с нуля', cat: 'Фотография', lessons: 64, students: 8940, rev: '₽42 600', status: 'published' as const, c1: '#6a5cf0', c2: '#9183f7' },
  { title: 'Мобильная съёмка видео', cat: 'Видео', lessons: 52, students: 4020, rev: '₽28 400', status: 'published' as const, c1: '#5d4ee6', c2: '#8a7af0' },
  { title: 'Lightroom: обработка для Instagram', cat: 'Фотография', lessons: 24, students: 1400, rev: '₽18 400', status: 'published' as const, c1: '#e0568f', c2: '#f291b7' },
  { title: 'Предметная фотография', cat: 'Фотография', lessons: 8, students: 0, rev: '—', status: 'draft' as const, c1: '#c2772e', c2: '#e0a35c' },
];

export default function Studio() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('courses');

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
          <div className={s.avatar}>{initials}</div>
        </div>
      </header>

      {tab === 'courses' && (
        <main className={s.main}>
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>Здравствуйте, {displayName}</h1>
              <p className={s.pageSubtitle}>Вот как идут дела у ваших курсов сегодня.</p>
            </div>
            <button className={s.newCourseBtn}>＋ Новый курс</button>
          </div>

          <div className={s.statsGrid}>
            {mockStats.map(st => (
              <div key={st.l} className={s.statCard}>
                <div className={s.statLabel}>{st.l}</div>
                <div className={s.statValue}>{st.v}</div>
                <div className={s.statDelta}>{st.d}</div>
              </div>
            ))}
          </div>

          <div className={s.coursesHeader}>
            <h2 className={s.coursesTitle}>Мои курсы</h2>
            <span className={s.coursesCount}>{mockCourses.length} курсов</span>
          </div>

          <div className={s.coursesList}>
            {mockCourses.map((c, i) => (
              <div key={c.title} className={i === 0 ? s.courseRow : s.courseRowBorder}>
                <div className={s.courseThumb} style={{ backgroundImage: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }} />
                <div className={s.courseInfo}>
                  <div className={s.courseTitle}>
                    <span className={s.courseName}>{c.title}</span>
                    <span className={c.status === 'published' ? s.statusPublished : s.statusDraft}>
                      {c.status === 'published' ? 'Опубликован' : 'Черновик'}
                    </span>
                  </div>
                  <div className={s.courseMeta}>
                    <span>{c.cat}</span><span>·</span><span>{c.lessons} уроков</span><span>·</span><span>{c.students} студентов</span>
                  </div>
                </div>
                <div className={s.courseRevenue}>
                  <div className={s.courseRevenueValue}>{c.rev}</div>
                  <div className={s.courseRevenuePeriod}>за 30 дней</div>
                </div>
                <div className={s.courseAction}>Открыть →</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {tab === 'students' && (
        <main className={s.main}>
          <h1 className={s.pageTitle}>Студенты</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 24 }}>Прогресс по всем вашим курсам.</p>
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>Данные загружаются</div>
            <p className={s.emptyText}>Информация о студентах будет доступна после подключения к бекенду.</p>
          </div>
        </main>
      )}

      {tab === 'income' && (
        <main className={s.main}>
          <h1 className={s.pageTitle}>Доходы и выплаты</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 24 }}>70% с каждой продажи — ваши.</p>
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>Данные загружаются</div>
            <p className={s.emptyText}>Информация о доходах будет доступна после подключения к бекенду.</p>
          </div>
        </main>
      )}

      {tab === 'reviews' && (
        <main className={s.main}>
          <h1 className={s.pageTitle}>Отзывы и вопросы</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 24 }}>Отвечайте студентам, чтобы повысить рейтинг.</p>
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>Данные загружаются</div>
            <p className={s.emptyText}>Отзывы будут доступны после подключения к бекенду.</p>
          </div>
        </main>
      )}
    </div>
  );
}
