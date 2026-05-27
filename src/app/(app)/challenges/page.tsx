'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Flame, Clock, Shuffle, Grid2X2, Zap, Lock } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';

/* ── Challenge types ─────────────────────────────────────────── */
interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  xp: number;
  duration: string;
  locked: boolean;
  route: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'daily',
    title: 'Daily Challenge',
    description: 'Mixed questions from all your topics',
    icon: <Flame size={22} fill="#FBBF24" stroke="#D97706" strokeWidth={0.5} />,
    color: '#D97706',
    bg: '#FFFBEB',
    xp: 100,
    duration: '5 min',
    locked: false,
    route: '/daily-challenge',
  },
  {
    id: 'speed',
    title: 'Speed Round',
    description: 'Answer 10 questions as fast as you can',
    icon: <Clock size={22} style={{ color: '#2563EB' }} strokeWidth={2} />,
    color: '#2563EB',
    bg: '#EFF6FF',
    xp: 60,
    duration: '2 min',
    locked: false,
    route: '/daily-challenge',
  },
  {
    id: 'shuffle',
    title: 'Random Mix',
    description: 'Random questions from across all sections',
    icon: <Shuffle size={22} style={{ color: '#7C3AED' }} strokeWidth={2} />,
    color: '#7C3AED',
    bg: '#F5F3FF',
    xp: 80,
    duration: '4 min',
    locked: false,
    route: '/daily-challenge',
  },
  {
    id: 'matching',
    title: 'Matching Game',
    description: 'Match equations and answers against the clock',
    icon: <Grid2X2 size={22} style={{ color: '#059669' }} strokeWidth={2} />,
    color: '#059669',
    bg: '#ECFDF5',
    xp: 70,
    duration: '3 min',
    locked: true,
    route: '/daily-challenge',
  },
  {
    id: 'weekly',
    title: 'Weekly Review',
    description: 'Comprehensive review of this week\'s lessons',
    icon: <Zap size={22} fill="#F59E0B" stroke="#D97706" strokeWidth={0.5} />,
    color: '#DB2777',
    bg: '#FDF2F8',
    xp: 200,
    duration: '10 min',
    locked: true,
    route: '/daily-challenge',
  },
];

/* ── Challenge card ─────────────────────────────────────────── */
function ChallengeCard({
  challenge,
  onPress,
}: {
  challenge: Challenge;
  onPress: () => void;
}) {
  return (
    <motion.button
      onClick={challenge.locked ? undefined : onPress}
      whileTap={!challenge.locked ? { y: 3, boxShadow: 'none' } : undefined}
      className="w-full text-left rounded-3xl p-4 flex items-center gap-4 bg-white"
      style={{
        boxShadow: challenge.locked ? '0 2px 10px rgba(0,0,0,0.04)' : '0 4px 0 0 rgba(0,0,0,0.06)',
        opacity: challenge.locked ? 0.6 : 1,
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: challenge.bg }}
      >
        {challenge.locked ? <Lock size={20} color="#9CA3AF" strokeWidth={2} /> : challenge.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display text-base font-bold text-gray-900 leading-tight">{challenge.title}</p>
        <p className="font-ui text-xs text-gray-500 mt-0.5 truncate">{challenge.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <Zap size={11} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
            <span className="font-ui text-xs font-bold text-yellow-700">+{challenge.xp} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} style={{ color: '#9CA3AF' }} strokeWidth={2} />
            <span className="font-ui text-xs text-gray-400">{challenge.duration}</span>
          </div>
        </div>
      </div>

      {challenge.locked && (
        <Lock size={16} color="#D1D5DB" strokeWidth={2} className="flex-shrink-0" />
      )}
    </motion.button>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function ChallengesPage() {
  const router = useRouter();
  const profile       = useUserStore((s) => s.profile);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const firstName     = (profile?.username ?? 'Champion').split(' ')[0];

  return (
    <div className="min-h-screen pb-6" style={{ background: '#F8F7FF' }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-bold text-gray-900">Challenges</h1>
        <p className="font-ui text-sm text-gray-500 mt-0.5">Push yourself a little further, {firstName}!</p>
      </div>

      {/* Streak banner */}
      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #7C2D12 0%, #92400E 100%)' }}
        >
          <Flame size={24} fill="#FBBF24" stroke="#D97706" strokeWidth={0.5} />
          <div>
            <p className="font-display text-sm font-bold text-white">{currentStreak} day streak!</p>
            <p className="font-ui text-xs text-orange-200">Complete a challenge to keep it going</p>
          </div>
          <div className="ml-auto">
            <Image
              src="/mascot/foxy-excited.png"
              alt="Foxy"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </motion.div>
      )}

      {/* Challenge list */}
      <div className="px-4 flex flex-col gap-3">
        {CHALLENGES.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <ChallengeCard
              challenge={challenge}
              onPress={() => router.push(challenge.route)}
            />
          </motion.div>
        ))}
      </div>

    </div>
  );
}
