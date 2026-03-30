'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/lib/store/auth.store';
import { mockAuthService } from '@/services/mock/auth.mock';

export default function EmailLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { user, token } = await mockAuthService.loginWithEmail(email, password);
      setAuth(user, token);
      
      // Set dummy cookie for middleware
      document.cookie = `dem-token=${token}; path=/; max-age=86400`;
      
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-6 border border-surface-200 dark:border-surface-700">
            <Mail className="w-8 h-8 text-surface-600 dark:text-surface-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
            Login with email
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Enter your email and password to access your cash books.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <Input 
              type="email"
              placeholder="Email address"
              icon={<Mail className="w-5 h-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <Input 
              type="password"
              placeholder="Password (min 6 chars)"
              icon={<Lock className="w-5 h-5" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2" 
            size="lg"
            isLoading={isLoading}
            variant="secondary"
          >
            Sign In
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
