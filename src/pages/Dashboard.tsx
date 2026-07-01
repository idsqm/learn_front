import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { useEnrollments, useUserStats, useFavorites, useCertificates, useRecommendedCourses } from '../features/courses/api/queries';
import SessionsTab from '../features/dashboard/components/SessionsTab';
import ProfileTab from '../features/dashboard/components/ProfileTab';
import CourseCard from '../shared/components/CourseCard';
import { fmtHours } from '../shared/utils/format';
import s from './Dashboard.module.css';

type Tab = 'learning' | 'favorites' | 'certificates' | 'settings';

function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  return `${h} ч`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('learning');

  const { data: enrollmentsData } = useEnrollments();
  const { data: statsData } = useUserStats();
  const { data: favoritesData } = useFavorites();
  const { data: certificatesData } = useCertificates();
  const { data: recommendedData } = useRecommendedCourses();

  const enrollments = enrollmentsData?.data ?? [];
  const favorites = favoritesData?.data ?? [];
  const certificates = certificatesData?.data ?? [];
  const recommended = recommendedData?.data ?? [];

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

  const stats = statsData
    ? [
        { v: String(statsData.courses_in_progress), l: 'Курса в процессе' },
        { v: formatStudyTime(statsData.total_study_time), l: 'Время обучения' },
        { v: String(statsData.certificates_count), l: 'Сертификата' },
        { v: `${statsData.study_streak_days} дней`, l: 'Серия обучения' },
      ]
    : [];

  return (
    <main className={s.main}>
      <div className={s.header}>
        <h1 className={s.headerTitle}>С возвращением, {displayName} 👋</h1>
        <p className={s.headerSubtitle}>Продолжайте с того места, где остановились.</p>
      </div>

      {stats.length > 0 && (
        <div className={`${s.statsGrid} lq-stats`}>
          {stats.map(st => (
            <div key={st.l} className={s.statCard}>
              <div className={s.statValue}>{st.v}</div>
              <div className={s.statLabel}>{st.l}</div>
            </div>
          ))}
        </div>
      )}

      <div className={`${s.tabsBar} lq-tabs`}>
        {tabs.map(t => (
          <span key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? s.tabActive : s.tab}>{t.label}</span>
        ))}
      </div>

      {tab === 'learning' && (
        <>
          {enrollments.length > 0 ? (
            <>
              <h2 className={s.sectionTitle}>Продолжить обучение</h2>
              <div className={s.enrolledList}>
                {enrollments.map(e => (
                  <div key={e.course.id} className={`${s.enrolledCard} lq-enroll`}>
                    <div className={s.enrolledThumb} style={{ backgroundImage: `linear-gradient(135deg, ${e.course.color_1}, ${e.course.color_2})` }}>
                      <svg width="16" height="18" viewBox="0 0 20 22"><path d="M2 2L18 11L2 20Z" fill="rgba(255,255,255,.92)" /></svg>
                    </div>
                    <div className={s.enrolledInfo}>
                      <div className={s.enrolledTitleRow}>
                        <span className={s.enrolledTitle}>{e.course.title}</span>
                        {e.completed && <span className={s.completedBadge}>Завершён ✓</span>}
                      </div>
                      <div className={s.enrolledMeta}>{e.course.author} · {e.last_lesson ?? `${fmtHours(e.course.hours)}`}</div>
                      <div className={s.progressRow}>
                        <div className={s.progressTrack}>
                          <div className={e.completed ? s.progressFillCompleted : s.progressFillActive} style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className={s.progressText}>{e.done_lessons}/{e.total_lessons} · {Math.round(e.progress)}%</span>
                      </div>
                    </div>
                    <button
                      className={`${e.completed ? s.enrollBtnCompleted : s.enrollBtn} lq-enroll-btn`}
                      onClick={() => navigate(`/course/${e.course.id}`)}
                    >
                      {e.completed ? 'Сертификат' : 'Продолжить'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={s.emptyState}>
              <div className={s.emptyTitle}>Вы пока не записаны на курсы</div>
              <p className={s.emptyText}>Найдите интересный курс в каталоге и начните обучение.</p>
              <button onClick={() => navigate('/catalog')} className={s.emptyBtn}>Открыть каталог →</button>
            </div>
          )}

          {recommended.length > 0 && (
            <>
              <div className={s.recommendHeader}>
                <h2 className={s.recommendTitle}>Рекомендуем вам</h2>
                <a onClick={() => navigate('/catalog')} className={s.catalogLink}>Весь каталог →</a>
              </div>
              <div className={`${s.recommendGrid} lq-grid-4`}>
                {recommended.map(c => <CourseCard key={c.id} course={c} compact />)}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'favorites' && (
        favorites.length > 0 ? (
          <div className={`${s.recommendGrid} lq-grid-4`} style={{ marginTop: 24 }}>
            {favorites.map(c => <CourseCard key={c.id} course={c} showLevel />)}
          </div>
        ) : (
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>Здесь пока пусто</div>
            <p className={s.emptyText}>Добавляйте курсы в избранное, чтобы вернуться к ним позже.</p>
            <button onClick={() => navigate('/catalog')} className={s.emptyBtn}>Открыть каталог →</button>
          </div>
        )
      )}

      {tab === 'certificates' && (
        certificates.length > 0 ? (
          <div className={s.enrolledList} style={{ marginTop: 24 }}>
            {certificates.map(cert => (
              <div key={cert.id} className={`${s.enrolledCard} lq-enroll`}>
                <div className={s.enrolledThumb} style={{ background: 'linear-gradient(135deg, #5d4ee6, #8b5cf6)' }}>
                  <span style={{ color: '#fff', fontSize: 20 }}>🎓</span>
                </div>
                <div className={s.enrolledInfo}>
                  <div className={s.enrolledTitleRow}>
                    <span className={s.enrolledTitle}>{cert.course_name}</span>
                  </div>
                  <div className={s.enrolledMeta}>
                    Выдан {new Date(cert.issued_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>Сертификаты появятся здесь</div>
            <p className={s.emptyTextNoMargin}>Завершите курс полностью, чтобы получить сертификат об окончании.</p>
          </div>
        )
      )}

      {tab === 'settings' && (
        <>
          <ProfileTab />
          <SessionsTab />
        </>
      )}
    </main>
  );
}
