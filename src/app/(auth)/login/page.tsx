'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { EmailAuthForm } from '@/components/auth/EmailAuthForm';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import type { MascotExpression } from '@/types/gamification.types';

/* ── Rotating fox slides ──────────────────────────────────── */

interface FoxSlide {
  expression: MascotExpression;
  title: string;
  subtitle: string;
}

const FOX_SLIDES: FoxSlide[] = [
  {
    expression: 'excited',
    title: 'Welcome back! 🎉',
    subtitle: "I've been waiting — let's crush some maths today!",
  },
  {
    expression: 'encouraging',
    title: 'Your streak is waiting 🔥',
    subtitle: 'Log in to keep your progress alive. You got this!',
  },
  {
    expression: 'happy',
    title: 'Maths is your superpower ⚡',
    subtitle: 'Every lesson brings you closer to mastery.',
  },
];

/* ── Desktop left panel ───────────────────────────────────── */

function FoxPanel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % FOX_SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = FOX_SLIDES[idx];

  return (
    <div className="hidden lg:flex flex-col items-center justify-center gap-8 h-full px-10 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #8A2BE2 0%, #5B1483 100%)' }}>
      {/* Decorative orbs */}
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

      <div className="text-center">
        <p className="font-display text-4xl font-bold tracking-wide text-white">AlgeFox</p>
        <p className="font-ui text-sm text-white/70 mt-1">Maths is your superpower</p>
      </div>

      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        <FoxyImage expression={slide.expression} size={180} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center max-w-xs"
        >
          <p className="font-display text-2xl font-bold text-white mb-2">{slide.title}</p>
          <p className="font-ui text-sm text-white/80 leading-relaxed">{slide.subtitle}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="flex gap-2">
        {FOX_SLIDES.map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/30'}`}
          />
        ))}
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 bg-white/10 rounded-2xl px-6 py-3">
        <div className="text-center">
          <p className="font-display text-xl font-bold text-white">4.8k+</p>
          <p className="font-ui text-xs text-white/70">Students</p>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="text-center">
          <p className="font-display text-xl font-bold text-white">10+</p>
          <p className="font-ui text-xs text-white/70">Topics</p>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="text-center">
          <p className="font-display text-xl font-bold text-white">⭐ 4.9</p>
          <p className="font-ui text-xs text-white/70">Rating</p>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function LoginPage() {
  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Desktop left: Fox panel */}
      <div className="hidden lg:block lg:w-1/2">
        <FoxPanel />
      </div>

      {/* Right: scroll container */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        <div className="min-h-full flex flex-col items-center justify-start lg:justify-center px-6 pt-10 pb-10 lg:py-12">

          {/* Mobile: Foxy floating above form */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FoxyImage expression="happy" size={90} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >
            {/* Heading */}
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="font-ui text-sm text-gray-500 mt-1">Login to your account to continue.</p>
            </div>

            {/* Google */}
            <GoogleButton mode="signin" />

            <Divider />

            {/* Email form */}
            <EmailAuthForm mode="signin" />

            {/* Footer link */}
            <p className="font-ui text-sm text-center text-gray-500 mt-7">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-bold hover:text-primary-dark transition-colors">
                Sign Up
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="flex-1 h-px bg-gray-200" aria-hidden="true" />
      <span className="font-ui text-xs text-gray-400 whitespace-nowrap select-none">OR</span>
      <span className="flex-1 h-px bg-gray-200" aria-hidden="true" />
    </div>
  );
}
