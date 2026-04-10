'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, PieChart, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
import { useTransactions } from '@/lib/hooks/use-transactions';

const steps = [
  {
    icon: Sparkles,
    title: 'Welcome!',
    description: 'Daily Expense Manager helps you track every taka you earn and spend. Let\'s get you set up in 3 quick steps.',
    color: 'gradient-primary',
  },
  {
    icon: BookOpen,
    title: 'Your Cash Book',
    description: 'We\'ve created a "Personal Wallet" for you. Think of it as a ledger — all your transactions go here. You can create more books later.',
    color: 'bg-primary-500',
  },
  {
    icon: Plus,
    title: 'Add Transactions',
    description: 'Tap the + button to log income or expenses. Pick a category, enter the amount, and you\'re done. It takes 5 seconds.',
    color: 'bg-income-500',
  },
  {
    icon: PieChart,
    title: 'Track & Analyze',
    description: 'Check your dashboard for a quick overview, or dive into Reports and Summary for detailed charts and breakdowns.',
    color: 'bg-accent-500',
  },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { completed, markCompleted } = useOnboardingStore();
  const { activeBookId, setActiveBook } = useBookStore();
  const { data: books } = useBooks();
  const { data: transactions } = useTransactions(activeBookId);

  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Wait for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-set active book if not set
  useEffect(() => {
    if (!activeBookId && books && books.length > 0) {
      setActiveBook(books[0].id);
    }
  }, [activeBookId, books, setActiveBook]);

  // Don't show if already completed, not mounted, or user has transactions
  if (!mounted || completed) return null;
  if (transactions && transactions.length > 0) {
    markCompleted();
    return null;
  }

  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      markCompleted();
      router.push('/transactions/add');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    markCompleted();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full sm:max-w-md mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Header illustration */}
        <div className={`${step.color} p-8 pb-10 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <motion.div
            key={currentStep}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <step.icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{step.title}</h2>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-sm leading-relaxed mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              {step.description}
            </motion.p>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-6 bg-primary-500'
                    : i < currentStep
                    ? 'w-1.5 bg-primary-300'
                    : 'w-1.5 bg-surface-200 dark:bg-surface-700'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary-500/25"
            >
              {isLastStep ? (
                <>
                  Add First Transaction
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
