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
    title: "I'll be your guide! 🦊",
    subtitle: "Hi, I'm Foxy! I'll cheer you on every step of the way.",
  },
  {
    expression: 'encouraging',
    title: 'Earn XP & level up 🏆',
    subtitle: 'Answer questions correctly to collect XP and unlock new topics.',
  },
  {
    expression: 'happy',
    title: 'Build your streak 🔥',
    subtitle: 'Practice every day to keep your streak burning strong!',
  },
  {
    expression: 'celebrating',
    title: 'Unlock achievements ⭐',
    subtitle: "Complete milestones and I'll celebrate every win with you!",
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
    <div
      className="hidden lg:flex flex-col items-center justify-center gap-8 h-full px-10 py-12 relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(160deg, #8A2BE2 0%, #5B1483 100%)' }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

      <div className="text-center">
        <p className="font-display text-4xl font-bold tracking-wide">AlgeFox</p>
        <p className="font-ui text-sm text-white/70 mt-1">Your maths adventure starts here</p>
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
          <p className="font-display text-2xl font-bold mb-2">{slide.title}</p>
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

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {['✅ Free forever', '🎯 10+ topics', '🔥 Daily streaks', '🏆 Achievements'].map((f) => (
          <span key={f} className="font-ui text-xs font-semibold bg-white/15 rounded-full px-3 py-1.5">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function SignUpPage() {
  return (
    <div className="flex bg-white min-h-screen lg:h-screen lg:overflow-hidden">
      {/* Desktop left: Fox panel (sticky, full height) */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-shrink-0">
        <FoxPanel />
      </div>

      {/* Right: scrollable on all screen sizes */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="flex flex-col items-center justify-start lg:justify-center px-6 pt-10 pb-10 lg:py-12 min-h-screen lg:min-h-full">

          {/* Mobile: Foxy floating above form */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FoxyImage expression="excited" size={90} />
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
              <h2 className="font-display text-3xl font-bold text-gray-900">Join AlgeFox! 🚀</h2>
              <p className="font-ui text-sm text-gray-500 mt-1">Free forever. Start your maths adventure today.</p>
            </div>

            {/* Google — primary CTA */}
            <GoogleButton mode="signup" />

            <Divider />

            {/* Email form */}
            <EmailAuthForm mode="signup" />

            {/* Footer link */}
            <p className="font-ui text-sm text-center text-gray-500 mt-7">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">
                Log in
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
