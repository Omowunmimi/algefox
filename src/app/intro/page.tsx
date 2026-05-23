'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Trophy, Zap, Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Slide data ───────────────────────────────────────────────────────────────

interface Slide {
  id: number;
  illustrationBg: string;
  illustration: React.ReactNode;
  heading: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    id: 0,
    illustrationBg: 'bg-primary',
    illustration: (
      <div className="flex flex-col items-center gap-3">
        <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
          <span className="font-display text-5xl font-bold text-white">¾</span>
        </div>
        <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-5 py-2">
          <span className="font-display text-2xl font-bold text-white">x² + 2x</span>
        </div>
      </div>
    ),
    heading: 'Learn at your own pace',
    body: 'Work through Fractions and Algebra step by step. Each level unlocks the next.',
  },
  {
    id: 1,
    illustrationBg: 'bg-gold',
    illustration: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Star className="text-white drop-shadow" size={40} fill="white" />
          <Star className="text-white drop-shadow" size={52} fill="white" />
          <Star className="text-white drop-shadow" size={40} fill="white" />
        </div>
        <div className="flex items-center gap-2 bg-white/25 rounded-2xl px-5 py-3">
          <Zap size={20} className="text-white" fill="white" />
          <div className="h-3 w-36 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-white rounded-full" />
          </div>
          <span className="font-display font-bold text-white text-sm">650 XP</span>
        </div>
        <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-5 py-2">
          <Trophy size={22} className="text-white" />
          <span className="font-ui font-bold text-white text-sm">Level Up!</span>
        </div>
      </div>
    ),
    heading: 'Earn XP and Achievements',
    body: 'Every correct answer earns you XP. Complete levels to unlock achievements and badges.',
  },
  {
    id: 2,
    illustrationBg: 'bg-secondary',
    illustration: (
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame size={80} className="text-orange-300 drop-shadow-lg" fill="#fed7aa" strokeWidth={1.5} />
        </motion.div>
        <div className="bg-white/20 rounded-2xl px-6 py-2 flex items-center gap-2">
          <span className="font-display text-3xl font-bold text-white">3</span>
          <span className="font-ui text-white/90 text-lg font-semibold">day streak</span>
        </div>
      </div>
    ),
    heading: 'Build your streak',
    body: "Come back every day to keep your streak alive. Ayo will be here cheering you on!",
  },
];

// ─── Slide transition variants ────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const slideTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntroPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];

  const goToNext = () => {
    if (isLastSlide) {
      router.push('/login');
      return;
    }
    setDirection(1);
    setCurrentSlide((prev) => prev + 1);
  };

  const goToPrev = () => {
    if (currentSlide === 0) return;
    setDirection(-1);
    setCurrentSlide((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-white relative">
      {/* Skip button */}
      <div className="absolute top-0 right-0 z-20 p-4 safe-top">
        <button
          onClick={() => router.push('/login')}
          className="font-ui text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors py-2 px-3"
        >
          Skip
        </button>
      </div>

      {/* Slide area — fills the screen */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex-1 flex flex-col h-full absolute inset-0"
          >
            {/* Illustration area — top 55% */}
            <div
              className={`${slide.illustrationBg} flex-none flex items-center justify-center`}
              style={{ height: '55%' }}
            >
              <div className="flex flex-col items-center gap-4 px-8">
                {slide.illustration}
              </div>
            </div>

            {/* Content area — bottom 45% */}
            <div
              className="bg-white flex flex-col justify-between px-8 py-8"
              style={{ height: '45%' }}
            >
              <div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {slide.heading}
                </h2>
                <p className="font-ui text-gray-600 text-base leading-relaxed">
                  {slide.body}
                </p>
              </div>

              {/* Bottom row: dots + nav buttons */}
              <div className="flex items-center justify-between mt-4">
                {/* Slide indicator dots */}
                <div className="flex items-center gap-2">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > currentSlide ? 1 : -1);
                        setCurrentSlide(i);
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentSlide
                          ? 'w-6 h-3 bg-primary'
                          : 'w-3 h-3 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  {currentSlide > 0 && (
                    <button
                      onClick={goToPrev}
                      className="font-ui text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors py-2 px-3"
                    >
                      Back
                    </button>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={goToNext}
                    rightIcon={!isLastSlide ? <ChevronRight size={18} /> : undefined}
                    style={{ boxShadow: 'var(--shadow-physical-primary)' }}
                  >
                    {isLastSlide ? 'Get Started!' : 'Next'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
