'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

export default function WelcomePage() {
  return (
    <div className="w-full max-w-sm mx-auto text-center py-12">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-3xl gradient-primary mx-auto flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Daily Expense
        </h1>
        <h2 className="text-lg font-semibold text-primary-600 dark:text-primary-400">
          Manager
        </h2>
        <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Track your income &amp; expenses with multiple cash books. Simple, fast, and powerful.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-4"
      >
        <button
          onClick={() => signIn('google')}
          className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 font-semibold text-sm border border-surface-200 dark:border-surface-700 shadow-sm hover:bg-surface-50 dark:hover:bg-surface-750 active:scale-[0.98] transition-all touch-target"
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-[1px] bg-surface-200 dark:bg-surface-800" />
          <span className="text-xs text-surface-500 font-medium">OR</span>
          <div className="flex-1 h-[1px] bg-surface-200 dark:bg-surface-800" />
        </div>

        <Link
          href="/login/email"
          className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-2xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98] transition-all touch-target"
        >
          <Mail className="w-5 h-5" />
          Continue with Email
        </Link>

        <div className="pt-2 text-center">
          <p className="text-sm text-surface-500">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Terms */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[11px] mt-8 leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        By continuing, you agree to our{' '}
        <span className="text-primary-600 dark:text-primary-400 underline cursor-pointer">
          Terms of Service
        </span>{' '}
        and{' '}
        <span className="text-primary-600 dark:text-primary-400 underline cursor-pointer">
          Privacy Policy
        </span>
      </motion.p>
    </div>
  );
}
