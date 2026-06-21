import { coursesClient as apiClient } from '../../../shared/api/apiClient';
import type {
  CourseListItem,
  CourseDetail,
  Category,
  EnrolledCourse,
  Certificate,
  CourseProgress,
  UserStats,
  AuthorInfo,
  Pagination,
  CoursesFilter,
} from '../types';

export const coursesApi = {
  async list(params?: CoursesFilter) {
    const { data } = await apiClient.get<{ data: CourseListItem[]; pagination: Pagination }>('/courses', { params });
    return data;
  },

  async featured() {
    const { data } = await apiClient.get<{ data: CourseListItem[] }>('/courses/featured');
    return data;
  },

  async recommended() {
    const { data } = await apiClient.get<{ data: CourseListItem[] }>('/courses/recommended');
    return data;
  },

  async get(id: string) {
    const { data } = await apiClient.get<CourseDetail>(`/courses/${id}`);
    return data;
  },

  async categories() {
    const { data } = await apiClient.get<{ data: Category[] }>('/categories');
    return data;
  },

  async enroll(courseId: string) {
    const { data } = await apiClient.post<{ message: string }>(`/courses/${courseId}/enroll`);
    return data;
  },

  async enrollments() {
    const { data } = await apiClient.get<{ data: EnrolledCourse[] }>('/enrollments');
    return data;
  },

  async addFavorite(courseId: string) {
    const { data } = await apiClient.post<{ message: string }>(`/courses/${courseId}/favorite`);
    return data;
  },

  async removeFavorite(courseId: string) {
    const { data } = await apiClient.delete<{ message: string }>(`/courses/${courseId}/favorite`);
    return data;
  },

  async favorites() {
    const { data } = await apiClient.get<{ data: CourseListItem[] }>('/favorites');
    return data;
  },

  async completeLesson(courseId: string, lessonId: string) {
    const { data } = await apiClient.post<{ message: string }>(`/courses/${courseId}/lessons/${lessonId}/complete`);
    return data;
  },

  async courseProgress(courseId: string) {
    const { data } = await apiClient.get<CourseProgress>(`/courses/${courseId}/progress`);
    return data;
  },

  async userStats() {
    const { data } = await apiClient.get<UserStats>('/users/me/stats');
    return data;
  },

  async certificates() {
    const { data } = await apiClient.get<{ data: Certificate[] }>('/certificates');
    return data;
  },

  async certificate(id: string) {
    const { data } = await apiClient.get<Certificate>(`/certificates/${id}`);
    return data;
  },

  async createReview(courseId: string, review: { name: string; initials: string; text: string; rating: number }) {
    const { data } = await apiClient.post<{ message: string }>(`/courses/${courseId}/reviews`, review);
    return data;
  },

  async author(id: string) {
    const { data } = await apiClient.get<AuthorInfo>(`/authors/${id}`);
    return data;
  },

  async applyAsAuthor() {
    const { data } = await apiClient.post<{ message: string }>('/authors/apply');
    return data;
  },
};
