import { User, AuthResponse } from '@/types/auth';

// Utility for simulating API latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USER: User = {
  id: 'usr_mock_123',
  name: 'Demo User',
  phone: '+8801700000000',
  email: 'demo@example.com',
  createdAt: new Date().toISOString(),
};

const MOCK_TOKEN = 'mock_jwt_token_xyz_789';

export const mockAuthService = {
  /**
   * Simulates sending an OTP to a phone number.
   * In this mock, it just returns true.
   */
  sendOtp: async (phone: string): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    
    // Basic validation
    if (!phone || phone.length < 10) {
      throw new Error('Please enter a valid phone number');
    }

    // Always succeed
    return {
      success: true,
      message: `OTP sent to ${phone} (Use 123456 to login)`,
    };
  },

  /**
   * Verifies the OTP.
   * Hardcoded validation: 123456
   */
  verifyOtp: async (phone: string, otp: string): Promise<AuthResponse> => {
    await delay(1200);

    if (otp !== '123456') {
      throw new Error('Invalid OTP code. Please use 123456');
    }

    return {
      user: {
        ...MOCK_USER,
        phone,
        name: 'Mobile User',
      },
      token: MOCK_TOKEN,
    };
  },

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
