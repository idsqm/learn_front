import { useState } from 'react';
import s from './CourseEditor.module.css';

/* ── Types ── */
export interface EditorLesson {
  id: string;
  name: string;
  type: 'video' | 'quiz' | 'text';
  duration: string;
  is_free: boolean;
  status: 'ready' | 'draft';
}

export interface EditorModule {
  id: string;
  title: string;
  lessons: EditorLesson[];
}

export interface EditorCourse {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  price: number;
  old_price: number | null;
  is_free: boolean;
  status: 'published' | 'draft';
  modules: EditorModule[];
}

interface Props {
  course: EditorCourse;
  onChange: (course: EditorCourse) => void;
  onBack: () => void;
  onOpenLessonModal: (moduleId: string) => void;
}

type EditorTab = 'program' | 'settings';

const TYPE_ICONS: Record<EditorLesson['type'], { label: string; cls: string }> = {
  video: { label: '▶', cls: 'typeVideo' },
  quiz:  { label: '?', cls: 'typeQuiz' },
  text:  { label: '≡', cls: 'typeText' },
};

const TYPE_LABELS: Record<EditorLesson['type'], string> = {
  video: 'Видео',
  quiz:  'Тест',
  text:  'Текст',
};

const CATEGORIES = [
  'Разработка',
  'Дизайн',
  'Маркетинг',
  'Аналитика',
  'Бизнес',
  'Личное развитие',
];

const LEVELS = [
  'Начинающий',
  'Средний',
  'Продвинутый',
];

export default function CourseEditor({ course, onChange, onBack, onOpenLessonModal }: Props) {
  const [tab, setTab] = useState<EditorTab>('program');
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(course.modules.map(m => m.id))
  );

  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateField = <K extends keyof EditorCourse>(key: K, value: EditorCourse[K]) => {
    onChange({ ...course, [key]: value });
  };

  const addModule = () => {
    const id = 'mod_' + Date.now();
    const newModule: EditorModule = {
      id,
      title: 'Новый модуль',
      lessons: [],
    };
    onChange({ ...course, modules: [...course.modules, newModule] });
    setOpenModules(prev => new Set(prev).add(id));
  };

  return (
    <div className={s.wrap}>
      {/* Breadcrumb */}
      <div className={s.breadcrumb}>
        <span className={s.breadcrumbLink} onClick={onBack}>Курсы</span>
        <span className={s.breadcrumbSep}>/</span>
        <span className={s.breadcrumbCurrent}>{course.title}</span>
      </div>

      {/* Head */}
      <div className={s.head}>
        <div>
          <div className={s.titleRow}>
            <h1 className={s.title}>{course.title}</h1>
            <span className={course.status === 'published' ? s.statusPublished : s.statusDraft}>
              {course.status === 'published' ? 'Опубликован' : 'Черновик'}
            </span>
          </div>
          <div className={s.meta}>
            {totalModules} {pluralize(totalModules, 'модуль', 'модуля', 'модулей')} &middot;{' '}
            {totalLessons} {pluralize(totalLessons, 'урок', 'урока', 'уроков')}
          </div>
        </div>
        <div className={s.actions}>
          <button className={s.saveBtn}>Сохранить</button>
        </div>
      </div>

      {/* Tabs */}
      <div className={s.tabs}>
        <button className={tab === 'program' ? s.tabActive : s.tab} onClick={() => setTab('program')}>
          Программа
        </button>
        <button className={tab === 'settings' ? s.tabActive : s.tab} onClick={() => setTab('settings')}>
          Настройки
        </button>
      </div>

      {/* Program tab */}
      {tab === 'program' && (
        <>
          <div className={s.toolbar}>
            <button className={s.toolbarBtnPrimary} onClick={addModule}>+ Модуль</button>
            <button className={s.toolbarBtn} onClick={() => {
              if (course.modules.length > 0) {
                onOpenLessonModal(course.modules[0].id);
              }
            }}>+ Урок</button>
          </div>

          {course.modules.map(mod => {
            const isOpen = openModules.has(mod.id);
            return (
              <div className={s.moduleCard} key={mod.id}>
                <div className={s.moduleHeader} onClick={() => toggleModule(mod.id)}>
                  <span className={s.dragHandle}>&#x2817;</span>
                  <span className={isOpen ? s.chevronOpen : s.chevron}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                  <span className={s.moduleTitle}>{mod.title}</span>
                  <span className={s.moduleLessons}>
                    {mod.lessons.length} {pluralize(mod.lessons.length, 'урок', 'урока', 'уроков')}
                  </span>
                  <span
                    className={s.addLessonLink}
                    onClick={e => { e.stopPropagation(); onOpenLessonModal(mod.id); }}
                  >
                    + урок
                  </span>
                </div>

                {isOpen && mod.lessons.length > 0 && (
                  <div className={s.lessonList}>
                    {mod.lessons.map(lesson => {
                      const icon = TYPE_ICONS[lesson.type];
                      return (
                        <div className={s.lessonRow} key={lesson.id}>
                          <span className={s.lessonDrag}>&#x2817;</span>
                          <span className={s[icon.cls as keyof typeof s] as string}>
                            {icon.label}
                          </span>
                          <span className={s.lessonName}>{lesson.name}</span>
                          {lesson.is_free && <span className={s.freeBadge}>Free</span>}
                          <span className={s.lessonMeta}>
                            {TYPE_LABELS[lesson.type]} &middot; {lesson.duration}
                          </span>
                          <span className={lesson.status === 'ready' ? s.lessonStatusReady : s.lessonStatusDraft}>
                            {lesson.status === 'ready' ? 'Готов' : 'Черновик'}
                          </span>
                          <button className={s.moreBtn}>&ctdot;</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isOpen && (
                  <div className={s.addLessonFooter}>
                    <span
                      className={s.addLessonFooterLink}
                      onClick={() => onOpenLessonModal(mod.id)}
                    >
                      &#xFF0B; Добавить урок
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className={s.settingsGrid}>
          <div>
            {/* Main info card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Основное</h3>

              <div className={s.fieldGroup}>
                <label className={s.label}>Название курса</label>
                <input
                  className={s.input}
                  value={course.title}
                  onChange={e => updateField('title', e.target.value)}
                  placeholder="Введите название"
                />
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Подзаголовок</label>
                <input
                  className={s.input}
                  value={course.subtitle}
                  onChange={e => updateField('subtitle', e.target.value)}
                  placeholder="Краткое описание курса"
                />
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Категория</label>
                <select
                  className={s.select}
                  value={course.category}
                  onChange={e => updateField('category', e.target.value)}
                >
                  <option value="">Выберите категорию</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Уровень</label>
                <select
                  className={s.select}
                  value={course.level}
                  onChange={e => updateField('level', e.target.value)}
                >
                  <option value="">Выберите уровень</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Price card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Цена</h3>

              <div className={s.priceRow}>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Цена (&#8381;)</label>
                  <input
                    className={s.input}
                    type="number"
                    value={course.is_free ? '' : course.price}
                    onChange={e => updateField('price', Number(e.target.value))}
                    placeholder="0"
                    disabled={course.is_free}
                  />
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Старая цена (&#8381;)</label>
                  <input
                    className={s.input}
                    type="number"
                    value={course.is_free ? '' : (course.old_price ?? '')}
                    onChange={e => updateField('old_price', e.target.value ? Number(e.target.value) : null)}
                    placeholder="0"
                    disabled={course.is_free}
                  />
                </div>
              </div>

              <div className={s.checkboxRow} onClick={() => updateField('is_free', !course.is_free)}>
                <span className={course.is_free ? s.checkboxChecked : s.checkboxUnchecked}>
                  {course.is_free ? '✓' : ''}
                </span>
                <span className={s.checkboxLabel}>Бесплатный курс</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Cover card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Обложка курса</h3>
              <div className={s.coverPlaceholder} />
              <button className={s.uploadBtn}>Загрузить обложку</button>
            </div>

            {/* Publish card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Публикация</h3>
              <div className={s.publishStatus}>
                <span className={course.status === 'published' ? s.publishDotGreen : s.publishDotGray} />
                {course.status === 'published' ? 'Курс опубликован' : 'Курс в черновике'}
              </div>
              <div className={s.publishActions}>
                <button className={s.publishSaveBtn}>Сохранить изменения</button>
                {course.status === 'published' && (
                  <button
                    className={s.unpublishBtn}
                    onClick={() => updateField('status', 'draft')}
                  >
                    Снять с публикации
                  </button>
                )}
                {course.status === 'draft' && (
                  <button
                    className={s.saveBtn}
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => updateField('status', 'published')}
                  >
                    Опубликовать
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}
