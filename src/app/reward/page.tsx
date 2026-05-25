'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui';
import { useLessonStore } from '@/stores/useLessonStore';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAchievements } from '@/hooks/useAchievements';

/* ── Star rating ─────────────────────────────────────────────── */

function StarRating({ accuracy }: { accuracy: number }) {
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((s) => (
        <motion.span
          key={s}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.4 + s * 0.15,
            type: 'spring' as const,
            stiffness: 400,
            damping: 15,
          }}
          className="text-4xl select-none"
          aria-hidden="true"
        >
          {s <= stars ? '⭐' : '☆'}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Inner component (uses useSearchParams) ──────────────────── */

function RewardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonAnswers = useLessonStore((s) => s.answers);
  const lessonXp = useLessonStore((s) => s.xpEarned);
  const lessonQueue = useLessonStore((s) => s.questionQueue);
  const sectionIdFromStore = useLessonStore((s) => s.sectionId);
  const levelFromStore = useLessonStore((s) => s.level);

  const userStats = useUserStore((s) => s.stats);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const { checkAchievements } = useAchievements();

  // Parse query params — fall back to store values
  const xp = Number(searchParams.get('xp') ?? lessonXp);
  const correct = Number(
    searchParams.get('correct') ?? lessonAnswers.filter((a) => a.isCorrect).length,
  );
  const total = Number(searchParams.get('total') ?? (lessonQueue.length || 10));
  const level = Number(searchParams.get('level') ?? levelFromStore);
  const sectionId = searchParams.get('sectionId') ?? sectionIdFromStore ?? 'fractions-intro';
  const sectionTitle =
    searchParams.get('sectionTitle') ??
    sectionId
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const accuracy = total > 0 ? correct / total : 0;
  const wasPerfect = correct === total && total > 0;
  const nextLevelUrl = `/lesson/${sectionId}/${level + 1}`;

  /* ── Confetti + achievement check on mount ─────────────────── */
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F97316', '#F59E0B', '#7C3AED', '#10B981', '#EC4899'],
    });

    // Check achievements with the latest stats
    if (userStats) {
      void checkAchievements(userStats, currentStreak, wasPerfect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Stagger delays ────────────────────────────────────────── */
  const delays = [0.2, 0.4, 0.6, 0.8] as const;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: 'easeOut' as const },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-orange-600 flex flex-col items-center justify-center px-4 py-12">
      {/* Mascot */}
      <motion.div {...fadeUp(delays[0])} className="mb-4">
        <div className="text-8xl select-none" role="img" aria-label="Celebrating fox mascot">
          🦊
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h1
        {...fadeUp(delays[1])}
        className="font-display text-4xl font-bold text-white text-center mb-2"
      >
        Level Complete! 🎉
      </motion.h1>

      <motion.p
        {...fadeUp(delays[1])}
        className="font-ui text-white/80 text-center mb-6 text-sm"
      >
        {sectionTitle} · Level {level}
      </motion.p>

      {/* Stars */}
      <motion.div {...fadeUp(delays[1])} className="mb-6">
        <StarRating accuracy={accuracy} />
      </motion.div>

      {/* Stats card */}
      <motion.div
        {...fadeUp(delays[2])}
        className="w-full max-w-sm bg-white/20 backdrop-blur-sm rounded-2xl p-5 mb-8 space-y-3"
      >
        <div className="flex items-center justify-between font-ui text-white">
          <span className="text-white/80 text-sm">Correct answers</span>
          <span className="font-bold text-lg">{correct}/{total}</span>
        </div>
        <div className="h-px bg-white/20" />
        <div className="flex items-center justify-between font-ui text-white">
          <span className="text-white/80 text-sm">Accuracy</span>
          <span className="font-bold text-lg">{Math.round(accuracy * 100)}%</span>
        </div>
        <div className="h-px bg-white/20" />
        <div className="flex items-center justify-between font-ui text-white">
          <span className="text-white/80 text-sm">XP earned</span>
          <span className="font-bold text-lg text-gold">+{xp} XP ⚡</span>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        {...fadeUp(delays[3])}
        className="w-full max-w-sm flex flex-col gap-3"
      >
        <Button
          variant="gold"
          size="lg"
          fullWidth
          onClick={() => router.push(nextLevelUrl)}
          style={{ boxShadow: 'var(--shadow-physical-gold)' }}
        >
          Next Level →
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="border-white/60 text-white hover:bg-white/10"
          onClick={() => router.push('/home')}
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}

/* ── Page (Suspense boundary for useSearchParams) ────────────── */

export default function RewardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-primary flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        </div>
      }
    >
      <RewardContent />
    </Suspense>
  );
}
