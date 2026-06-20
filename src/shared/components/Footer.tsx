import s from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={`${s.footer} lq-footer`}>
      <div>
        <div className={s.brand}>
          <div className={s.brandIcon}>L</div>
          <span className={s.brandName}>LearnQuest</span>
        </div>
        <p className={s.tagline}>Платформа онлайн-курсов для тех, кто учится и учит.</p>
      </div>
      <div>
        <div className={s.groupTitle}>Платформа</div>
        <div className={s.groupLinks}><span>Каталог</span><span>Категории</span><span>Стать автором</span></div>
      </div>
      <div>
        <div className={s.groupTitle}>Компания</div>
        <div className={s.groupLinks}><span>О нас</span><span>Блог</span><span>Контакты</span></div>
      </div>
      <div>
        <div className={s.groupTitle}>Поддержка</div>
        <div className={s.groupLinks}><span>Помощь</span><span>Условия</span><span>Конфиденциальность</span></div>
      </div>
    </footer>
  );
}
