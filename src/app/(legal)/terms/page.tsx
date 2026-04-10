'use client';

import { motion } from 'framer-motion';
import { ScrollText, UserCheck, Shield, AlertTriangle, Scale, RefreshCw, Mail, BookOpen } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

const sections = [
  {
    icon: ScrollText,
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using Daily Expense Manager, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.',
  },
  {
    icon: BookOpen,
    title: '2. Description of Service',
    content:
      'Daily Expense Manager is a personal finance tracking application that allows you to record income and expenses, organize transactions into books, and generate reports. The service is provided as-is for personal use.',
  },
  {
    icon: UserCheck,
    title: '3. User Accounts',
    content:
      'You may sign in using your Google account. You are responsible for maintaining the security of your account and for all activities that occur under your account.',
  },
  {
    icon: Shield,
    title: '4. User Data',
    content:
      'You retain ownership of all data you enter into the application. We do not sell or share your financial data with third parties. Your data is stored securely and used solely to provide you with the service.',
  },
  {
    icon: AlertTriangle,
    title: '5. Acceptable Use',
    content:
      'You agree not to use the service for any illegal purpose, attempt to gain unauthorized access to the service or its systems, or interfere with the proper functioning of the service.',
  },
  {
    icon: Scale,
    title: '6. Disclaimer & Liability',
    content:
      'The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free. This application is not a substitute for professional financial advice. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages.',
  },
  {
    icon: RefreshCw,
    title: '7. Changes to Terms',
    content:
      'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.',
  },
  {
    icon: Mail,
    title: '8. Contact',
    content:
      'If you have questions about these terms, please reach out through the application.',
  },
];

export default function TermsPage() {
  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-10 mb-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <ScrollText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-white/70 text-sm">
            Last updated: April 10, 2026
          </p>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rounded-2xl border p-5 md:p-6 transition-colors hover:border-primary-200 dark:hover:border-primary-800/50"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                  {section.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {section.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
