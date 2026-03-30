export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
