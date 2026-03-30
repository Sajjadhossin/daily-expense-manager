'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Smartphone, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/lib/store/auth.store';
import { mockAuthService } from '@/services/mock/auth.mock';

export default function MobileLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { setAuth } = useAuthStore();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await mockAuthService.sendOtp(phone);
      toast.success(res.message);
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const { user, token } = await mockAuthService.verifyOtp(phone, otp);
      setAuth(user, token);
      
      // Set dummy cookie for middleware
      document.cookie = `dem-token=${token}; path=/; max-age=86400`;
      
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8">
      {/* Back Button */}
      <button 
        onClick={() => step === 'otp' ? setStep('phone') : router.push('/')}
        className="flex items-center gap-1 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
                Continue with mobile
              </h1>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                We will send you a 6-digit OTP to verify your number.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-surface-50 text-sm font-medium text-surface-500 dark:border-surface-800 dark:bg-surface-900/50 dark:text-surface-400">
                    +880
                  </div>
                  <Input 
                    type="tel"
                    placeholder="17xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                isLoading={isLoading}
                disabled={!phone}
              >
                Send OTP
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-8">
               <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
                Verify phone
              </h1>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Code sent to <span className="font-medium text-surface-900 dark:text-surface-50">+880 {phone}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
                  Verification Code
                </label>
                <Input 
                  type="text"
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  className="text-center text-xl tracking-widest font-medium"
                />
                <p className="text-xs text-surface-500 mt-2">
                  For this demo, use <strong>123456</strong>
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                isLoading={isLoading}
                disabled={otp.length !== 6}
              >
                Verify & Login
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
