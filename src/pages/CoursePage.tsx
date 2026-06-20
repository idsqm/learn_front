import { useNavigate, useParams } from 'react-router-dom';
import { courses, learnItems, curriculum, courseIncludes, courseReviews } from '../data/mockData';
import s from './CoursePage.module.css';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === Number(id)) || courses[0];

  return (
    <main>
      <div className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.breadcrumb}>
            <span onClick={() => navigate('/catalog')} className={s.breadcrumbLink}>Каталог</span>{' / '}
            <span onClick={() => navigate('/catalog')} className={s.breadcrumbLink}>{course.category}</span>{' / '}
            <span className={s.breadcrumbCurrent}>{course.title}</span>
          </div>
          <div className={s.heroContent}>
            <h1 className={s.heroTitle}>{course.title}</h1>
            <p className={s.heroDesc}>Полный путь от полного новичка до уверенного фотографа: камера, свет, композиция, портрет и обработка — на реальных съёмках.</p>
            <div className={s.heroMeta}>
              <span className={s.ratingGroup}>
                <span className={s.ratingStar}>★</span>
                <span className={s.ratingValue}>{course.rating}</span>
                <span className={s.ratingCount}>({course.reviews} отзывов)</span>
              </span>
              <span className={s.dot}>·</span>
              <span className={s.students}>{course.students} учеников</span>
              <span className={s.dot}>·</span>
              <span>Автор: <span className={s.authorName}>{course.author}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${s.layout} lq-course-grid`}>
        <div>
          <div className={s.card}>
            <h2 className={s.sectionTitle}>Чему вы научитесь</h2>
            <div className={`${s.learnGrid} lq-learn-grid`}>
              {learnItems.map(l => (
                <div key={l} className={s.learnItem}>
                  <span className={s.checkIcon}>✓</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className={s.curriculumTitle}>Программа курса</h2>
          <p className={s.curriculumMeta}>4 модуля · 64 урока · 12 ч 15 мин</p>
          <div className={s.curriculumCard}>
            {curriculum.map((m, i) => (
              <div key={m.t} style={i > 0 ? { borderTop: '1px solid #f0f0f5' } : undefined}>
                <div className={s.moduleHeader}>
                  <div className={s.moduleHeaderLeft}>
                    <span className={m.expanded ? s.chevronExpanded : s.chevronCollapsed}>▾</span>
                    <span className={s.moduleTitle}>{m.t}</span>
                  </div>
                  <span className={s.moduleDuration}>{m.d}</span>
                </div>
                {m.expanded && m.lessons && (
                  <div className={s.moduleDivider}>
                    {m.lessons.map(ls => (
                      <div key={ls.n} className={s.lessonRow}>
                        <div className={s.lessonInfo}>
                          <svg width="14" height="14" viewBox="0 0 14 14" className={s.lessonIcon}><path d="M2 1.5L12 7L2 12.5Z" fill="currentColor" /></svg>
                          <span>{ls.n}</span>
                          {ls.free && <span className={s.freeBadge}>Бесплатно</span>}
                        </div>
                        <span className={s.lessonDuration}>{ls.d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <h2 className={s.authorSectionTitle}>Об авторе</h2>
          <div className={s.authorCard}>
            <div className={s.authorAvatar}>АК</div>
            <div>
              <div className={s.authorFullName}>Анна Корнева</div>
              <div className={s.authorSubtitle}>Фотограф · 12 лет практики · 8 курсов</div>
              <p className={s.authorBio}>Снимаю свадьбы и репортаж, преподаю с 2015 года. Люблю объяснять сложное на пальцах и показывать всё на реальных кадрах, а не на идеальной студии.</p>
            </div>
          </div>

          <h2 className={s.reviewsSectionTitle}>Отзывы учеников</h2>
          <div className={`${s.reviewsGrid} lq-reviews`}>
            {courseReviews.map(r => (
              <div key={r.name} className={s.reviewCard}>
                <div className={s.reviewHeader}>
                  <div className={s.reviewAvatar}>{r.initials}</div>
                  <div>
                    <div className={s.reviewName}>{r.name}</div>
                    <div className={s.reviewStars}>★★★★★</div>
                  </div>
                </div>
                <p className={s.reviewText}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className={`${s.sidebar} lq-buy`}>
          <div className={s.sidebarPreview}>
            <div className={s.playButton}>
              <svg width="18" height="20" viewBox="0 0 20 22"><path d="M2 2L18 11L2 20Z" fill="#5d4ee6" /></svg>
            </div>
            <span className={s.previewLabel}>Превью курса · 2:40</span>
          </div>
          <div className={s.sidebarBody}>
            <div className={s.priceRow}>
              <span className={s.price}>{course.price} ₽</span>
              {course.oldPrice && <span className={s.oldPrice}>{course.oldPrice} ₽</span>}
              {course.oldPrice && <span className={s.discountBadge}>−40%</span>}
            </div>
            <div className={s.urgency}>⏳ Скидка действует ещё 2 дня</div>
            <button className={s.buyBtn}>Купить курс</button>
            <button className={s.favBtn}>Добавить в избранное</button>
            <div className={s.guarantee}>30 дней гарантия возврата</div>
            <div className={s.includesSection}>
              <div className={s.includesTitle}>Этот курс включает:</div>
              <div className={s.includesList}>
                {courseIncludes.map(item => (
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
