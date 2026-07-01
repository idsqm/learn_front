import { useState, useEffect, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import {
  useStudioCourse,
  useCategories,
  usePublishCourse,
  useUnpublishCourse,
  useUpdateCourse,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useUpdateLesson,
  useDeleteLesson,
} from '../features/studio/api/queries';
import type { LessonEditData, QuizQuestion } from '../shared/components/LessonModal';
import type { StudioModule, StudioLesson } from '../features/studio/types';
import { uploadFile } from '../shared/api/filesApi';
import s from './CourseEditor.module.css';

/* ── Types (exported for NewCourse / Studio) ── */
export interface EditorLesson {
  id: string;
  name: string;
  type: 'video' | 'quiz' | 'text' | 'assignment';
  duration: string;
  is_free: boolean;
  status: 'ready' | 'draft';
  textContent?: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
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
  preview_url: string | null;
  learn_items: string[];
  includes: string[];
}

const TYPE_ICONS: Record<EditorLesson['type'], { label: string; cls: string }> = {
  video: { label: '▶', cls: 'typeVideo' },
  quiz:  { label: '?', cls: 'typeQuiz' },
  text:  { label: '≡', cls: 'typeText' },
  assignment: { label: '✎', cls: 'typeAssignment' },
};

const TYPE_LABELS: Record<EditorLesson['type'], string> = {
  video: 'Видео',
  quiz:  'Тест',
  text:  'Текст',
  assignment: 'Задание',
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
  const updateCourseMut = useUpdateCourse();
  const createModuleMut = useCreateModule();
  const updateModuleMut = useUpdateModule();
  const deleteModuleMut = useDeleteModule();
  const updateLessonMut = useUpdateLesson();
  const deleteLessonMut = useDeleteLesson();

  const [tab, setTab] = useState<EditorTab>('program');
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [localModules, setLocalModules] = useState<StudioModule[] | null>(null);
  const [draggedModuleIdx, setDraggedModuleIdx] = useState<number | null>(null);
  const [dragOverModuleIdx, setDragOverModuleIdx] = useState<number | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<{ modIdx: number; lessonIdx: number } | null>(null);
  const [dragOverLesson, setDragOverLesson] = useState<{ modIdx: number; lessonIdx: number } | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
        preview_url: course.preview_url ?? null,
        learn_items: course.learn_items ?? [],
        includes: course.includes ?? [],
      });
      setOpenModules(new Set((course.modules ?? []).map((m, i) => m.id ?? `mod_${i}`)));
    }
  }, [course, form]);

  // Re-sync the locally reorderable copy whenever fresh server data arrives
  // (initial load, or after a drag-and-drop reorder has been persisted).
  useEffect(() => {
    setLocalModules(course?.modules ?? null);
  }, [course]);

  if (!course) {
    return (
      <div className={s.wrap}>
        <p style={{ color: '#8e8d99' }}>Загрузка курса...</p>
      </div>
    );
  }

  const modules = localModules ?? course.modules ?? [];
  const totalModules = modules.length;
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const addListItem = (key: 'learn_items' | 'includes') => {
    setForm(prev => prev ? { ...prev, [key]: [...prev[key], ''] } : prev);
  };

  const updateListItem = (key: 'learn_items' | 'includes', idx: number, value: string) => {
    setForm(prev => prev ? { ...prev, [key]: prev[key].map((v, i) => i === idx ? value : v) } : prev);
  };

  const removeListItem = (key: 'learn_items' | 'includes', idx: number) => {
    setForm(prev => prev ? { ...prev, [key]: prev[key].filter((_, i) => i !== idx) } : prev);
  };

  const handleSaveSettings = async () => {
    if (!form) return;
    setSaveState('saving');
    try {
      await updateCourseMut.mutateAsync({
        id: courseId,
        payload: {
          title: form.title,
          subtitle: form.subtitle,
          category_id: form.category_id,
          level: form.level,
          description: form.description,
          price: form.price,
          old_price: form.old_price,
          is_free: form.is_free,
          learn_items: form.learn_items.filter(v => v.trim()),
          includes: form.includes.filter(v => v.trim()),
        },
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('idle');
    }
  };

  const handleCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingCover(true);
    try {
      const { downloadUrl } = await uploadFile(file, 'image');
      updateForm('preview_url', downloadUrl);
      await updateCourseMut.mutateAsync({ id: courseId, payload: { preview_url: downloadUrl } });
    } finally {
      setUploadingCover(false);
    }
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
    const created = await createModuleMut.mutateAsync({ courseId, title: 'Новый модуль', sort_order: modules.length });
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
    await updateModuleMut.mutateAsync({ courseId, moduleId: editingModuleId, payload: { title: editingModuleTitle.trim() } });
    setEditingModuleId(null);
  };

  /* ── Drag & drop reordering ── */

  const persistModuleOrder = async (ordered: StudioModule[]) => {
    try {
      await Promise.all(
        ordered.map((m, i) =>
          m.id ? updateModuleMut.mutateAsync({ courseId, moduleId: m.id, payload: { sort_order: i } }) : Promise.resolve()
        )
      );
    } catch { /* */ }
  };

  const handleModuleDragStart = (idx: number) => () => {
    setDraggedModuleIdx(idx);
  };

  const handleModuleDragOver = (idx: number) => (e: DragEvent) => {
    e.preventDefault();
    if (draggedModuleIdx === null || draggedModuleIdx === idx) return;
    setDragOverModuleIdx(idx);
  };

  const handleModuleDrop = (idx: number) => async (e: DragEvent) => {
    e.preventDefault();
    const from = draggedModuleIdx;
    setDraggedModuleIdx(null);
    setDragOverModuleIdx(null);
    if (from === null || from === idx) return;

    const next = [...modules];
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    setLocalModules(next);
    await persistModuleOrder(next);
  };

  const handleModuleDragEnd = () => {
    setDraggedModuleIdx(null);
    setDragOverModuleIdx(null);
  };

  const persistLessonOrder = async (lessons: StudioLesson[]) => {
    try {
      await Promise.all(
        lessons.map((l, i) =>
          updateLessonMut.mutateAsync({ courseId, lessonId: String(l.id), payload: { sort_order: i } })
        )
      );
    } catch { /* */ }
  };

  const handleLessonDragStart = (modIdx: number, lessonIdx: number) => (e: DragEvent) => {
    e.stopPropagation();
    setDraggedLesson({ modIdx, lessonIdx });
  };

  const handleLessonDragOver = (modIdx: number, lessonIdx: number) => (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedLesson || draggedLesson.modIdx !== modIdx || draggedLesson.lessonIdx === lessonIdx) return;
    setDragOverLesson({ modIdx, lessonIdx });
  };

  const handleLessonDrop = (modIdx: number, lessonIdx: number) => async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const from = draggedLesson;
    setDraggedLesson(null);
    setDragOverLesson(null);
    if (!from || from.modIdx !== modIdx || from.lessonIdx === lessonIdx) return;

    const mod = modules[modIdx];
    const lessons = [...(mod.lessons ?? [])];
    const [moved] = lessons.splice(from.lessonIdx, 1);
    lessons.splice(lessonIdx, 0, moved);
    const next = modules.map((m, i) => i === modIdx ? { ...m, lessons } : m);
    setLocalModules(next);
    await persistLessonOrder(lessons);
  };

  const handleLessonDragEnd = (e: DragEvent) => {
    e.stopPropagation();
    setDraggedLesson(null);
    setDragOverLesson(null);
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
              <div
                className={`${s.moduleCard} ${draggedModuleIdx === mi ? s.dragging : ''} ${dragOverModuleIdx === mi ? s.dragOver : ''}`}
                key={modKey}
              >
                <div
                  className={s.moduleHeader}
                  onClick={() => toggleModule(modKey)}
                  draggable={!!mod.id}
                  onDragStart={handleModuleDragStart(mi)}
                  onDragOver={handleModuleDragOver(mi)}
                  onDrop={handleModuleDrop(mi)}
                  onDragEnd={handleModuleDragEnd}
                >
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
                    {lessons.map((lesson, li) => {
                      const lessonType = lesson.type ?? 'video';
                      const icon = TYPE_ICONS[lessonType];
                      const lessonId = String(lesson.id);
                      const isDraggingThis = draggedLesson?.modIdx === mi && draggedLesson.lessonIdx === li;
                      const isDragOverThis = dragOverLesson?.modIdx === mi && dragOverLesson.lessonIdx === li;
                      return (
                        <div
                          className={`${s.lessonRow} ${isDraggingThis ? s.dragging : ''} ${isDragOverThis ? s.dragOver : ''}`}
                          key={lessonId}
                          draggable
                          onDragStart={handleLessonDragStart(mi, li)}
                          onDragOver={handleLessonDragOver(mi, li)}
                          onDrop={handleLessonDrop(mi, li)}
                          onDragEnd={handleLessonDragEnd}
                        >
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
        <>
          <div className={s.toolbar}>
            <button
              className={s.toolbarBtnPrimary}
              onClick={handleSaveSettings}
              disabled={saveState === 'saving'}
            >
              {saveState === 'saving' ? 'Сохранение…' : 'Сохранить изменения'}
            </button>
            {saveState === 'saved' && <span className={s.saveStatus}>Сохранено ✓</span>}
          </div>

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

            {/* Learn items card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Чему вы научитесь</h3>
              {form.learn_items.map((item, idx) => (
                <div className={s.listItemRow} key={idx}>
                  <input
                    className={s.input}
                    value={item}
                    onChange={e => updateListItem('learn_items', idx, e.target.value)}
                    placeholder="Например: Настройка камеры: выдержка, диафрагма, ISO"
                  />
                  <button className={s.listRemoveBtn} onClick={() => removeListItem('learn_items', idx)}>&times;</button>
                </div>
              ))}
              <button className={s.listAddBtn} onClick={() => addListItem('learn_items')}>＋ Добавить пункт</button>
            </div>

            {/* Includes card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Что входит в курс</h3>
              {form.includes.map((item, idx) => (
                <div className={s.listItemRow} key={idx}>
                  <input
                    className={s.input}
                    value={item}
                    onChange={e => updateListItem('includes', idx, e.target.value)}
                    placeholder="Например: 42 часа видео"
                  />
                  <button className={s.listRemoveBtn} onClick={() => removeListItem('includes', idx)}>&times;</button>
                </div>
              ))}
              <button className={s.listAddBtn} onClick={() => addListItem('includes')}>＋ Добавить пункт</button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Cover card */}
            <div className={s.card}>
              <h3 className={s.cardTitle}>Обложка курса</h3>
              {form.preview_url
                ? <img className={s.coverImg} src={form.preview_url} alt="Обложка курса" />
                : <div className={s.coverPlaceholder} />}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleCoverChange}
              />
              <button
                className={s.uploadBtn}
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? 'Загрузка…' : 'Загрузить обложку'}
              </button>
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
        </>
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
