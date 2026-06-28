import { coursesClient as api } from '../../../shared/api/apiClient';
import type { StudioCourse, StudioStats, StudioStudent, StudioIncome, StudioPayout, StudioReview } from '../types';

export interface CreateCoursePayload {
  title: string;
  subtitle: string;
  category: string;
  level: string;
  description: string;
  price: number;
  old_price?: number | null;
  is_free: boolean;
}

export interface CreateModulePayload {
  title: string;
}

export interface CreateLessonPayload {
  name: string;
  type: 'video' | 'quiz' | 'text';
  is_free?: boolean;
}

export const studioApi = {
  async listCourses() {
    const { data } = await api.get<{ data: StudioCourse[] }>('/studio/courses');
    return data;
  },

  async createCourse(payload: CreateCoursePayload) {
    const { data } = await api.post<StudioCourse>('/studio/courses', payload);
    return data;
  },

  async updateCourse(id: string, payload: Partial<CreateCoursePayload>) {
    const { data } = await api.put<StudioCourse>(`/studio/courses/${id}`, payload);
    return data;
  },

  async deleteCourse(id: string) {
    const { data } = await api.delete<{ message: string }>(`/studio/courses/${id}`);
    return data;
  },

  async publishCourse(id: string) {
    const { data } = await api.post<{ message: string }>(`/studio/courses/${id}/publish`);
    return data;
  },

  async unpublishCourse(id: string) {
    const { data } = await api.post<{ message: string }>(`/studio/courses/${id}/unpublish`);
    return data;
  },

  async createModule(courseId: string, payload: CreateModulePayload) {
    const { data } = await api.post<{ id: string; title: string }>(`/studio/courses/${courseId}/modules`, payload);
    return data;
  },

  async updateModule(courseId: string, moduleId: string, payload: Partial<CreateModulePayload>) {
    const { data } = await api.put<{ message: string }>(`/studio/courses/${courseId}/modules/${moduleId}`, payload);
    return data;
  },

  async deleteModule(courseId: string, moduleId: string) {
    const { data } = await api.delete<{ message: string }>(`/studio/courses/${courseId}/modules/${moduleId}`);
    return data;
  },

  async createLesson(courseId: string, moduleId: string, payload: CreateLessonPayload) {
    const { data } = await api.post<{ id: string }>(`/studio/courses/${courseId}/modules/${moduleId}/lessons`, payload);
    return data;
  },

  async updateLesson(courseId: string, lessonId: string, payload: Partial<CreateLessonPayload>) {
    const { data } = await api.put<{ message: string }>(`/studio/courses/${courseId}/lessons/${lessonId}`, payload);
    return data;
  },

  async deleteLesson(courseId: string, lessonId: string) {
    const { data } = await api.delete<{ message: string }>(`/studio/courses/${courseId}/lessons/${lessonId}`);
    return data;
  },

  async getStats() {
    const { data } = await api.get<StudioStats>('/studio/stats');
    return data;
  },

  async getStudents() {
    const { data } = await api.get<{ data: StudioStudent[] }>('/studio/students');
    return data;
  },

  async getIncome() {
    const { data } = await api.get<StudioIncome>('/studio/income');
    return data;
  },

  async getPayouts() {
    const { data } = await api.get<{ data: StudioPayout[] }>('/studio/payouts');
    return data;
  },

  async getReviews() {
    const { data } = await api.get<{ data: StudioReview[] }>('/studio/reviews');
    return data;
  },

  async replyToReview(reviewId: string, reply: string) {
    const { data } = await api.post<{ message: string }>(`/studio/reviews/${reviewId}/reply`, { reply });
    return data;
  },
};
