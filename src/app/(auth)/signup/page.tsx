'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { EmailAuthForm } from '@/components/auth/EmailAuthForm';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import type { MascotExpression } from '@/types/gamification.types';

/* ── Rotating fox slides ──────────────────────────────────────── */

interface FoxSlide {
  expression: MascotExpression;
  title: string;
  subtitle: string;
}

const FOX_SLIDES: FoxSlide[] = [
  { expression: 'excited',     title: "I'll be your guide!",      subtitle: "Hi, I'm Foxy! I'll cheer you on every step of the way." },
  { expression: 'encouraging', title: 'Earn XP and level up',     subtitle: 'Answer questions correctly to collect XP and unlock new topics.' },
  { expression: 'happy',       title: 'Build your streak',        subtitle: 'Practice every day to keep your streak burning strong!'        },
  { expression: 'celebrating', title: 'Unlock achievements',      subtitle: 'Complete milestones and celebrate every win!'                  },
];

/* ── Desktop left panel ───────────────────────────────────────── */

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
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

      <p className="font-display text-4xl font-bold tracking-wide">AlgeFox</p>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
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

      <div className="flex gap-2">
        {FOX_SLIDES.map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/30'}`}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {['Free forever', '10+ topics', 'Daily streaks', 'Achievements'].map((f) => (
          <span key={f} className="font-ui text-xs font-semibold bg-white/15 rounded-full px-3 py-1.5">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────────── */
function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="flex-1 h-px bg-gray-200" aria-hidden="true" />
      <span className="font-ui text-xs text-gray-400 whitespace-nowrap select-none">OR</span>
      <span className="flex-1 h-px bg-gray-200" aria-hidden="true" />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function SignUpPage() {
  return (
    <div className="flex bg-white min-h-screen lg:h-screen lg:overflow-hidden">
      {/* Desktop left: Fox panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-shrink-0">
        <FoxPanel />
      </div>

      {/* Right / mobile: scrollable */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="flex flex-col items-center px-6 pt-10 pb-10 lg:py-12 min-h-screen lg:min-h-full lg:justify-center">

          {/* Mobile: brand + Foxy floating */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <p className="font-display text-2xl font-bold mb-5" style={{ color: '#8A2BE2' }}>AlgeFox</p>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image src="/mascot/foxy-excited.png" alt="Foxy" width={140} height={140} className="object-contain" priority />
            </motion.div>

            {/* Speech bubble */}
            <div
              className="mt-3 px-4 py-2.5 rounded-2xl max-w-xs text-center"
              style={{
                background: 'white',
                boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
                border: '1.5px solid #E5E7EB',
              }}
            >
              <p className="font-ui text-sm text-gray-700">
                Your maths adventure starts here. Let&apos;s go!
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >
            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold text-gray-900">Join AlgeFox!</h2>
              <p className="font-ui text-sm text-gray-500 mt-1">Free forever. Start your maths adventure today.</p>
            </div>

            <GoogleButton mode="signup" />
            <Divider />
            <EmailAuthForm mode="signup" />

            <p className="font-ui text-sm text-center text-gray-500 mt-7">
              Already have an account?{' '}
              <Link href="/login" className="font-bold" style={{ color: '#8A2BE2' }}>
                Log in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
