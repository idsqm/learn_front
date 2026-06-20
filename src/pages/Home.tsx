import { useNavigate } from 'react-router-dom';
import { courses, categories } from '../data/mockData';
import CourseCard from '../shared/components/CourseCard';
import Footer from '../shared/components/Footer';
import s from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const featured = courses.slice(0, 4);

  return (
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
              <button className={s.btnSecondary}>Стать автором</button>
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
        <div className={`${s.categoriesGrid} lq-grid-4`}>
          {categories.map(cat => (
            <div key={cat.n} onClick={() => navigate('/catalog')} className={s.categoryCard}>
              <div className={s.categoryIcon} style={{
                background: cat.ic + '1f', color: cat.ic,
              }}>{cat.m}</div>
              <div className={s.categoryInfo}>
                <div className={s.categoryName}>{cat.n}</div>
                <div className={s.categoryCount}>{cat.cnt} курсов</div>
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
        <div className={`${s.featuredGrid} lq-grid-4`}>
          {featured.map(c => <CourseCard key={c.id} course={c} showStudents showLevel />)}
        </div>
      </section>

      <section className={s.bandSection}>
        <div className={`${s.bandInner} lq-band`}>
          <div className={s.bandGlow} />
          <div className={s.bandContent}>
            <div className={s.bandLabel}>ДЛЯ АВТОРОВ</div>
            <h2 className={s.bandTitle}>Превратите свой опыт в курс — и в доход</h2>
            <p className={s.bandText}>Загружайте уроки, устанавливайте цену и получайте до 70% с каждой продажи. Мы берём на себя оплату, хостинг видео и поддержку студентов.</p>
            <button className={s.bandBtn}>Начать преподавать →</button>
          </div>
          <div className={s.bandStatsGrid}>
            {[
              { v: '70%', l: 'выплата автору' }, { v: '15 мин', l: 'на запуск курса' },
              { v: '₽1.2М', l: 'у топ-авторов в мес.' }, { v: '3 800', l: 'авторов на платформе' },
            ].map(st => (
              <div key={st.l} className={s.bandStatCard}>
                <div className={s.bandStatValue}>{st.v}</div>
                <div className={s.bandStatLabel}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
