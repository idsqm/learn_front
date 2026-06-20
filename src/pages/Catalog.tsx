import { courses, filterCats } from '../data/mockData';
import CourseCard from '../shared/components/CourseCard';
import s from './Catalog.module.css';

export default function Catalog() {
  return (
    <main className={s.wrapper}>
      <div className={s.header}>
        <div className={s.breadcrumb}>Каталог</div>
        <h1 className={s.title}>Все курсы</h1>
        <p className={s.subtitle}>{courses.length} курсов · обновлено сегодня</p>
      </div>

      <div className={`${s.catalogGrid} lq-catalog`}>
        <aside className={`${s.sidebar} lq-filters`}>
          <div className={s.filterCard}>
            <div className={s.filterTitle}>Категория</div>
            <div className={s.filterList}>
              {filterCats.map(f => (
                <label key={f.n} className={s.filterLabel}>
                  <span className={`${s.checkbox} ${f.on ? s.checkboxOn : s.checkboxOff}`}>{f.on ? '✓' : ''}</span>
                  <span className={s.filterName}>{f.n}</span>
                  <span className={s.filterCount}>{f.cnt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={s.filterCard}>
            <div className={s.filterTitle}>Уровень</div>
            <div className={s.filterList}>
              {['Любой', 'Новичкам', 'Продвинутый'].map((lvl, i) => (
                <label key={lvl} className={s.filterLabel}>
                  <span className={`${s.radioOuter} ${i === 0 ? s.radioActive : s.radioInactive}`}>
                    {i === 0 && <span className={s.radioDot} />}
                  </span>{lvl}
                </label>
              ))}
            </div>
          </div>
          <div className={s.filterCard}>
            <div className={s.filterTitle}>Цена, ₽</div>
            <div className={s.priceTrack}>
              <div className={s.priceRange} />
              <div className={`${s.priceThumb} ${s.priceThumbLeft}`} />
              <div className={`${s.priceThumb} ${s.priceThumbRight}`} />
            </div>
            <div className={s.priceLabels}><span>990 ₽</span><span>3 200 ₽</span></div>
          </div>
          <div className={s.filterCard}>
            <div className={s.filterTitle}>Рейтинг</div>
            <div className={s.filterList}>
              {['4.5', '4.0'].map(r => (
                <label key={r} className={s.filterLabel}>
                  <span className={s.ratingCheckbox} />
                  <span className={s.starColor}>★ {r}</span> и выше
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className={`${s.catbar} lq-catbar`}>
            <div className={s.tagsRow}>
              {['Все категории', '★ 4.5+'].map(tag => (
                <span key={tag} className={s.tag}>{tag} ✕</span>
              ))}
            </div>
            <button className={s.sortBtn}>Сортировка: Популярные ▾</button>
          </div>
          <div className={`${s.courseGrid} lq-grid-3`}>
            {courses.map(c => <CourseCard key={c.id} course={c} showLevel />)}
          </div>
        </div>
      </div>
    </main>
  );
}
