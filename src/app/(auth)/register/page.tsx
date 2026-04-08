'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Something went wrong');
      }

      toast.success('Account created! Please login.');
      router.push('/login/email');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-950">
      <Card className="w-full max-w-md p-6 md:p-8 space-y-8 fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
            Create Account
          </h1>
          <p className="text-surface-500">
            Join Daily Expense Manager today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Full Name
            </label>
            <Input
              icon={<User className="w-4 h-4" />}
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Email Address
            </label>
            <Input
              type="email"
              icon={<Mail className="w-4 h-4" />}
              placeholder="name@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Password
            </label>
            <Input
              type="password"
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Confirm Password
            </label>
            <Input
              type="password"
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <Button 
            className="w-full py-6 text-lg font-semibold mt-4" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <>
                Register Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-surface-500">
            Already have an account?{' '}
            <Link 
              href="/login/email" 
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
