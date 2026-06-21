import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCourses, useCategories } from '../features/courses/api/queries';
import type { CoursesFilter } from '../features/courses/types';
import CourseCard from '../shared/components/CourseCard';
import s from './Catalog.module.css';

const LEVELS = ['Любой', 'Новичкам', 'Продвинутый'] as const;
const SORT_OPTIONS = [
  { value: 'популярные', label: 'Популярные' },
  { value: 'новые', label: 'Новые' },
  { value: 'по цене', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
  { value: 'по рейтингу', label: 'По рейтингу' },
] as const;

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    initialCategory ? new Set([initialCategory]) : new Set(),
  );
  const [searchQuery, _setSearchQuery] = useState(initialSearch);
  const [level, setLevel] = useState<string>('');
  const [ratingMin, setRatingMin] = useState<number | undefined>();
  const [sort, setSort] = useState('популярные');
  const [page, setPage] = useState(1);

  const filter: CoursesFilter = {
    ...(selectedCategories.size > 0 && { category: [...selectedCategories].join(',') }),
    ...(level && level !== 'Любой' && { level }),
    ...(ratingMin && { rating_min: ratingMin }),
    ...(searchQuery && { search: searchQuery }),
    sort,
    page,
    per_page: 12,
  };

  const { data: coursesData, isLoading } = useCourses(filter);
  const { data: categoriesData } = useCategories();

  const courses = coursesData?.data ?? [];
  const pagination = coursesData?.pagination;
  const categories = categoriesData?.data ?? [];

  const toggleCategory = useCallback((name: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    setPage(1);
  }, []);

  const activeFilters: string[] = [];
  if (selectedCategories.size > 0) activeFilters.push(...selectedCategories);
  if (ratingMin) activeFilters.push(`★ ${ratingMin}+`);

  const removeFilter = (f: string) => {
    if (f.startsWith('★')) {
      setRatingMin(undefined);
    } else {
      setSelectedCategories(prev => {
        const next = new Set(prev);
        next.delete(f);
        return next;
      });
    }
    setPage(1);
  };


  return (
    <main className={s.wrapper}>
      <div className={s.header}>
        <div className={s.breadcrumb}>Каталог</div>
        <h1 className={s.title}>Все курсы</h1>
        <p className={s.subtitle}>
          {pagination ? `${pagination.total} курсов` : 'Загрузка…'}
        </p>
      </div>

      <div className={`${s.catalogGrid} lq-catalog`}>
        <aside className={`${s.sidebar} lq-filters`}>
          <div className={s.filterCard}>
            <div className={s.filterTitle}>Категория</div>
            <div className={s.filterList}>
              {categories.map(cat => (
                <label key={cat.id} className={s.filterLabel} onClick={() => toggleCategory(cat.name)}>
                  <span className={`${s.checkbox} ${selectedCategories.has(cat.name) ? s.checkboxOn : s.checkboxOff}`}>
                    {selectedCategories.has(cat.name) ? '✓' : ''}
                  </span>
                  <span className={s.filterName}>{cat.name}</span>
                  <span className={s.filterCount}>{cat.courses_count}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={s.filterCard}>
            <div className={s.filterTitle}>Уровень</div>
            <div className={s.filterList}>
              {LEVELS.map(lvl => (
                <label key={lvl} className={s.filterLabel} onClick={() => { setLevel(lvl === 'Любой' ? '' : lvl); setPage(1); }}>
                  <span className={`${s.radioOuter} ${(lvl === 'Любой' && !level) || level === lvl ? s.radioActive : s.radioInactive}`}>
                    {((lvl === 'Любой' && !level) || level === lvl) && <span className={s.radioDot} />}
                  </span>{lvl}
                </label>
              ))}
            </div>
          </div>
          <div className={s.filterCard}>
            <div className={s.filterTitle}>Рейтинг</div>
            <div className={s.filterList}>
              {[4.5, 4.0].map(r => (
                <label key={r} className={s.filterLabel} onClick={() => { setRatingMin(ratingMin === r ? undefined : r); setPage(1); }}>
                  <span className={`${s.checkbox} ${ratingMin === r ? s.checkboxOn : s.checkboxOff}`}>
                    {ratingMin === r ? '✓' : ''}
                  </span>
                  <span className={s.starColor}>★ {r}</span> и выше
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className={`${s.catbar} lq-catbar`}>
            <div className={s.tagsRow}>
              {activeFilters.map(tag => (
                <span key={tag} className={s.tag} onClick={() => removeFilter(tag)}>{tag} ✕</span>
              ))}
            </div>
            <select
              className={s.sortBtn}
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>Сортировка: {o.label}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#8e8d99' }}>Загрузка курсов…</div>
          ) : courses.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#8e8d99' }}>Курсы не найдены</div>
          ) : (
            <div className={`${s.courseGrid} lq-grid-3`}>
              {courses.map(c => <CourseCard key={c.id} course={c} showLevel />)}
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: p === page ? '#5d4ee6' : '#f5f5fa',
                    color: p === page ? '#fff' : '#1a1a2e',
                    cursor: 'pointer',
                    fontWeight: p === page ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
