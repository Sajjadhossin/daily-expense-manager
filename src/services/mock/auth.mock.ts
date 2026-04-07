import { User, AuthResponse } from '@/types/auth';

// Utility for simulating API latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USER: User = {
  id: 'usr_mock_123',
  name: 'Demo User',
  email: 'demo@example.com',
  createdAt: new Date().toISOString(),
};

const MOCK_TOKEN = 'mock_jwt_token_xyz_789';

export const mockAuthService = {
  /**
   * Simulates login with email and password.
   * Always succeeds for demo purposes unless left empty.
   */
  loginWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(1200);

    if (!email || !password) {
      throw new Error('Please provide email and password');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    return {
      user: {
        ...MOCK_USER,
        email,
        name: email.split('@')[0] || 'Email User',
      },
      token: MOCK_TOKEN,
    };
  },
};
