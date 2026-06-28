import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeaturedCourses, useCategories } from '../features/courses/api/queries';
import { useAuthStore } from '../features/auth/store/authStore';
import AuthModal from '../features/auth/components/AuthModal';
import { useReveal, useRevealChildren } from '../shared/hooks/useReveal';
import CourseCard from '../shared/components/CourseCard';
import Footer from '../shared/components/Footer';
import s from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const { data: featuredData } = useFeaturedCourses();
  const { data: categoriesData } = useCategories();

  const featured = featuredData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const categoriesRef = useRevealChildren<HTMLDivElement>(80);
  const featuredRef = useRevealChildren<HTMLDivElement>(100);
  const bandRef = useReveal<HTMLDivElement>();
  const bandStatsRef = useRevealChildren<HTMLDivElement>(100);

  const handleAuthorClick = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      return;
    }

    navigate(user?.role === 'author' ? '/studio' : '/become-author');
  };

  return (
    <>
    <main>
      <section className={s.heroSection}>
        <div className={`${s.heroGrid} lq-hero`}>
          <div>
            <div className={s.badge}>● 1 200+ курсов от практиков</div>
            <h1 className={s.heroTitle}>
              Учитесь новому.<br />Преподавайте любимое.
            </h1>
            <p className={s.heroSubtitle}>
              Платформа, где эксперты создают курсы, а вы осваиваете навыки в своём темпе — от фотографии до шахмат. Один раз купил — учишься навсегда.
            </p>
            <div className={s.heroButtons}>
              <button onClick={() => navigate('/catalog')} className={s.btnPrimary}>Найти курс →</button>
              <button onClick={handleAuthorClick} className={s.btnSecondary}>
                {user?.role === 'author' ? 'Перейти в студию' : 'Стать автором'}
              </button>
            </div>
            <div className={`${s.statsRow} lq-hero-stats`}>
              <div><span className={s.statValue}>48 000+</span>учеников</div>
              <div className={s.statDivider} />
              <div><span className={s.statValue}>★ 4.9</span>средний рейтинг</div>
              <div className={s.statDivider} />
              <div><span className={s.statValue}>1 200+</span>курсов</div>
            </div>
          </div>

          <div className={`${s.heroVisualWrap} lq-hero-visual`}>
            <div className={s.heroVisualGlow} />
            <div className={s.heroCard}>
              <div className={s.heroCardThumb}>
                <div className={s.playBtn}>
                  <svg width="20" height="22" viewBox="0 0 20 22"><path d="M2 2L18 11L2 20Z" fill="#5d4ee6" /></svg>
                </div>
                <span className={s.videoOverlayLeft}>Урок 3 / 64</span>
                <span className={s.videoOverlayRight}>14:30</span>
              </div>
              <div className={s.heroCardBody}>
                <div className={s.heroCardModule}>МОДУЛЬ 1 · ОСНОВЫ</div>
                <div className={s.heroCardTitle}>Экспозиция простыми словами</div>
                <div className={s.progressTrack}>
                  <div className={s.progressFill} />
                </div>
                <div className={s.progressInfo}>
                  <span>Пройдено 27 из 64 уроков</span>
                  <span className={s.progressPercent}>42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.categoriesSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Категории</h2>
          <a onClick={() => navigate('/catalog')} className={s.sectionLink}>Все категории →</a>
        </div>
        <div ref={categoriesRef} className={`${s.categoriesGrid} lq-grid-4`}>
          {categories.map(cat => (
            <div key={cat.id} onClick={() => navigate(`/catalog?category=${encodeURIComponent(cat.name)}`)} className={`${s.categoryCard} reveal-item`}>
              <div className={s.categoryIcon} style={{
                background: cat.color + '1f', color: cat.color,
              }}>{cat.abbreviation}</div>
              <div className={s.categoryInfo}>
                <div className={s.categoryName}>{cat.name}</div>
                <div className={s.categoryCount}>{cat.courses_count} курсов</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={s.featuredSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Популярные курсы</h2>
          <a onClick={() => navigate('/catalog')} className={s.sectionLink}>Смотреть все →</a>
        </div>
        <div ref={featuredRef} className={`${s.featuredGrid} lq-grid-4`}>
          {featured.map(c => <CourseCard key={c.id} course={c} showStudents showLevel className="reveal-item" />)}
        </div>
      </section>

      <section className={s.bandSection}>
        <div ref={bandRef} className={`${s.bandInner} lq-band reveal`}>
          <div className={s.bandGlow} />
          <div className={s.bandContent}>
            <div className={s.bandLabel}>ДЛЯ АВТОРОВ</div>
            <h2 className={s.bandTitle}>Превратите свой опыт в курс — и в доход</h2>
            <p className={s.bandText}>Загружайте уроки, устанавливайте цену и получайте до 70% с каждой продажи. Мы берём на себя оплату, хостинг видео и поддержку студентов.</p>
            <button className={s.bandBtn}>Начать преподавать →</button>
          </div>
          <div ref={bandStatsRef} className={s.bandStatsGrid}>
            {[
              { v: '70%', l: 'выплата автору' }, { v: '15 мин', l: 'на запуск курса' },
              { v: '₽1.2М', l: 'у топ-авторов в мес.' }, { v: '3 800', l: 'авторов на платформе' },
            ].map(st => (
              <div key={st.l} className={`${s.bandStatCard} reveal-item`}>
                <div className={s.bandStatValue}>{st.v}</div>
                <div className={s.bandStatLabel}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
    {authMode && (
      <AuthModal
        mode={authMode}
        onClose={() => setAuthMode(null)}
        onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    )}
    </>
  );
}
