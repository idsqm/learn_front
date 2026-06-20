import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses, dashStats, enrolledCourses } from '../data/mockData';
import { useAuthStore } from '../features/auth/store/authStore';
import SessionsTab from '../features/dashboard/components/SessionsTab';
import CourseCard from '../shared/components/CourseCard';
import s from './Dashboard.module.css';

type Tab = 'learning' | 'favorites' | 'certificates' | 'settings';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('learning');
  const recommended = courses.slice(2, 6);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'learning', label: 'Моё обучение' },
    { key: 'favorites', label: 'Избранное' },
    { key: 'certificates', label: 'Сертификаты' },
    { key: 'settings', label: 'Настройки' },
  ];

  if (!isAuthenticated) {
    return (
      <main className={s.mainUnauth}>
        <h1 className={s.unauthTitle}>Войдите в аккаунт</h1>
        <p className={s.unauthText}>Чтобы видеть свои курсы, войдите или зарегистрируйтесь.</p>
      </main>
    );
  }

  const displayName = user?.username || 'Пользователь';

  return (
    <main className={s.main}>
      <div className={s.header}>
        <h1 className={s.headerTitle}>С возвращением, {displayName} 👋</h1>
        <p className={s.headerSubtitle}>Продолжайте с того места, где остановились.</p>
      </div>

      <div className={`${s.statsGrid} lq-stats`}>
        {dashStats.map(st => (
          <div key={st.l} className={s.statCard}>
            <div className={s.statValue}>{st.v}</div>
            <div className={s.statLabel}>{st.l}</div>
          </div>
        ))}
      </div>

      <div className={`${s.tabsBar} lq-tabs`}>
        {tabs.map(t => (
          <span key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? s.tabActive : s.tab}>{t.label}</span>
        ))}
      </div>

      {tab === 'learning' && (
        <>
          <h2 className={s.sectionTitle}>Продолжить обучение</h2>
          <div className={s.enrolledList}>
            {enrolledCourses.map(e => (
              <div key={e.id + '-' + e.progress} className={`${s.enrolledCard} lq-enroll`}>
                <div className={s.enrolledThumb} style={{ backgroundImage: `linear-gradient(135deg, ${e.c1}, ${e.c2})` }}>
                  <svg width="16" height="18" viewBox="0 0 20 22"><path d="M2 2L18 11L2 20Z" fill="rgba(255,255,255,.92)" /></svg>
                </div>
                <div className={s.enrolledInfo}>
                  <div className={s.enrolledTitleRow}>
                    <span className={s.enrolledTitle}>{e.title}</span>
                    {e.completed && <span className={s.completedBadge}>Завершён ✓</span>}
                  </div>
                  <div className={s.enrolledMeta}>{e.author} · {e.last}</div>
                  <div className={s.progressRow}>
                    <div className={s.progressTrack}>
                      <div className={e.completed ? s.progressFillCompleted : s.progressFillActive} style={{ width: `${e.progress}%` }} />
                    </div>
                    <span className={s.progressText}>{e.done}/{e.total} · {e.progress}%</span>
                  </div>
                </div>
                <button className={`${e.completed ? s.enrollBtnCompleted : s.enrollBtn} lq-enroll-btn`} onClick={() => navigate(`/course/${e.id}`)}>{e.completed ? 'Сертификат' : 'Продолжить'}</button>
              </div>
            ))}
          </div>
          <div className={s.recommendHeader}>
            <h2 className={s.recommendTitle}>Рекомендуем вам</h2>
            <a onClick={() => navigate('/catalog')} className={s.catalogLink}>Весь каталог →</a>
          </div>
          <div className={`${s.recommendGrid} lq-grid-4`}>
            {recommended.map(c => <CourseCard key={c.id} course={c} compact />)}
          </div>
        </>
      )}

      {tab === 'favorites' && (
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>Здесь пока пусто</div>
          <p className={s.emptyText}>Добавляйте курсы в избранное, чтобы вернуться к ним позже.</p>
          <button onClick={() => navigate('/catalog')} className={s.emptyBtn}>Открыть каталог →</button>
        </div>
      )}

      {tab === 'certificates' && (
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>Сертификаты появятся здесь</div>
          <p className={s.emptyTextNoMargin}>Завершите курс полностью, чтобы получить сертификат об окончании.</p>
        </div>
      )}

      {tab === 'settings' && <SessionsTab />}
    </main>
  );
}
