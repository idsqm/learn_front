export interface Course {
  id: number;
  title: string;
  author: string;
  initials: string;
  category: string;
  level: string;
  price: string;
  oldPrice: string;
  rating: string;
  reviews: string;
  students: string;
  hours: string;
  lessons: string;
  c1: string;
  c2: string;
  tag: string;
}

export const courses: Course[] = [
  { id: 1, title: 'Цифровая фотография с нуля', author: 'Анна Корнева', initials: 'АК', category: 'Фотография', level: 'Новичкам', price: '2 990', oldPrice: '4 990', rating: '4.9', reviews: '1 284', students: '8 940', hours: '12 ч', lessons: '64', c1: '#6a5cf0', c2: '#9183f7', tag: 'Бестселлер' },
  { id: 2, title: 'Гитара: первые аккорды', author: 'Игорь Лебедев', initials: 'ИЛ', category: 'Музыка', level: 'Новичкам', price: '1 990', oldPrice: '', rating: '4.8', reviews: '642', students: '5 120', hours: '9 ч', lessons: '48', c1: '#149c95', c2: '#3fc6bb', tag: 'Новинка' },
  { id: 3, title: 'Акварель для удовольствия', author: 'Мария Светлова', initials: 'МС', category: 'Искусство', level: 'Любой', price: '2 490', oldPrice: '', rating: '4.9', reviews: '905', students: '4 380', hours: '7 ч', lessons: '40', c1: '#e0568f', c2: '#f291b7', tag: '' },
  { id: 4, title: 'Домашний бариста', author: 'Павел Громов', initials: 'ПГ', category: 'Кулинария', level: 'Новичкам', price: '1 490', oldPrice: '2 290', rating: '4.7', reviews: '388', students: '2 970', hours: '5 ч', lessons: '28', c1: '#c2772e', c2: '#e0a35c', tag: 'Популярное' },
  { id: 5, title: 'Основы шахмат', author: 'Сергей Дронов', initials: 'СД', category: 'Логика', level: 'Любой', price: '990', oldPrice: '', rating: '4.8', reviews: '510', students: '3 640', hours: '6 ч', lessons: '35', c1: '#4f5b76', c2: '#7886a3', tag: '' },
  { id: 6, title: 'Каллиграфия и леттеринг', author: 'Ольга Веер', initials: 'ОВ', category: 'Искусство', level: 'Новичкам', price: '2 290', oldPrice: '', rating: '4.9', reviews: '720', students: '2 510', hours: '8 ч', lessons: '44', c1: '#7b5cf0', c2: '#a892f8', tag: '' },
  { id: 7, title: 'Городское садоводство', author: 'Лидия Ким', initials: 'ЛК', category: 'Хобби', level: 'Новичкам', price: '1 790', oldPrice: '', rating: '4.6', reviews: '256', students: '1 880', hours: '5 ч', lessons: '30', c1: '#3f9b5e', c2: '#6cc187', tag: '' },
  { id: 8, title: 'Мобильная съёмка видео', author: 'Артём Соколов', initials: 'АС', category: 'Видео', level: 'Любой', price: '2 690', oldPrice: '3 990', rating: '4.8', reviews: '612', students: '4 020', hours: '10 ч', lessons: '52', c1: '#5d4ee6', c2: '#8a7af0', tag: 'Бестселлер' },
];

export const categories = [
  { n: 'Фотография', m: 'Ph', cnt: '128', ic: '#6a5cf0' },
  { n: 'Музыка', m: 'Mu', cnt: '96', ic: '#149c95' },
  { n: 'Искусство', m: 'Ar', cnt: '154', ic: '#e0568f' },
  { n: 'Кулинария', m: 'Co', cnt: '72', ic: '#c2772e' },
  { n: 'Видео', m: 'Vi', cnt: '88', ic: '#5d4ee6' },
  { n: 'Дизайн', m: 'De', cnt: '140', ic: '#7b5cf0' },
  { n: 'Бизнес', m: 'Bu', cnt: '110', ic: '#4f5b76' },
  { n: 'Хобби', m: 'Ho', cnt: '64', ic: '#3f9b5e' },
];

export const filterCats = [
  { n: 'Фотография', cnt: '128', on: true },
  { n: 'Музыка', cnt: '96', on: false },
  { n: 'Искусство', cnt: '154', on: true },
  { n: 'Кулинария', cnt: '72', on: false },
  { n: 'Видео', cnt: '88', on: false },
  { n: 'Логика', cnt: '46', on: false },
];

export const learnItems = [
  'Снимать в ручном режиме и не бояться настроек',
  'Выстраивать композицию кадра по правилам и без',
  'Работать со светом в любых условиях',
  'Снимать портрет, репортаж и предметку',
  'Обрабатывать фото в Lightroom от и до',
  'Собрать сильное портфолио для заказов',
];

export interface CurriculumModule {
  t: string;
  d: string;
  expanded: boolean;
  lessons: { n: string; d: string; free: boolean }[] | null;
}

export const curriculum: CurriculumModule[] = [
  {
    t: 'Модуль 1 · Знакомство с камерой', d: '5 уроков · 58 мин', expanded: true,
    lessons: [
      { n: 'Как устроена камера', d: '08:24', free: true },
      { n: 'Режимы съёмки: P, A, S, M', d: '12:10', free: true },
      { n: 'Экспозиция простыми словами', d: '14:30', free: false },
      { n: 'ISO, выдержка, диафрагма', d: '13:05', free: false },
      { n: 'Практика: первые кадры', d: '09:40', free: false },
    ],
  },
  { t: 'Модуль 2 · Свет и композиция', d: '7 уроков · 1 ч 12 мин', expanded: false, lessons: null },
  { t: 'Модуль 3 · Портрет и репортаж', d: '9 уроков · 1 ч 40 мин', expanded: false, lessons: null },
  { t: 'Модуль 4 · Обработка фотографий', d: '6 уроков · 1 ч 05 мин', expanded: false, lessons: null },
];

export const courseIncludes = [
  '12 часов видео по запросу',
  '64 урока и материалы для скачивания',
  'Доступ навсегда — учитесь в своём темпе',
  'Сертификат об окончании',
  'Доступ с телефона и компьютера',
];

export const courseReviews = [
  { name: 'Дмитрий П.', initials: 'ДП', text: 'За месяц прошёл путь от «авто» до съёмки в ручном режиме. Очень практично и совсем без воды.' },
  { name: 'Елена С.', initials: 'ЕС', text: 'Анна объясняет сложное простым языком, всё на реальных кадрах. Уже снимаю на заказ!' },
];

export const dashStats = [
  { v: '3', l: 'Курса в процессе' },
  { v: '27 ч', l: 'Время обучения' },
  { v: '2', l: 'Сертификата' },
  { v: '9 дней', l: 'Серия обучения' },
];

export interface EnrolledCourse extends Course {
  progress: number;
  done: number;
  total: number;
  last: string;
  completed: boolean;
}

export const enrolledCourses: EnrolledCourse[] = [
  { ...courses[0], progress: 65, done: 42, total: 64, last: 'Урок 43 · Контровый свет', completed: false },
  { ...courses[7], progress: 30, done: 16, total: 52, last: 'Урок 17 · Стабилизация в кадре', completed: false },
  { ...courses[3], progress: 100, done: 28, total: 28, last: 'Курс завершён', completed: true },
];
