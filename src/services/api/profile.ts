import { apiClient } from './client';
import { User } from '../../generated/client';

export type ProfileUpdateInput = Pick<User, 'name' | 'email'>;

export const profileService = {
  get: () => apiClient.get<Omit<User, 'hashedPassword'>>('/api/profile'),
  update: (data: ProfileUpdateInput) => apiClient.patch<Omit<User, 'hashedPassword'>>('/api/profile', data),
  delete: () => apiClient.delete('/api/profile'),
};
