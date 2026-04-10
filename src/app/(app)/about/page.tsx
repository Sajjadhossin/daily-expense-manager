'use client';

import { motion } from 'framer-motion';
import { BookOpen, Code2, Globe, Mail, Heart, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

const techStack = [
  'Next.js 16', 'React 19', 'TypeScript', 'TailwindCSS 4',
  'Prisma', 'PostgreSQL', 'NextAuth.js', 'Zustand',
  'TanStack Query', 'Framer Motion', 'Radix UI', 'Recharts',
];

export default function AboutPage() {
  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl gradient-primary p-8 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Daily Expense Manager</h1>
          <p className="text-white/70 text-sm">Version 0.1.0</p>
        </div>
      </motion.div>

      {/* Developer */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border p-6 text-center"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <p className="text-xs uppercase font-semibold text-surface-400 tracking-wider mb-4">
          Developed by
        </p>
        <img
          src="/developer.jpg"
          alt="Sajjad Hossin"
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800"
        />
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
          Sajjad Hossin
        </h2>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-4">
          Software Engineer
        </p>

        <div className="flex items-center justify-center gap-3">
          <a
            href="https://sajjadhossin.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Portfolio
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/Sajjadhossin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <FaGithub className="w-4 h-4" />
            GitHub
          </a>
          <a
            href="mailto:sajjadhossin.cse@gmail.com"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-surface-900 dark:text-surface-50">Built With</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-center text-xs leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        Made with <Heart className="w-3 h-3 inline text-expense-500 fill-expense-500" /> by Sajjad Hossin
      </motion.p>
    </div>
  );
}
