import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { useStudioCourses, useStudioStats, useCreateCourse, useCreateModule, useCreateLesson, useUpdateLesson } from '../features/studio/api/queries';
import LogoIcon from '../shared/components/LogoIcon';
import LessonModal from '../shared/components/LessonModal';
import type { LessonPayload, LessonEditData } from '../shared/components/LessonModal';
import CourseEditor from './CourseEditor';
import type { EditorCourse, EditorLesson } from './CourseEditor';
import NewCourse from './NewCourse';
import s from './Studio.module.css';

type Tab = 'courses' | 'students' | 'income' | 'reviews';

export default function Studio() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, loading: authLoading, user, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('courses');
  const [menuOpen, setMenuOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);

  const isNewCourse = pathname === '/studio/courses/new';
  const courseIdMatch = pathname.match(/^\/studio\/courses\/([^/]+)$/);
  const editingCourseId = (!isNewCourse && courseIdMatch) ? courseIdMatch[1] : null;

  const [lessonModalModuleId, setLessonModalModuleId] = useState<string | null>(null);
  const [lessonModalCourseId, setLessonModalCourseId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonEditData | null>(null);
  const [pendingLessons, setPendingLessons] = useState<Map<string, EditorLesson[]>>(new Map());

  const { data: coursesData, isLoading: coursesLoading } = useStudioCourses();
  const { data: statsData } = useStudioStats();
  const createCourseMut = useCreateCourse();
  const createModuleMut = useCreateModule();
  const createLessonMut = useCreateLesson();
  const updateLessonMut = useUpdateLesson();

  const courses = coursesData?.data ?? [];

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'АК';
  const displayName = user?.username || 'Автор';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/');
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !isAuthenticated) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'courses', label: 'Курсы' },
    { key: 'students', label: 'Студенты' },
    { key: 'income', label: 'Доходы' },
    { key: 'reviews', label: 'Отзывы' },
  ];

  const handleOpenEditor = (courseId: string) => {
    navigate(`/studio/courses/${courseId}`);
  };

  const handleCreate = async (course: EditorCourse) => {
    try {
      const created = await createCourseMut.mutateAsync({
        title: course.title,
        subtitle: course.subtitle,
        category_id: course.category_id,
        level: course.level,
        description: '',
        price: course.price,
        old_price: course.old_price,
        is_free: course.is_free,
      });
      const createdCourseId = String(created.id);

      for (const mod of course.modules) {
        const createdMod = await createModuleMut.mutateAsync({ courseId: createdCourseId, title: mod.title });
        for (const lesson of mod.lessons) {
          await createLessonMut.mutateAsync({
            courseId: createdCourseId,
            moduleId: createdMod.id,
            payload: { name: lesson.name, type: lesson.type, is_free: lesson.is_free },
          });
        }
      }
    } catch {
      // API not available yet — keep local
    }
    setPendingLessons(new Map());
    navigate('/studio');
  };

  const handleOpenLessonModal = (moduleId: string) => {
    setEditingLesson(null);
    setLessonModalModuleId(moduleId);
    setLessonModalCourseId(editingCourseId);
  };

  const handleEditLessonModal = (lesson: LessonEditData) => {
    setEditingLesson(lesson);
    setLessonModalModuleId('__edit__');
    setLessonModalCourseId(editingCourseId);
  };

  const handleLessonSubmit = async (lesson: LessonPayload) => {
    if (editingLesson && lessonModalCourseId) {
      try {
        await updateLessonMut.mutateAsync({
          courseId: lessonModalCourseId,
          lessonId: editingLesson.id,
          payload: { name: lesson.name, type: lesson.type, is_free: lesson.is_free },
        });
      } catch { /* */ }
    } else if (lessonModalModuleId) {
      const newLesson: EditorLesson = {
        id: 'ls_' + Date.now(),
        name: lesson.name,
        type: lesson.type,
        duration: '—',
        is_free: lesson.is_free ?? false,
        status: 'draft',
      };

      if (isNewCourse) {
        setPendingLessons(prev => {
          const next = new Map(prev);
          const arr = next.get(lessonModalModuleId) ?? [];
          next.set(lessonModalModuleId, [...arr, newLesson]);
          return next;
        });
      } else if (editingCourseId && lessonModalCourseId) {
        try {
          await createLessonMut.mutateAsync({
            courseId: lessonModalCourseId,
            moduleId: lessonModalModuleId,
            payload: { name: lesson.name, type: lesson.type, is_free: lesson.is_free },
          });
        } catch { /* */ }
      }
    }

    setLessonModalModuleId(null);
    setLessonModalCourseId(null);
    setEditingLesson(null);
  };

  const closeLessonModal = () => {
    setLessonModalModuleId(null);
    setLessonModalCourseId(null);
    setEditingLesson(null);
  };

  const handleBackToList = () => {
    setPendingLessons(new Map());
    navigate('/studio');
  };

  const fmtCurrency = (v: number) => '₽' + v.toLocaleString('ru-RU');

  const renderContent = () => {
    if (tab !== 'courses') {
      const sections: Record<string, { title: string; sub: string; icon: React.ReactNode }> = {
        students: {
          title: 'Студенты',
          sub: 'Прогресс по всем вашим курсам.',
          icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>,
        },
        income: {
          title: 'Доходы и выплаты',
          sub: '70% с каждой продажи — ваши.',
          icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
        },
        reviews: {
          title: 'Отзывы и вопросы',
          sub: 'Отвечайте студентам, чтобы повысить рейтинг.',
          icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
        },
      };
      const sec = sections[tab];
      return (
        <main className={s.main}>
          <h1 className={s.pageTitle}>{sec.title}</h1>
          <p className={s.pageSubtitle} style={{ marginBottom: 24 }}>{sec.sub}</p>
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>{sec.icon}</div>
            <div className={s.emptyTitle}>Раздел будет доступен позднее</div>
            <p className={s.emptyText}>Мы работаем над этим разделом.</p>
          </div>
        </main>
      );
    }

    if (isNewCourse) {
      return (
        <NewCourse
          onBack={handleBackToList}
          onCreate={handleCreate}
          onOpenLessonModal={setLessonModalModuleId}
          pendingLessons={pendingLessons}
        />
      );
    }

    if (editingCourseId) {
      return (
        <CourseEditor
          courseId={editingCourseId}
          onBack={handleBackToList}
          onOpenLessonModal={handleOpenLessonModal}
          onEditLesson={handleEditLessonModal}
        />
      );
    }

    return (
      <main className={s.main}>
        <div className={s.pageHeader}>
          <div>
            <h1 className={s.pageTitle}>Здравствуйте, {displayName}</h1>
            <p className={s.pageSubtitle}>Управляйте своими курсами и отслеживайте результаты.</p>
          </div>
          <button className={s.newCourseBtn} onClick={() => navigate('/studio/courses/new')}>＋ Новый курс</button>
        </div>

        {statsData && (
          <div className={s.statsGrid}>
            {[
              { l: 'Выручка за 30 дн', v: fmtCurrency(statsData.revenue_30d) },
              { l: 'Новых студентов', v: String(statsData.new_students_30d) },
              { l: 'Всего студентов', v: String(statsData.total_students) },
              { l: 'Средний рейтинг', v: statsData.avg_rating.toFixed(2) },
            ].map(st => (
              <div key={st.l} className={s.statCard}>
                <div className={s.statLabel}>{st.l}</div>
                <div className={s.statValue}>{st.v}</div>
              </div>
            ))}
          </div>
        )}

        {coursesLoading ? (
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>Загрузка...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b4b3bf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18" /><path d="M4 4v10h16V4" /><path d="M12 14v4" /><path d="M9 21l3-3 3 3" /></svg>
            </div>
            <div className={s.emptyTitle}>У вас пока нет курсов</div>
            <p className={s.emptyText}>Создайте свой первый курс — загружайте уроки, устанавливайте цену и получайте до 70% с каждой продажи.</p>
            <button className={s.newCourseBtn} style={{ marginTop: 8 }} onClick={() => navigate('/studio/courses/new')}>＋ Создать первый курс</button>
          </div>
        ) : (
          <>
            <div className={s.coursesHeader}>
              <h2 className={s.coursesTitle}>Мои курсы</h2>
              <span className={s.coursesCount}>{courses.length} {courses.length === 1 ? 'курс' : 'курсов'}</span>
            </div>
            <div className={s.coursesList}>
              {courses.map((c, i) => (
                <div
                  key={c.id}
                  className={i === 0 ? s.courseRow : s.courseRowBorder}
                  onClick={() => handleOpenEditor(String(c.id))}
                >
                  <div className={s.courseThumb} style={{ backgroundImage: 'linear-gradient(135deg, #6a5cf0, #9183f7)' }} />
                  <div className={s.courseInfo}>
                    <div className={s.courseTitle}>
                      <span className={s.courseName}>{c.title || 'Без названия'}</span>
                      <span className={c.status === 'published' ? s.statusPublished : s.statusDraft}>
                        {c.status === 'published' ? 'Опубликован' : 'Черновик'}
                      </span>
                    </div>
                    <div className={s.courseMeta}>
                      <span>{c.category || '—'}</span>
                      <span>·</span>
                      <span>{(c.modules ?? []).reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0)} уроков</span>
                      <span>·</span>
                      <span>{c.students_count} студентов</span>
                    </div>
                  </div>
                  <div className={s.courseAction}>Открыть →</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    );
  };

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
                onClick={() => { setTab(t.key); if (t.key === 'courses') navigate('/studio'); }}
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
                  onClick={() => { setTab(t.key); setBurgerOpen(false); if (t.key === 'courses') navigate('/studio'); }}
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

      {renderContent()}

      {lessonModalModuleId && (
        <LessonModal
          onClose={closeLessonModal}
          onAdd={handleLessonSubmit}
          editData={editingLesson ?? undefined}
        />
      )}
    </div>
  );
}
