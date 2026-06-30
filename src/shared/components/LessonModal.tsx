import { useState, useEffect } from 'react';
import s from './LessonModal.module.css';

export type LessonType = 'video' | 'quiz' | 'text' | 'assignment';

export interface QuizOption {
  id: string;
  dbId?: number;
  text: string;
}

export type QuizQuestionType = 'single' | 'multiple';

export interface QuizQuestion {
  id: string;
  dbId?: number;
  text: string;
  questionType: QuizQuestionType;
  points: number;
  options: QuizOption[];
  correctOptionIds: string[];
}

export interface LessonPayload {
  name: string;
  type: LessonType;
  textContent?: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  is_free?: boolean;
}

export interface LessonEditData {
  id: string;
  name: string;
  type: LessonType;
  is_free: boolean;
  textContent?: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  loading?: boolean;
}

interface Props {
  onClose: () => void;
  onAdd: (lesson: LessonPayload) => void;
  editData?: LessonEditData;
}

const TYPES: { key: LessonType; label: string; sub: string; iconCls: string; icon: string }[] = [
  { key: 'video', label: 'Видео', sub: 'Запись урока', iconCls: 'typeCardIconVideo', icon: '▶' },
  { key: 'quiz', label: 'Тест', sub: 'Проверка знаний', iconCls: 'typeCardIconQuiz', icon: '?' },
  { key: 'text', label: 'Текст', sub: 'Статья · материал', iconCls: 'typeCardIconText', icon: '≡' },
  { key: 'assignment', label: 'Задание', sub: 'Практическая работа', iconCls: 'typeCardIconAssignment', icon: '✎' },
];

function uid() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function emptyQuestion(): QuizQuestion {
  return {
    id: uid(),
    text: '',
    questionType: 'single',
    points: 1,
    options: [
      { id: uid(), text: '' },
      { id: uid(), text: '' },
    ],
    correctOptionIds: [],
  };
}

export default function LessonModal({ onClose, onAdd, editData }: Props) {
  const isEdit = !!editData;
  const isLoadingDetail = !!editData?.loading;
  const [type, setType] = useState<LessonType>(editData?.type ?? 'video');
  const [name, setName] = useState(editData?.name ?? '');
  const [isFree, setIsFree] = useState(editData?.is_free ?? false);
  const [textContent, setTextContent] = useState(editData?.textContent ?? '');
  const [videoUrl, setVideoUrl] = useState(editData?.videoUrl ?? '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(editData?.questions ?? [emptyQuestion()]);

  useEffect(() => {
    if (!editData || editData.loading) return;
    setType(editData.type);
    setName(editData.name);
    setIsFree(editData.is_free);
    setTextContent(editData.textContent ?? '');
    setVideoUrl(editData.videoUrl ?? '');
    setQuestions(editData.questions ?? [emptyQuestion()]);
  }, [editData]);

  const canSubmit = () => {
    if (isLoadingDetail) return false;
    if (!name.trim()) return false;
    if ((type === 'text' || type === 'assignment') && !textContent.trim()) return false;
    if (type === 'quiz' && questions.some(q =>
      !q.text.trim() ||
      q.options.some(o => !o.text.trim()) ||
      q.correctOptionIds.length === 0 ||
      q.points < 1
    )) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;
    const payload: LessonPayload = { name: name.trim(), type, is_free: isFree };
    if (type === 'video') payload.videoUrl = videoUrl.trim();
    if (type === 'text' || type === 'assignment') payload.textContent = textContent;
    if (type === 'quiz') payload.questions = questions;
    onAdd(payload);
  };

  const updateQuestion = (qId: string, update: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...update } : q));
  };

  const setQuestionType = (qId: string, questionType: QuizQuestionType) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const correctOptionIds = questionType === 'single' ? q.correctOptionIds.slice(0, 1) : q.correctOptionIds;
      return { ...q, questionType, correctOptionIds };
    }));
  };

  const toggleCorrectOption = (qId: string, optId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      if (q.questionType === 'single') {
        return { ...q, correctOptionIds: [optId] };
      }
      const has = q.correctOptionIds.includes(optId);
      return {
        ...q,
        correctOptionIds: has ? q.correctOptionIds.filter(id => id !== optId) : [...q.correctOptionIds, optId],
      };
    }));
  };

  const updateOption = (qId: string, optId: string, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return { ...q, options: q.options.map(o => o.id === optId ? { ...o, text } : o) };
    }));
  };

  const addOption = (qId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return { ...q, options: [...q.options, { id: uid(), text: '' }] };
    }));
  };

  const removeOption = (qId: string, optId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId || q.options.length <= 2) return q;
      return {
        ...q,
        options: q.options.filter(o => o.id !== optId),
        correctOptionIds: q.correctOptionIds.filter(id => id !== optId),
      };
    }));
  };

  const removeQuestion = (qId: string) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <h3 className={s.headerTitle}>{isEdit ? 'Редактировать урок' : 'Добавить урок'}</h3>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          {isLoadingDetail && (
            <div className={s.fieldGroup} style={{ color: '#9a99a6', font: "400 13px 'Geist', sans-serif" }}>
              Загрузка урока…
            </div>
          )}
          <div className={s.fieldGroup}>
            <label className={s.label}>Тип урока</label>
            <div className={s.typePicker}>
              {TYPES.map(t => (
                <div
                  key={t.key}
                  className={type === t.key ? s.typeCardActive : s.typeCard}
                  onClick={() => setType(t.key)}
                >
                  <div className={s[t.iconCls as keyof typeof s] as string}>{t.icon}</div>
                  <div className={s.typeCardLabel}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Название урока</label>
            <input
              className={s.input}
              placeholder="Например: Экспозиция простыми словами"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && type === 'video' && handleSubmit()}
              autoFocus
            />
          </div>

          <div className={s.fieldGroup}>
            <label className={s.freeToggle} onClick={() => setIsFree(!isFree)}>
              <span className={isFree ? s.checkboxChecked : s.checkboxUnchecked}>
                {isFree ? '✓' : ''}
              </span>
              <span>Бесплатный урок (доступен без покупки)</span>
            </label>
          </div>

          {type === 'video' && (
            <>
              <div className={s.fieldGroup}>
                <label className={s.label}>Ссылка на видео</label>
                <input
                  className={s.input}
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Видеофайл</label>
                <div className={s.uploadZone}>
                  <div className={s.uploadIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" /></svg>
                  </div>
                  <div className={s.uploadText}>
                    <span className={s.uploadTextAccent}>Перетащите видео или нажмите для выбора</span>
                    <br />MP4, MOV · до 4 ГБ
                  </div>
                </div>
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Материалы для скачивания</label>
                <div className={s.attachZone}>
                  <span className={s.attachText}>＋ Прикрепить PDF, ZIP или пресеты</span>
                </div>
              </div>
            </>
          )}

          {type === 'text' && (
            <div className={s.fieldGroup}>
              <label className={s.label}>Текст урока</label>
              <textarea
                className={s.textarea}
                placeholder="Напишите содержание урока…"
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
              />
            </div>
          )}

          {type === 'assignment' && (
            <div className={s.fieldGroup}>
              <label className={s.label}>Описание задания</label>
              <textarea
                className={s.textarea}
                placeholder="Опишите, что должен сделать студент…"
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
              />
            </div>
          )}

          {type === 'quiz' && (
            <div className={s.fieldGroup}>
              <label className={s.label}>Вопросы</label>
              {questions.map((q, qi) => (
                <div key={q.id} className={s.questionCard}>
                  <div className={s.questionHeader}>
                    <div className={s.questionNumber}>{qi + 1}</div>
                    <input
                      className={s.questionInput}
                      placeholder="Текст вопроса"
                      value={q.text}
                      onChange={e => updateQuestion(q.id, { text: e.target.value })}
                    />
                    {questions.length > 1 && (
                      <button className={s.removeBtn} onClick={() => removeQuestion(q.id)}>✕</button>
                    )}
                  </div>
                  <div className={s.questionMeta}>
                    <div className={s.qTypeToggle}>
                      <button
                        type="button"
                        className={q.questionType === 'single' ? s.qTypeBtnActive : s.qTypeBtn}
                        onClick={() => setQuestionType(q.id, 'single')}
                      >
                        Один ответ
                      </button>
                      <button
                        type="button"
                        className={q.questionType === 'multiple' ? s.qTypeBtnActive : s.qTypeBtn}
                        onClick={() => setQuestionType(q.id, 'multiple')}
                      >
                        Несколько ответов
                      </button>
                    </div>
                    <div className={s.qPointsField}>
                      <span className={s.qPointsLabel}>Баллы</span>
                      <input
                        className={s.qPointsInput}
                        type="number"
                        min={1}
                        value={q.points}
                        onChange={e => updateQuestion(q.id, { points: Math.max(1, Number(e.target.value) || 1) })}
                      />
                    </div>
                  </div>
                  {q.options.map(opt => {
                    const isCorrect = q.correctOptionIds.includes(opt.id);
                    const indicatorCls = q.questionType === 'single'
                      ? (isCorrect ? s.optionRadioCorrect : s.optionRadio)
                      : (isCorrect ? s.optionCheckboxCorrect : s.optionCheckbox);
                    return (
                      <div key={opt.id} className={s.optionRow}>
                        <div
                          className={indicatorCls}
                          onClick={() => toggleCorrectOption(q.id, opt.id)}
                          title={q.questionType === 'single' ? 'Отметить правильным' : 'Отметить как правильный'}
                        />
                        <input
                          className={s.optionInput}
                          placeholder="Вариант ответа"
                          value={opt.text}
                          onChange={e => updateOption(q.id, opt.id, e.target.value)}
                        />
                        {q.options.length > 2 && (
                          <button className={s.removeBtn} onClick={() => removeOption(q.id, opt.id)}>✕</button>
                        )}
                      </div>
                    );
                  })}
                  <div className={s.addOptionBtn}>
                    <button className={s.addLink} onClick={() => addOption(q.id)}>＋ Добавить вариант</button>
                  </div>
                </div>
              ))}
              <button className={s.addQuestionBtn} onClick={() => setQuestions(prev => [...prev, emptyQuestion()])}>
                ＋ Добавить вопрос
              </button>
            </div>
          )}
        </div>

        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Отмена</button>
          <button className={s.submitBtn} disabled={!canSubmit()} onClick={handleSubmit}>{isEdit ? 'Сохранить' : 'Добавить урок'}</button>
        </div>
      </div>
    </div>
  );
}
