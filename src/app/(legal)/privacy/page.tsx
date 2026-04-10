'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Database, Eye, Globe, UserX, Clock, KeyRound, RefreshCw, Mail } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    content: (
      <>
        <p className="mb-3">When you use Daily Expense Manager, we collect:</p>
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
            <span><strong className="font-medium" style={{ color: 'var(--text-primary)' }}>Account information:</strong> Your name, email address, and profile picture provided by Google when you sign in.</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
            <span><strong className="font-medium" style={{ color: 'var(--text-primary)' }}>Financial data:</strong> Transaction records, categories, and book information that you voluntarily enter.</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    content: (
      <ul className="space-y-2">
        <li className="flex gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
          <span>Provide and maintain the expense tracking service</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
          <span>Authenticate your identity</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
          <span>Display your transaction history and reports</span>
        </li>
      </ul>
    ),
  },
  {
    icon: ShieldCheck,
    title: '3. Data Storage & Security',
    content:
      'Your data is stored securely in our database. We use industry-standard security measures including encrypted connections (HTTPS) and secure authentication via Google OAuth.',
  },
  {
    icon: Globe,
    title: '4. Third-Party Services',
    content:
      'We use Google OAuth for authentication. Google may collect information as described in their privacy policy. We do not integrate any other third-party analytics or tracking services.',
  },
  {
    icon: UserX,
    title: '5. Data Sharing',
    content:
      'We do not sell, trade, or share your personal or financial data with third parties. Your data is only accessible to you through your authenticated session.',
  },
  {
    icon: Clock,
    title: '6. Data Retention',
    content:
      'Your data is retained as long as your account is active. You may request deletion of your account and associated data at any time.',
  },
  {
    icon: KeyRound,
    title: '7. Your Rights',
    content: (
      <ul className="space-y-2">
        <li className="flex gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
          <span>Access all data stored in your account</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
          <span>Export your data</span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2" />
          <span>Request deletion of your account and data</span>
        </li>
      </ul>
    ),
  },
  {
    icon: RefreshCw,
    title: '8. Changes to This Policy',
    content:
      'We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated date.',
  },
  {
    icon: Mail,
    title: '9. Contact',
    content:
      'If you have questions about this privacy policy, please reach out through the application.',
  },
];

export default function PrivacyPage() {
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
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Privacy Policy
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
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {section.content}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
