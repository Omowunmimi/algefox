'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BookOpen, Zap, Medal } from 'lucide-react';
import { Button } from '@/components/ui';
import { AchievementToast } from '@/components/gamification/AchievementToast';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import { useLessonStore } from '@/stores/useLessonStore';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAchievements } from '@/hooks/useAchievements';

const PASS_THRESHOLD = 0.6;

/* ── Radial ray background ───────────────────────────────────── */

function RadialRays({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{
          background: `conic-gradient(
            transparent 0deg,
            ${color}22 5deg,
            transparent 10deg,
            transparent 30deg,
            ${color}22 35deg,
            transparent 40deg,
            transparent 60deg,
            ${color}22 65deg,
            transparent 70deg,
            transparent 90deg,
            ${color}22 95deg,
            transparent 100deg,
            transparent 120deg,
            ${color}22 125deg,
            transparent 130deg,
            transparent 150deg,
            ${color}22 155deg,
            transparent 160deg,
            transparent 180deg,
            ${color}22 185deg,
            transparent 190deg,
            transparent 210deg,
            ${color}22 215deg,
            transparent 220deg,
            transparent 240deg,
            ${color}22 245deg,
            transparent 250deg,
            transparent 270deg,
            ${color}22 275deg,
            transparent 280deg,
            transparent 300deg,
            ${color}22 305deg,
            transparent 310deg,
            transparent 330deg,
            ${color}22 335deg,
            transparent 340deg,
            transparent 360deg
          )`,
          transformOrigin: 'center',
        }}
      />
    </div>
  );
}

/* ── Gold stars ──────────────────────────────────────────────── */

function GoldStars({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-1 -mt-8 relative z-20">
      {[1, 2, 3].map((s) => (
        <motion.span
          key={s}
          initial={{ scale: 0, y: 20, rotate: -20 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{
            delay: 0.3 + s * 0.15,
            type: 'spring',
            stiffness: 350,
            damping: 14,
          }}
          className="text-4xl select-none drop-shadow-md"
          style={{ filter: s > count ? 'grayscale(1) opacity(0.3)' : 'none' }}
          aria-hidden="true"
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}

/* ── Ribbon ──────────────────────────────────────────────────── */

function Ribbon({ passed }: { passed: boolean }) {
  return (
    <div
      className="relative flex items-center justify-center px-6 py-2.5 mx-4 rounded-xl"
      style={{
        background: passed
          ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
          : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        boxShadow: passed ? '0 4px 0 0 #B91C1C' : '0 4px 0 0 #374151',
      }}
    >
      {/* Left ribbon tail */}
      <span
        className="absolute -left-1 top-0 bottom-0 w-3"
        style={{
          background: passed ? '#B91C1C' : '#374151',
          clipPath: 'polygon(100% 0, 100% 100%, 0 50%)',
        }}
      />
      {/* Right ribbon tail */}
      <span
        className="absolute -right-1 top-0 bottom-0 w-3"
        style={{
          background: passed ? '#B91C1C' : '#374151',
          clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
        }}
      />
      <p className="font-display text-lg font-bold text-white tracking-wide relative z-10">
        {passed ? 'Complete!' : 'Keep Going!'}
      </p>
    </div>
  );
}

/* ── Stats row ───────────────────────────────────────────────── */

function StatsRow({ correct, total, xp }: { correct: number; total: number; xp: number }) {
  return (
    <div
      className="mx-5 rounded-2xl px-4 py-3 flex items-center justify-around"
      style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="flex flex-col items-center gap-1">
        <BookOpen size={22} className="text-sky-500" strokeWidth={2} />
        <span className="font-display text-base font-bold text-gray-800">{correct}/{total}</span>
        <span className="font-ui text-xs text-gray-400">Correct</span>
      </div>
      <div className="w-px h-10 bg-gray-100" />
      <div className="flex flex-col items-center gap-1">
        <Zap size={22} fill="#FCD34D" stroke="#D97706" strokeWidth={1} />
        <span className="font-display text-base font-bold text-primary">+{xp}</span>
        <span className="font-ui text-xs text-gray-400">XP</span>
      </div>
      <div className="w-px h-10 bg-gray-100" />
      <div className="flex flex-col items-center gap-1">
        <Medal size={22} fill="#F59E0B" stroke="#D97706" strokeWidth={0.5} />
        <span className="font-display text-base font-bold text-gold">+{Math.ceil(xp / 10)}</span>
        <span className="font-ui text-xs text-gray-400">Badges</span>
      </div>
    </div>
  );
}

/* ── Inner component (uses useSearchParams) ──────────────────── */

function RewardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonAnswers = useLessonStore((s) => s.answers);
  const lessonXp      = useLessonStore((s) => s.xpEarned);
  const lessonQueue   = useLessonStore((s) => s.questionQueue);
  const sectionIdFromStore = useLessonStore((s) => s.sectionId);
  const levelFromStore     = useLessonStore((s) => s.level);

  const userStats      = useUserStore((s) => s.stats);
  const profile        = useUserStore((s) => s.profile);
  const currentStreak  = useStreakStore((s) => s.currentStreak);
  const { checkAchievements } = useAchievements();

  const xp       = Number(searchParams.get('xp')      ?? lessonXp);
  const correct  = Number(searchParams.get('correct') ?? lessonAnswers.filter((a) => a.isCorrect).length);
  const total    = Number(searchParams.get('total')   ?? (lessonQueue.length || 10));
  const level    = Number(searchParams.get('level')   ?? levelFromStore);
  const sectionId = searchParams.get('sectionId') ?? sectionIdFromStore ?? 'fractions-intro';
  const sectionTitle =
    searchParams.get('sectionTitle') ??
    sectionId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const passed = searchParams.get('passed') !== 'false';

  const accuracy    = total > 0 ? correct / total : 0;
  const stars       = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= PASS_THRESHOLD ? 1 : 0;
  const username    = profile?.username ?? 'Champion';
  const firstName   = username.split(' ')[0];
  const retryUrl    = `/lesson/${sectionId}/${level}`;
  const nextLevelUrl = `/lesson/${sectionId}/${level + 1}`;

  useEffect(() => {
    if (passed) {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#8A2BE2', '#F59E0B', '#7C3AED', '#10B981', '#EC4899'],
      });
    }
    if (userStats) {
      void checkAchievements(userStats, currentStreak, correct === total && total > 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background: passed
          ? 'linear-gradient(160deg, #1e0a3c 0%, #3b0f70 50%, #5B1483 100%)'
          : 'linear-gradient(160deg, #1f2937 0%, #374151 100%)',
      }}
    >
      {/* Animated radial rays */}
      <RadialRays color={passed ? '#8A2BE2' : '#6B7280'} />

      {/* Background sparkles */}
      {[...Array(8)].map((_, i) => {
        const sz = 10 + (i % 3) * 5;
        return (
          <motion.svg
            key={i}
            className="absolute pointer-events-none select-none"
            width={sz}
            height={sz}
            viewBox="0 0 10 10"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
          >
            <polygon
              points="5,0 6.2,3.8 10,3.8 6.9,6.1 8.1,10 5,7.6 1.9,10 3.1,6.1 0,3.8 3.8,3.8"
              fill="#FCD34D"
            />
          </motion.svg>
        );
      })}

      {/* ── Stars (float above card) ── */}
      {passed && <GoldStars count={stars} />}

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm overflow-visible"
      >
        {/* Ribbon overlapping card top */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          className="relative z-10"
        >
          <Ribbon passed={passed} />
        </motion.div>

        {/* Card body */}
        <div
          className="rounded-3xl pt-6 pb-7 -mt-2"
          style={{ background: '#FAF7F0', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
        >
          {/* Mascot */}
          <motion.div
            className="flex justify-center mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 350, damping: 16 }}
          >
            <FoxyImage expression={passed ? 'celebrating' : 'sad'} size={110} />
          </motion.div>

          {/* Personalized message */}
          <motion.div
            className="text-center px-5 mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <h2 className="font-display text-2xl font-bold text-gray-900">
              {passed ? `Good Job, ${firstName}!` : `Keep Going, ${firstName}!`}
            </h2>
            <p className="font-ui text-sm text-gray-500 mt-1">
              {sectionTitle} · Level {level}
            </p>
            {!passed && (
              <p className="font-ui text-xs text-gray-400 mt-1">
                You need 60% or more to advance.
              </p>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
          >
            <StatsRow correct={correct} total={total} xp={xp} />
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="px-5 mt-5 flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
          >
            {passed ? (
              <>
                <Button variant="primary" size="lg" fullWidth onClick={() => router.push(nextLevelUrl)}>
                  Claim Rewards →
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => router.push('/home')}
                >
                  Back to Map
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" size="lg" fullWidth onClick={() => router.push(retryUrl)}>
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => router.push('/home')}
                >
                  Back to Map
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      <AchievementToast />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

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
