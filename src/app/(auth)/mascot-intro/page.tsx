'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AyoMascot } from '@/components/mascot/AyoMascot';
import { SpeechBubble } from '@/components/mascot/SpeechBubble';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { MascotExpression } from '@/types/gamification.types';

// ─── Step definitions ─────────────────────────────────────────────────────────

interface Step {
  expression: MascotExpression;
  message: string;
  buttonLabel: string;
}

const STEPS: Step[] = [
  {
    expression: 'excited',
    message:
      "Ehen! Welcome! I'm Ayo — your maths guide! I'll be with you every step of the way. 🦊",
    buttonLabel: 'Hi Ayo!',
  },
  {
    expression: 'happy',
    message:
      "We're going to master Fractions and Algebra together! No wahala — we'll take it one level at a time.",
    buttonLabel: 'Sounds good!',
  },
  {
    expression: 'encouraging',
    message:
      'Answer questions, earn XP, keep your streak going! Ready to set up your profile?',
    buttonLabel: "Let's go!",
  },
];

// ─── Slide variants ───────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function MascotIntroPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward

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
    <div className="min-h-screen bg-primary-lighter flex flex-col items-center justify-between px-6 py-12 safe-top safe-bottom">
      {/* Top spacer */}
      <div className="flex-1" />

      {/* ── Animated step content ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="flex flex-col items-center gap-6 w-full max-w-sm"
        >
          {/* Mascot */}
          <AyoMascot
            expression={step.expression}
            size={160}
            animated={currentStep === 0}
          />

          {/* Speech bubble */}
          <div className="w-full pl-6">
            <SpeechBubble
              message={step.message}
              variant="default"
              className="font-ui text-base"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Step dots ── */}
      <div className="flex items-center gap-2 mt-8 mb-6" aria-label="Progress steps" role="group">
        {STEPS.map((_, i) => (
          <span
            key={i}
            aria-label={`Step ${i + 1}${i === currentStep ? ' (current)' : ''}`}
            className={cn(
              'rounded-full transition-all duration-300',
              i === currentStep
                ? 'w-6 h-3 bg-primary'
                : 'w-3 h-3 bg-primary-light',
            )}
          />
        ))}
      </div>

      {/* ── Action button ── */}
      <div className="w-full max-w-sm">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNext}
        >
          {step.buttonLabel}
        </Button>
      </div>

      {/* Bottom spacer */}
      <div className="flex-1" />
    </div>
  );
}
