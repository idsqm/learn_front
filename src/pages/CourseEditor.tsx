import { useState, useEffect } from 'react';
import {
  useStudioCourse,
  useCategories,
  usePublishCourse,
  useUnpublishCourse,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useDeleteLesson,
} from '../features/studio/api/queries';
import type { LessonEditData } from '../shared/components/LessonModal';
import s from './CourseEditor.module.css';

/* ── Types (exported for NewCourse / Studio) ── */
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
  category_id: number;
  level: string;
  price: number;
  old_price: number | null;
  is_free: boolean;
  status: 'published' | 'draft';
  modules: EditorModule[];
}

interface Props {
  courseId: string;
  onBack: () => void;
  onOpenLessonModal: (moduleId: string) => void;
  onEditLesson: (lesson: LessonEditData) => void;
}

type EditorTab = 'program' | 'settings';

interface FormState {
  title: string;
  subtitle: string;
  category_id: number;
  level: string;
  description: string;
  price: number;
  old_price: number | null;
  is_free: boolean;
}

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

const LEVELS = [
  'Начинающий',
  'Средний',
  'Продвинутый',
];

export default function CourseEditor({ courseId, onBack, onOpenLessonModal, onEditLesson }: Props) {
  const { data: course } = useStudioCourse(courseId);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  const publishMut = usePublishCourse();
  const unpublishMut = useUnpublishCourse();
  const createModuleMut = useCreateModule();
  const updateModuleMut = useUpdateModule();
  const deleteModuleMut = useDeleteModule();
  const deleteLessonMut = useDeleteLesson();

  const [tab, setTab] = useState<EditorTab>('program');
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  useEffect(() => {
    if (course && !form) {
      setForm({
        title: course.title,
        subtitle: course.subtitle ?? '',
        category_id: course.category_id ?? 0,
        level: course.level ?? '',
        description: course.description ?? '',
        price: course.price,
        old_price: course.old_price,
        is_free: course.is_free ?? false,
      });
      setOpenModules(new Set((course.modules ?? []).map((m, i) => m.id ?? `mod_${i}`)));
    }
  }, [course, form]);

  if (!course) {
    return (
      <div className={s.wrap}>
        <p style={{ color: '#8e8d99' }}>Загрузка курса...</p>
      </div>
    );
  }

  const modules = course.modules ?? [];
  const totalModules = modules.length;
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePublish = async () => {
    await publishMut.mutateAsync(courseId);
  };

  const handleUnpublish = async () => {
    await unpublishMut.mutateAsync(courseId);
  };

  const handleAddModule = async () => {
    const created = await createModuleMut.mutateAsync({ courseId, title: 'Новый модуль' });
    setOpenModules(prev => new Set(prev).add(created.id));
  };

  const handleDeleteModule = async (moduleId: string) => {
    await deleteModuleMut.mutateAsync({ courseId, moduleId });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await deleteLessonMut.mutateAsync({ courseId, lessonId });
  };

  const startEditModule = (moduleId: string, title: string) => {
    setEditingModuleId(moduleId);
    setEditingModuleTitle(title);
  };

  const saveModuleTitle = async () => {
    if (!editingModuleId || !editingModuleTitle.trim()) {
      setEditingModuleId(null);
      return;
    }
    await updateModuleMut.mutateAsync({ courseId, moduleId: editingModuleId, title: editingModuleTitle.trim() });
    setEditingModuleId(null);
  };

  const displayTitle = form?.title || course.title || 'Без названия';

  return (
    <div className={s.wrap}>
      {/* Breadcrumb */}
      <div className={s.breadcrumb}>
        <span className={s.breadcrumbLink} onClick={onBack}>Курсы</span>
        <span className={s.breadcrumbSep}>/</span>
        <span className={s.breadcrumbCurrent}>{displayTitle}</span>
      </div>

      {/* Head */}
      <div className={s.head}>
        <div>
          <div className={s.titleRow}>
            <h1 className={s.title}>{displayTitle}</h1>
            <span className={course.status === 'published' ? s.statusPublished : s.statusDraft}>
              {course.status === 'published' ? 'Опубликован' : 'Черновик'}
            </span>
          </div>
          <div className={s.meta}>
            {totalModules} {pluralize(totalModules, 'модуль', 'модуля', 'модулей')} &middot;{' '}
            {totalLessons} {pluralize(totalLessons, 'урок', 'урока', 'уроков')}
          </div>
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
            <button className={s.toolbarBtnPrimary} onClick={handleAddModule}>+ Модуль</button>
          </div>

          {modules.map((mod, mi) => {
            const modKey = mod.id ?? `mod_${mi}`;
            const isOpen = openModules.has(modKey);
            const isEditingThis = editingModuleId === modKey;
            const lessons = mod.lessons ?? [];
            return (
              <div className={s.moduleCard} key={modKey}>
                <div className={s.moduleHeader} onClick={() => toggleModule(modKey)}>
                  <span className={s.dragHandle}>&#x2817;</span>
                  <span className={isOpen ? s.chevronOpen : s.chevron}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                  {isEditingThis ? (
                    <input
                      className={s.moduleTitleInput}
                      value={editingModuleTitle}
                      onChange={e => setEditingModuleTitle(e.target.value)}
                      onBlur={saveModuleTitle}
                      onKeyDown={e => { if (e.key === 'Enter') saveModuleTitle(); if (e.key === 'Escape') setEditingModuleId(null); }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className={s.moduleTitle}>{mod.title}</span>
                  )}
                  <span className={s.moduleLessons}>
                    {lessons.length} {pluralize(lessons.length, 'урок', 'урока', 'уроков')}
                  </span>
                  {mod.id && !isEditingThis && (
                    <button
                      className={s.editBtn}
                      onClick={e => { e.stopPropagation(); startEditModule(mod.id!, mod.title); }}
                      title="Редактировать модуль"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  )}
                  {mod.id && (
                    <button
                      className={s.moreBtn}
                      onClick={e => { e.stopPropagation(); handleDeleteModule(mod.id!); }}
                      title="Удалить модуль"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {isOpen && lessons.length > 0 && (
                  <div className={s.lessonList}>
                    {lessons.map(lesson => {
                      const lessonType = lesson.type ?? 'video';
                      const icon = TYPE_ICONS[lessonType];
                      const lessonId = String(lesson.id);
                      return (
                        <div className={s.lessonRow} key={lessonId}>
                          <span className={s.lessonDrag}>&#x2817;</span>
                          <span className={s[icon.cls as keyof typeof s] as string}>
                            {icon.label}
                          </span>
                          <span className={s.lessonName}>{lesson.name}</span>
                          {lesson.is_free && <span className={s.freeBadge}>Free</span>}
                          <span className={s.lessonMeta}>
                            {TYPE_LABELS[lessonType]} &middot; {lesson.duration}
                          </span>
                          <span className={lesson.status === 'ready' ? s.lessonStatusReady : s.lessonStatusDraft}>
                            {lesson.status === 'ready' ? 'Готов' : 'Черновик'}
                          </span>
                          <button
                            className={s.editBtn}
                            onClick={() => onEditLesson({
                              id: lessonId,
                              name: lesson.name,
                              type: lessonType,
                              is_free: lesson.is_free,
                            })}
                            title="Редактировать урок"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </button>
                          <button
                            className={s.moreBtn}
                            onClick={() => handleDeleteLesson(lessonId)}
                            title="Удалить урок"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isOpen && mod.id && (
                  <div className={s.addLessonFooter}>
                    <span
                      className={s.addLessonFooterLink}
                      onClick={() => onOpenLessonModal(mod.id!)}
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
      {tab === 'settings' && form && (
        <div className={s.settingsGrid}>
          <div>
            {/* Main info card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Основное</h3>

              <div className={s.fieldGroup}>
                <label className={s.label}>Название курса</label>
                <input
                  className={s.input}
                  value={form.title}
                  onChange={e => updateForm('title', e.target.value)}
                  placeholder="Введите название"
                />
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Подзаголовок</label>
                <input
                  className={s.input}
                  value={form.subtitle}
                  onChange={e => updateForm('subtitle', e.target.value)}
                  placeholder="Краткое описание курса"
                />
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Описание</label>
                <textarea
                  className={s.textarea}
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Подробное описание курса..."
                />
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Категория</label>
                <select
                  className={s.select}
                  value={form.category_id || ''}
                  onChange={e => updateForm('category_id', Number(e.target.value))}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Уровень</label>
                <select
                  className={s.select}
                  value={form.level}
                  onChange={e => updateForm('level', e.target.value)}
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
                    value={form.is_free ? '' : form.price}
                    onChange={e => updateForm('price', Number(e.target.value))}
                    placeholder="0"
                    disabled={form.is_free}
                  />
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Старая цена (&#8381;)</label>
                  <input
                    className={s.input}
                    type="number"
                    value={form.is_free ? '' : (form.old_price ?? '')}
                    onChange={e => updateForm('old_price', e.target.value ? Number(e.target.value) : null)}
                    placeholder="0"
                    disabled={form.is_free}
                  />
                </div>
              </div>

              <div className={s.checkboxRow} onClick={() => updateForm('is_free', !form.is_free)}>
                <span className={form.is_free ? s.checkboxChecked : s.checkboxUnchecked}>
                  {form.is_free ? '✓' : ''}
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
                {course.status === 'published' && (
                  <button className={s.unpublishBtn} onClick={handleUnpublish}>
                    Снять с публикации
                  </button>
                )}
                {course.status === 'draft' && (
                  <button
                    className={s.saveBtn}
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handlePublish}
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
