'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Mail } from 'lucide-react';

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

      {/* Auth Button — Email Only */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-3"
      >
        <Link
          href="/login/email"
          className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-2xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98] transition-all touch-target"
        >
          <Mail className="w-5 h-5" />
          Continue with Email
        </Link>
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
