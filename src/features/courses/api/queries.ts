import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from './coursesApi';
import { useAuthStore } from '../../auth/store/authStore';
import type { CoursesFilter } from '../types';

export function useCourses(params?: CoursesFilter) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.list(params),
  });
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () => coursesApi.featured(),
  });
}

export function useRecommendedCourses() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['courses', 'recommended'],
    queryFn: () => coursesApi.recommended(),
    enabled: isAuthenticated,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.get(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => coursesApi.categories(),
  });
}

export function useEnrollments() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => coursesApi.enrollments(),
    enabled: isAuthenticated,
  });
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.enroll(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}

export function useFavorites() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => coursesApi.favorites(),
    enabled: isAuthenticated,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.addFavorite(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.removeFavorite(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useUserStats() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => coursesApi.userStats(),
    enabled: isAuthenticated,
  });
}

export function useCertificates() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => coursesApi.certificates(),
    enabled: isAuthenticated,
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      coursesApi.completeLesson(courseId, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}
