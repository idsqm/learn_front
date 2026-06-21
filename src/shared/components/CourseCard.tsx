import { useNavigate } from 'react-router-dom';
import type { CourseListItem } from '../../features/courses/types';
import { fmtPrice, fmtRating, fmtNumber, fmtHours } from '../utils/format';
import s from './CourseCard.module.css';

interface Props {
  course: CourseListItem;
  showLevel?: boolean;
  showStudents?: boolean;
  compact?: boolean;
}

export default function CourseCard({ course: c, showLevel, showStudents, compact }: Props) {
  const navigate = useNavigate();

  return (
    <article className={s.card} onClick={() => navigate(`/course/${c.id}`)}>
      <div className={s.thumb} style={{ backgroundImage: `linear-gradient(135deg, ${c.color_1}, ${c.color_2})` }}>
        <span className={s.categoryBadge}>{c.category}</span>
        {c.tag && <span className={s.tagBadge}>{c.tag}</span>}
      </div>
      <div className={compact ? s.bodyCompact : s.body}>
        {!compact && (
          <div className={s.authorRow}>
            <div className={s.authorAvatar}>{c.initials}</div>
            <span className={s.authorName}>{c.author}</span>
          </div>
        )}
        <h3 className={compact ? s.titleCompact : s.title}>{c.title}</h3>
        <div className={s.meta}>
          <span className={s.star}>★</span>
          <span className={s.ratingVal}>{fmtRating(c.rating)}</span>
          {!compact && <><span>({fmtNumber(c.reviews_count)})</span><span>·</span><span>{fmtHours(c.hours)}</span></>}
          {compact && <><span>·</span><span>{fmtHours(c.hours)}</span></>}
          {showLevel && <><span>·</span><span>{c.level}</span></>}
        </div>
        <div className={compact ? s.priceRowCompact : s.priceRow}>
          <div>
            <span className={compact ? s.priceCompact : s.price}>{fmtPrice(c.price)} ₽</span>
            {c.old_price && <span className={s.oldPrice}>{fmtPrice(c.old_price)} ₽</span>}
          </div>
          {showStudents && <span className={s.secondary}>{fmtNumber(c.students_count)} учатся</span>}
          {showLevel && !showStudents && <span className={s.secondary}>{c.level}</span>}
        </div>
      </div>
    </article>
  );
}
