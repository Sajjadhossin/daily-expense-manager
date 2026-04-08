import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, ProfileUpdateInput } from '@/services/api/profile';

export const PROFILE_QUERY_KEY = ['profile'];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileService.get,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdateInput) => profileService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
