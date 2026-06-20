import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './authApi';
import { useAuthStore } from '../store/authStore';

export function useSessions() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => authApi.getSessions(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useEndSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authApi.logout(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
