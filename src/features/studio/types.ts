export interface StudioLesson {
  id: number | string;
  name: string;
  type?: 'video' | 'quiz' | 'text';
  duration: string;
  is_free: boolean;
  status?: 'ready' | 'draft';
}

export interface StudioModule {
  id?: string;
  title: string;
  duration?: string;
  lessons_count?: number;
  lessons: StudioLesson[];
}

export interface StudioCourse {
  id: number | string;
  title: string;
  subtitle?: string;
  category: string;
  category_id?: number;
  level: string;
  description?: string;
  price: number;
  old_price: number | null;
  is_free?: boolean;
  status?: 'published' | 'draft';
  modules: StudioModule[];
  students_count: number;
  rating: number;
}

export interface StudioStats {
  revenue_30d: number;
  new_students_30d: number;
  total_students: number;
  avg_rating: number;
}

export interface StudioStudent {
  user_id: string;
  name: string;
  initials: string;
  course: string;
  progress: number;
  last_active: string;
}

export interface StudioIncome {
  available: number;
  revenue_month: number;
  sales_month: number;
  next_payout_date: string;
}

export interface StudioPayout {
  id: string;
  period: string;
  date: string;
  method: string;
  amount: number;
  status: string;
}

export interface StudioReview {
  id: string;
  name: string;
  initials: string;
  course: string;
  rating: number;
  text: string;
  when: string;
  reply: string | null;
}
