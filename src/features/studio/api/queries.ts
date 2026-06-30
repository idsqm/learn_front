import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApi } from './studioApi';
import { useAuthStore } from '../../auth/store/authStore';
import type { CreateCoursePayload, LessonType, LessonContentPayload, SaveQuizQuestionPayload } from './studioApi';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => studioApi.listCategories(),
  });
}

export function useStudioCourses() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['studio', 'courses'],
    queryFn: () => studioApi.listCourses(),
    enabled: isAuthenticated,
  });
}

export function useStudioCourse(id: string) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['studio', 'course', id],
    queryFn: () => studioApi.getCourse(id),
    enabled: isAuthenticated && !!id,
  });
}

export function useStudioStats() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['studio', 'stats'],
    queryFn: () => studioApi.getStats(),
    enabled: isAuthenticated,
  });
}

export function useStudioStudents() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['studio', 'students'],
    queryFn: () => studioApi.getStudents(),
    enabled: isAuthenticated,
  });
}

export function useStudioIncome() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['studio', 'income'],
    queryFn: () => studioApi.getIncome(),
    enabled: isAuthenticated,
  });
}

export function useStudioPayouts() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['studio', 'payouts'],
    queryFn: () => studioApi.getPayouts(),
    enabled: isAuthenticated,
  });
}

export function useStudioReviews() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['studio', 'reviews'],
    queryFn: () => studioApi.getReviews(),
    enabled: isAuthenticated,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => studioApi.createCourse(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCoursePayload> }) =>
      studioApi.updateCourse(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function usePublishCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioApi.publishCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useUnpublishCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioApi.unpublishCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, title, sort_order }: { courseId: string; title: string; sort_order?: number }) =>
      studioApi.createModule(courseId, { title, sort_order }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useCreateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, payload }: { courseId: string; moduleId: string; payload: { name: string; type: LessonType; is_free?: boolean; sort_order?: number } }) =>
      studioApi.createLesson(courseId, moduleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useUpdateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, payload }: { courseId: string; moduleId: string; payload: { title?: string; sort_order?: number } }) =>
      studioApi.updateModule(courseId, moduleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId }: { courseId: string; moduleId: string }) =>
      studioApi.deleteModule(courseId, moduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useUpdateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId, payload }: { courseId: string; lessonId: string; payload: { name?: string; type?: LessonType; is_free?: boolean; sort_order?: number } }) =>
      studioApi.updateLesson(courseId, lessonId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useDeleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      studioApi.deleteLesson(courseId, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio'] });
    },
  });
}

export function useLessonDetail(courseId: string, lessonId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['studio', 'lesson', courseId, lessonId, 'detail'],
    queryFn: () => studioApi.getLessonDetail(courseId, lessonId),
    enabled: enabled && !!courseId && !!lessonId,
  });
}

export function useSaveLessonContent() {
  return useMutation({
    mutationFn: ({ courseId, lessonId, payload }: { courseId: string; lessonId: string; payload: LessonContentPayload }) =>
      studioApi.saveLessonContent(courseId, lessonId, payload),
  });
}

export function useCreateQuestion() {
  return useMutation({
    mutationFn: ({ courseId, lessonId, payload }: { courseId: string; lessonId: string; payload: SaveQuizQuestionPayload }) =>
      studioApi.createQuestion(courseId, lessonId, payload),
  });
}

export function useUpdateQuestion() {
  return useMutation({
    mutationFn: ({ courseId, questionId, payload }: { courseId: string; questionId: string; payload: SaveQuizQuestionPayload }) =>
      studioApi.updateQuestion(courseId, questionId, payload),
  });
}

export function useDeleteQuestion() {
  return useMutation({
    mutationFn: ({ courseId, questionId }: { courseId: string; questionId: string }) =>
      studioApi.deleteQuestion(courseId, questionId),
  });
}

export function useReplyToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      studioApi.replyToReview(reviewId, reply),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio', 'reviews'] });
    },
  });
}
