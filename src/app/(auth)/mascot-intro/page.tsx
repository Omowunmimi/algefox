'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useUserStore } from '@/stores/useUserStore';
import type { MascotExpression } from '@/types/gamification.types';

/* ── Step definitions ─────────────────────────────────────── */

interface Step {
  expression: MascotExpression;
  message: string;
  buttonLabel: string;
}

function buildSteps(name: string): Step[] {
  const firstName = name ? name.split(' ')[0] : '';
  return [
    {
      expression: 'excited',
      message: firstName
        ? `Ehen! Welcome, ${firstName}! 🎉 I'm Foxy — your personal maths guide! I'll be with you every step of the way. 🦊`
        : "Ehen! Welcome! 🎉 I'm Foxy — your personal maths guide! I'll be with you every step of the way. 🦊",
      buttonLabel: 'Hi Foxy!',
    },
    {
      expression: 'encouraging',
      message: "We'll master Fractions and Algebra together! No wahala — we take it one level at a time. Answer questions, earn XP and level up! 🏆",
      buttonLabel: 'Sounds amazing!',
    },
    {
      expression: 'celebrating',
      message: "Keep your daily streak 🔥, unlock achievements 🏅, and watch yourself become a maths champion! Ready to start your adventure?",
      buttonLabel: "Let's go! 🚀",
    },
  ];
}

/* ── Math symbol pattern background ──────────────────────── */

const MATH_SYMBOLS = [
  { symbol: 'x²', x: 8,  y: 6  },
  { symbol: '÷',  x: 82, y: 4  },
  { symbol: '∑',  x: 15, y: 22 },
  { symbol: '+',  x: 70, y: 18 },
  { symbol: '=',  x: 90, y: 32 },
  { symbol: '√',  x: 5,  y: 42 },
  { symbol: 'π',  x: 55, y: 8  },
  { symbol: '×',  x: 35, y: 28 },
  { symbol: '%',  x: 78, y: 52 },
  { symbol: '∞',  x: 20, y: 60 },
  { symbol: 'f(x)',x: 60, y: 68 },
  { symbol: '÷',  x: 88, y: 72 },
  { symbol: '+',  x: 10, y: 80 },
  { symbol: 'x²', x: 45, y: 88 },
  { symbol: '∑',  x: 75, y: 82 },
];

function MathPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {MATH_SYMBOLS.map((item, i) => (
        <span
          key={i}
          className="absolute font-display font-bold text-sm"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            color: 'rgba(138,43,226,0.08)',
            fontSize: i % 3 === 0 ? '18px' : i % 3 === 1 ? '14px' : '20px',
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

/* ── Slide variants ──────────────────────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  }),
};

/* ── Component ───────────────────────────────────────────── */

export default function MascotIntroPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const username = profile?.username ?? '';
  const STEPS = buildSteps(username);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const step = STEPS[currentStep];

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      router.push('/onboarding/profile');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12 safe-top safe-bottom relative overflow-hidden"
      style={{ background: '#FAF7F0' }}
    >
      {/* Subtle math pattern background */}
      <MathPattern />

      {/* Top: AlgeFox logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        <p className="font-display text-2xl font-bold text-primary tracking-wide">AlgeFox</p>
        <p className="font-ui text-xs text-gray-500 mt-0.5">Your maths adventure</p>
      </motion.div>

      {/* Animated step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm"
        >
          {/* Mascot floating */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FoxyImage expression={step.expression} size={160} />
          </motion.div>

          {/* Speech bubble */}
          <div
            className="w-full rounded-2xl px-5 py-4 relative"
            style={{
              background: '#FFFFFF',
              border: '2px solid #E8DDD0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Tail pointing up toward mascot */}
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              aria-hidden="true"
              style={{
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '12px solid #E8DDD0',
              }}
            />
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2"
              aria-hidden="true"
              style={{
                width: 0,
                height: 0,
                borderLeft: '9px solid transparent',
                borderRight: '9px solid transparent',
                borderBottom: '11px solid #FFFFFF',
              }}
            />
            <p className="font-ui text-base text-gray-800 leading-relaxed text-center">
              {step.message}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom: dots + CTA */}
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-5 items-center">
        {/* Step dots */}
        <div className="flex items-center gap-2" aria-label="Progress steps" role="group">
          {STEPS.map((_, i) => (
            <span
              key={i}
              aria-label={`Step ${i + 1}${i === currentStep ? ' (current)' : ''}`}
              className={cn(
                'rounded-full transition-all duration-300',
                i === currentStep
                  ? 'w-6 h-3 bg-primary'
                  : i < currentStep
                    ? 'w-3 h-3 bg-primary/40'
                    : 'w-3 h-3 bg-gray-300',
              )}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNext}
        >
          {step.buttonLabel}
        </Button>
      </div>
    </div>
  );
}
