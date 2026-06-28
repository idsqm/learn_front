import { useState } from 'react';
import { useCategories } from '../features/studio/api/queries';
import type { EditorCourse, EditorModule, EditorLesson } from './CourseEditor';
import s from './NewCourse.module.css';

interface Props {
  onBack: () => void;
  onCreate: (course: EditorCourse) => void;
  onOpenLessonModal: (moduleId: string) => void;
  pendingLessons: Map<string, EditorLesson[]>;
}

const LEVELS = [
  'Начинающий',
  'Средний',
  'Продвинутый',
];

const TYPE_ICONS: Record<EditorLesson['type'], { label: string; cls: string }> = {
  video: { label: '▶', cls: 'typeVideo' },
  quiz:  { label: '?', cls: 'typeQuiz' },
  text:  { label: '≡', cls: 'typeText' },
};

export default function NewCourse({ onBack, onCreate, onOpenLessonModal, pendingLessons }: Props) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  /* Step 1 */
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');

  /* Step 2 */
  const [modules, setModules] = useState<EditorModule[]>([
    { id: 'wm_1', title: 'Введение', lessons: [] },
  ]);

  /* Step 3 */
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState<number | null>(null);

  /* Merge pending lessons from modal into modules */
  const getModulesWithPending = (): EditorModule[] => {
    return modules.map(m => {
      const pending = pendingLessons.get(m.id) ?? [];
      if (pending.length === 0) return m;
      return { ...m, lessons: [...m.lessons, ...pending] };
    });
  };

  const addModule = () => {
    setModules(prev => [...prev, {
      id: 'wm_' + Date.now(),
      title: '',
      lessons: [],
    }]);
  };

  const removeModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
  };

  const updateModuleTitle = (id: string, newTitle: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, title: newTitle } : m));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(prev => prev.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
        : m
    ));
  };

  const handleCreate = () => {
    const finalModules = getModulesWithPending();
    const selectedCategory = categories.find(c => c.id === categoryId);
    const course: EditorCourse = {
      id: 'c_' + Date.now(),
      title: title || 'Без названия',
      subtitle,
      category: selectedCategory?.name ?? '',
      category_id: categoryId,
      level,
      price: isFree ? 0 : price,
      old_price: isFree ? null : oldPrice,
      is_free: isFree,
      status: 'draft',
      modules: finalModules,
    };
    onCreate(course);
  };

  const goToStep = (n: number) => {
    if (n > step && step === 1) {
      const newErrors: Record<string, boolean> = {};
      if (!title.trim()) newErrors.title = true;
      if (!categoryId) newErrors.category = true;
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setErrors({});
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const steps = [
    { num: 1, label: 'О курсе' },
    { num: 2, label: 'Программа' },
    { num: 3, label: 'Цена' },
  ];

  const displayModules = getModulesWithPending();

  return (
    <div className={s.wrap}>
      {/* Breadcrumb */}
      <div className={s.breadcrumb}>
        <span className={s.breadcrumbLink} onClick={onBack}>Курсы</span>
        <span className={s.breadcrumbSep}>/</span>
        <span className={s.breadcrumbCurrent}>Новый курс</span>
      </div>

      <h1 className={s.title}>Создание курса</h1>
      <p className={s.subtitle}>Заполните информацию о курсе шаг за шагом.</p>

      {/* Steps indicator */}
      <div className={s.steps}>
        {steps.map((st, i) => (
          <div key={st.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={s.stepItem}>
              <span
                className={
                  step === st.num
                    ? s.stepCircleActive
                    : step > st.num
                      ? s.stepCircleDone
                      : s.stepCircleInactive
                }
              >
                {step > st.num ? '✓' : st.num}
              </span>
              <span className={step === st.num ? s.stepLabelActive : s.stepLabel}>
                {st.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={step > st.num ? s.stepLineDone : s.stepLine} />
            )}
          </div>
        ))}
      </div>

      {/* Layout: main + sidebar */}
      <div className={s.layout}>
        <div>
          {/* Step 1 */}
          {step === 1 && (
            <div className={s.card}>
              <h3 className={s.cardTitle}>Расскажите о курсе</h3>

              <div className={s.fieldGroup}>
                <label className={s.label}>Название курса</label>
                <input
                  className={`${s.input} ${errors.title ? s.inputError : ''}`}
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: false })); }}
                  placeholder="Например: React с нуля до продвинутого"
                />
                {errors.title && <span className={s.errorText}>Заполните название курса</span>}
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Подзаголовок</label>
                <input
                  className={s.input}
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="Краткое описание в одну строку"
                />
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Категория</label>
                <select
                  className={`${s.select} ${errors.category ? s.inputError : ''}`}
                  value={categoryId || ''}
                  onChange={e => { setCategoryId(Number(e.target.value)); setErrors(prev => ({ ...prev, category: false })); }}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category && <span className={s.errorText}>Выберите категорию</span>}
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Уровень</label>
                <select
                  className={s.select}
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                >
                  <option value="">Выберите уровень</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Описание</label>
                <textarea
                  className={s.textarea}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Подробное описание курса, чему научатся студенты..."
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className={s.card}>
                <h3 className={s.cardTitle}>Структура программы</h3>
                <p style={{ font: "400 14px 'Geist', sans-serif", color: '#8e8d99', margin: '0 0 4px' }}>
                  Добавьте модули и уроки для вашего курса.
                </p>
              </div>

              {displayModules.map(mod => (
                <div className={s.moduleCard} key={mod.id}>
                  <div className={s.moduleHeader}>
                    <input
                      className={s.moduleTitleInput}
                      value={mod.title}
                      onChange={e => updateModuleTitle(mod.id, e.target.value)}
                      placeholder="Название модуля"
                    />
                    <span className={s.moduleLessons}>
                      {mod.lessons.length} ур.
                    </span>
                    <button
                      className={s.removeModuleBtn}
                      onClick={() => removeModule(mod.id)}
                      title="Удалить модуль"
                    >
                      &times;
                    </button>
                  </div>

                  {mod.lessons.map(lesson => {
                    const icon = TYPE_ICONS[lesson.type];
                    return (
                      <div className={s.lessonRow} key={lesson.id}>
                        <span className={s[icon.cls as keyof typeof s] as string}>
                          {icon.label}
                        </span>
                        <span className={s.lessonName}>{lesson.name}</span>
                        <button
                          className={s.removeLessonBtn}
                          onClick={() => removeLesson(mod.id, lesson.id)}
                          title="Удалить урок"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}

                  <div className={s.addLessonFooter}>
                    <span
                      className={s.addLessonLink}
                      onClick={() => onOpenLessonModal(mod.id)}
                    >
                      + Добавить урок
                    </span>
                  </div>
                </div>
              ))}

              <button className={s.addModuleBtn} onClick={addModule}>
                + Добавить модуль
              </button>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className={s.card}>
              <h3 className={s.cardTitle}>Цена и доступ</h3>

              <div className={s.toggleRow}>
                <button
                  className={isFree ? s.toggleOn : s.toggleOff}
                  onClick={() => setIsFree(!isFree)}
                >
                  <span className={s.toggleDot} />
                </button>
                <span className={s.toggleLabel}>Бесплатный курс</span>
              </div>

              {!isFree && (
                <div className={s.priceRow}>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Цена (&#8381;)</label>
                    <input
                      className={s.input}
                      type="number"
                      value={price || ''}
                      onChange={e => setPrice(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Старая цена (&#8381;)</label>
                    <input
                      className={s.input}
                      type="number"
                      value={oldPrice ?? ''}
                      onChange={e => setOldPrice(e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          <div className={s.previewCard}>
            <div className={s.previewCover} />
            <div className={s.previewLabel}>Название</div>
            <div className={s.previewValue}>{title || 'Без названия'}</div>
            {categoryId > 0 && (
              <>
                <div className={s.previewLabel}>Категория</div>
                <div className={s.previewValue}>{categories.find(c => c.id === categoryId)?.name}</div>
              </>
            )}
            <div className={s.previewLabel}>Цена</div>
            <div className={s.previewValue}>
              {isFree ? 'Бесплатно' : (price ? `${price.toLocaleString('ru-RU')} ₽` : 'Не указана')}
            </div>
          </div>

          <div className={s.navBtns}>
            {step < 3 && (
              <button className={s.nextBtn} onClick={() => goToStep(step + 1)}>
                Далее
              </button>
            )}
            {step === 3 && (
              <button className={s.nextBtn} onClick={handleCreate}>
                Создать курс
              </button>
            )}
            {step > 1 && (
              <button className={s.backBtn} onClick={() => goToStep(step - 1)}>
                Назад
              </button>
            )}
            <button className={s.backBtn} onClick={onBack}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
