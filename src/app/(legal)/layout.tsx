'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Daily Expense Manager
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto px-4 py-8 pb-16"
      >
        {children}
      </motion.div>
    </div>
  );
}
