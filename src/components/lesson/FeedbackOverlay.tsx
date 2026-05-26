'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import { Button } from '@/components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackOverlayProps {
  isVisible: boolean;
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  onContinue: () => void;
}

// ─── Phrases ──────────────────────────────────────────────────────────────────

const CORRECT_PHRASES = [
  "Ehen! That's right! 🎉",
  'Yes yes yes! You got it! ⭐',
  'Correct! Sharp student! 🦊',
  "Let's go! That's it! 🔥",
];

const INCORRECT_PHRASES = [
  "You're Close!",
  "Almost There!",
  "So Close!",
  "Not Quite!",
];

const INCORRECT_SUBTITLES = [
  "Let's try that one more time!",
  "No wahala — here's the trick:",
  "Almost! Let's see how:",
  "Don't worry, let's break it down:",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Sparkle dots ─────────────────────────────────────────────────────────────

function SparkleStars() {
  const stars = [
    { x: -14, y: -20, color: '#FCD34D', size: 10 },
    { x: 16,  y: -16, color: '#F59E0B', size: 8  },
    { x: -12, y: 16,  color: '#FCD34D', size: 7  },
    { x: 18,  y: 12,  color: '#FBBF24', size: 9  },
  ];
  return (
    <>
      {stars.map((s, i) => (
        <motion.svg
          key={i}
          className="absolute pointer-events-none"
          width={s.size}
          height={s.size}
          viewBox="0 0 10 10"
          style={{
            left: `calc(50% + ${s.x}px)`,
            top: `calc(50% + ${s.y}px)`,
          }}
          animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        >
          <polygon
            points="5,0 6.2,3.8 10,3.8 6.9,6.1 8.1,10 5,7.6 1.9,10 3.1,6.1 0,3.8 3.8,3.8"
            fill={s.color}
          />
        </motion.svg>
      ))}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FeedbackOverlay({
  isVisible,
  isCorrect,
  explanation,
  correctAnswer,
  onContinue,
}: FeedbackOverlayProps) {
  const heading = useMemo(
    () => (isCorrect ? pickRandom(CORRECT_PHRASES) : pickRandom(INCORRECT_PHRASES)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVisible, isCorrect],
  );

  const subtitle = useMemo(
    () => (isCorrect ? null : pickRandom(INCORRECT_SUBTITLES)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVisible, isCorrect],
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="feedback-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black pointer-events-none"
          />

          {/* Bottom sheet */}
          <motion.div
            key="feedback-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white"
            style={{
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="px-6 pt-6 pb-4 flex flex-col gap-4 max-w-lg mx-auto">
              {/* Mascot in circle */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width: 88,
                    height: 88,
                    background: isCorrect ? '#D1FAE5' : '#FAF7F0',
                  }}
                >
                  <FoxyImage
                    expression={isCorrect ? 'celebrating' : 'encouraging'}
                    size={72}
                  />
                  {!isCorrect && <SparkleStars />}
                </div>

                {/* Heading */}
                <div className="text-center">
                  <h3 className="font-display text-2xl font-bold text-gray-900">
                    {heading}
                  </h3>
                  {subtitle && (
                    <p className="font-ui text-sm text-gray-500 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Correct answer (wrong only) */}
              {!isCorrect && correctAnswer && (
                <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="font-ui text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Correct answer:
                  </span>
                  <p className="font-display text-base font-bold text-gray-900 mt-0.5">
                    {correctAnswer}
                  </p>
                </div>
              )}

              {/* Explanation */}
              {explanation && (
                <p className="font-ui text-sm text-gray-600 leading-relaxed text-center">
                  {explanation}
                </p>
              )}

              {/* Action button */}
              {isCorrect ? (
                <Button variant="success" size="lg" fullWidth onClick={onContinue}>
                  Continue →
                </Button>
              ) : (
                <Button variant="amber" size="lg" fullWidth onClick={onContinue}>
                  Try Again
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
