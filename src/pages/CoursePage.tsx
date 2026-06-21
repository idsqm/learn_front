import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourse, useEnroll, useAddFavorite, useRemoveFavorite, useFavorites } from '../features/courses/api/queries';
import { useAuthStore } from '../features/auth/store/authStore';
import { fmtPrice, fmtRating, fmtNumber, fmtHours } from '../shared/utils/format';
import s from './CoursePage.module.css';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: course, isLoading } = useCourse(id || '');
  const enroll = useEnroll();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { data: favoritesData } = useFavorites();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

  if (isLoading || !course) {
    return <main style={{ padding: '100px 0', textAlign: 'center', color: '#8e8d99' }}>Загрузка курса…</main>;
  }

  const isFavorited = favoritesData?.data?.some(f => f.id === course.id) ?? false;

  const toggleModule = (i: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleEnroll = () => {
    if (!isAuthenticated) return;
    enroll.mutate(course.id);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) return;
    if (isFavorited) removeFavorite.mutate(course.id);
    else addFavorite.mutate(course.id);
  };

  const discount = course.old_price
    ? Math.round((1 - course.price / course.old_price) * 100)
    : null;

  return (
    <main>
      <div className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.breadcrumb}>
            <span onClick={() => navigate('/catalog')} className={s.breadcrumbLink}>Каталог</span>{' / '}
            <span onClick={() => navigate(`/catalog?category=${encodeURIComponent(course.category)}`)} className={s.breadcrumbLink}>{course.category}</span>{' / '}
            <span className={s.breadcrumbCurrent}>{course.title}</span>
          </div>
          <div className={s.heroContent}>
            <h1 className={s.heroTitle}>{course.title}</h1>
            <p className={s.heroDesc}>{course.description}</p>
            <div className={s.heroMeta}>
              <span className={s.ratingGroup}>
                <span className={s.ratingStar}>★</span>
                <span className={s.ratingValue}>{fmtRating(course.rating)}</span>
                <span className={s.ratingCount}>({fmtNumber(course.reviews_count)} отзывов)</span>
              </span>
              <span className={s.dot}>·</span>
              <span className={s.students}>{fmtNumber(course.students_count)} учеников</span>
              <span className={s.dot}>·</span>
              <span>Автор: <span className={s.authorName}>{course.author.name}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${s.layout} lq-course-grid`}>
        <div>
          <div className={s.card}>
            <h2 className={s.sectionTitle}>Чему вы научитесь</h2>
            <div className={`${s.learnGrid} lq-learn-grid`}>
              {course.learn_items.map(l => (
                <div key={l} className={s.learnItem}>
                  <span className={s.checkIcon}>✓</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className={s.curriculumTitle}>Программа курса</h2>
          <p className={s.curriculumMeta}>
            {course.curriculum.length} модулей · {course.lessons_count} уроков · {fmtHours(course.hours)}
          </p>
          <div className={s.curriculumCard}>
            {course.curriculum.map((m, i) => (
              <div key={m.title} style={i > 0 ? { borderTop: '1px solid #f0f0f5' } : undefined}>
                <div className={s.moduleHeader} onClick={() => toggleModule(i)} style={{ cursor: 'pointer' }}>
                  <div className={s.moduleHeaderLeft}>
                    <span className={expandedModules.has(i) ? s.chevronExpanded : s.chevronCollapsed}>▾</span>
                    <span className={s.moduleTitle}>{m.title}</span>
                  </div>
                  <span className={s.moduleDuration}>{m.lessons_count} уроков · {m.duration}</span>
                </div>
                {expandedModules.has(i) && m.lessons && (
                  <div className={s.moduleDivider}>
                    {m.lessons.map(ls => (
                      <div key={ls.id} className={s.lessonRow}>
                        <div className={s.lessonInfo}>
                          <svg width="14" height="14" viewBox="0 0 14 14" className={s.lessonIcon}><path d="M2 1.5L12 7L2 12.5Z" fill="currentColor" /></svg>
                          <span>{ls.name}</span>
                          {ls.is_free && <span className={s.freeBadge}>Бесплатно</span>}
                        </div>
                        <span className={s.lessonDuration}>{ls.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <h2 className={s.authorSectionTitle}>Об авторе</h2>
          <div className={s.authorCard}>
            <div className={s.authorAvatar}>{course.author.initials}</div>
            <div>
              <div className={s.authorFullName}>{course.author.name}</div>
              <div className={s.authorSubtitle}>{course.author.subtitle}</div>
              <p className={s.authorBio}>{course.author.bio}</p>
            </div>
          </div>

          {course.reviews.length > 0 && (
            <>
              <h2 className={s.reviewsSectionTitle}>Отзывы учеников</h2>
              <div className={`${s.reviewsGrid} lq-reviews`}>
                {course.reviews.map(r => (
                  <div key={r.id} className={s.reviewCard}>
                    <div className={s.reviewHeader}>
                      <div className={s.reviewAvatar}>{r.initials}</div>
                      <div>
                        <div className={s.reviewName}>{r.name}</div>
                        <div className={s.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                    </div>
                    <p className={s.reviewText}>{r.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className={`${s.sidebar} lq-buy`}>
          <div className={s.sidebarPreview}>
            <div className={s.playButton}>
              <svg width="18" height="20" viewBox="0 0 20 22"><path d="M2 2L18 11L2 20Z" fill="#5d4ee6" /></svg>
            </div>
            <span className={s.previewLabel}>Превью курса</span>
          </div>
          <div className={s.sidebarBody}>
            <div className={s.priceRow}>
              <span className={s.price}>{fmtPrice(course.price)} ₽</span>
              {course.old_price && <span className={s.oldPrice}>{fmtPrice(course.old_price)} ₽</span>}
              {discount && <span className={s.discountBadge}>−{discount}%</span>}
            </div>
            {course.old_price && <div className={s.urgency}>⏳ Скидка действует ещё 2 дня</div>}
            <button className={s.buyBtn} onClick={handleEnroll} disabled={enroll.isPending}>
              {enroll.isPending ? 'Оформление…' : 'Купить курс'}
            </button>
            <button className={s.favBtn} onClick={handleFavorite} disabled={addFavorite.isPending || removeFavorite.isPending}>
              {isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
            </button>
            <div className={s.guarantee}>30 дней гарантия возврата</div>
            <div className={s.includesSection}>
              <div className={s.includesTitle}>Этот курс включает:</div>
              <div className={s.includesList}>
                {course.includes.map(item => (
                  <div key={item} className={s.includesItem}>
                    <span className={s.includesCheck}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
