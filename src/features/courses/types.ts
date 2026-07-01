export interface CourseListItem {
  id: string;
  title: string;
  author: string;
  initials: string;
  category: string;
  level: string;
  price: number;
  old_price: number | null;
  rating: number;
  reviews_count: number;
  students_count: number;
  hours: number;
  lessons_count: number;
  color_1: string;
  color_2: string;
  tag: string | null;
  preview_url?: string | null;
}

export interface Lesson {
  id: string;
  name: string;
  duration: string;
  is_free: boolean;
}

export interface Module {
  title: string;
  duration: string;
  lessons_count: number;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  name: string;
  initials: string;
  text: string;
  rating: number;
}

export interface AuthorInfo {
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  bio: string;
  courses_count: number;
  years_experience: number;
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  old_price: number | null;
  rating: number;
  reviews_count: number;
  students_count: number;
  hours: number;
  lessons_count: number;
  color_1: string;
  color_2: string;
  tag: string | null;
  preview_url: string | null;
  learn_items: string[];
  curriculum: Module[];
  includes: string[];
  reviews: Review[];
  author: AuthorInfo;
}

export interface Category {
  id: string;
  name: string;
  abbreviation: string;
  courses_count: number;
  color: string;
}

export interface EnrolledCourse {
  course: CourseListItem;
  progress: number;
  done_lessons: number;
  total_lessons: number;
  last_lesson: string | null;
  completed: boolean;
}

export interface Certificate {
  id: string;
  course_id: string;
  course_name: string;
  issued_at: string;
}

export interface CourseProgress {
  course_id: string;
  progress: number;
  done_lessons: number;
  total_lessons: number;
  completed: boolean;
}

export interface UserStats {
  courses_in_progress: number;
  total_study_time: number;
  certificates_count: number;
  study_streak_days: number;
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface CoursesFilter {
  category?: string;
  level?: string;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  sort?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
