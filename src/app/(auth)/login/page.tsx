'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { EmailAuthForm } from '@/components/auth/EmailAuthForm';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      {/* ── Top gradient area ── */}
      <div className="bg-gradient-primary flex-shrink-0 flex flex-col items-center justify-end pb-10 pt-16 px-6"
        style={{ minHeight: '36%' }}
      >
        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <span className="font-display text-3xl font-bold text-white select-none">A</span>
        </div>

        <h1 className="font-display text-4xl font-bold text-white tracking-wide">
          AlgeFox
        </h1>
        <p className="font-ui text-white/80 mt-1 text-base">
          Maths is your superpower
        </p>
      </div>

      {/* ── White card pulled up over gradient ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-10 flex flex-col gap-6 overflow-y-auto"
      >
        {/* Heading */}
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Welcome back!
          </h2>
          <p className="font-ui text-sm text-gray-500">
            Log in to continue your maths journey.
          </p>
        </div>

        {/* Google */}
        <GoogleButton mode="signin" />

        {/* Divider */}
        <Divider />

        {/* Email form */}
        <EmailAuthForm mode="signin" />

        {/* Sign-up link */}
        <p className="font-ui text-sm text-center text-gray-500 mt-2">
          New here?{' '}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:text-primary-dark underline underline-offset-2 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 h-px bg-gray-200" aria-hidden="true" />
      <span className="font-ui text-xs text-gray-400 whitespace-nowrap select-none">
        or continue with email
      </span>
      <span className="flex-1 h-px bg-gray-200" aria-hidden="true" />
    </div>
  );
}
