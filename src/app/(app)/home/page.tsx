'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore, selectPracticedToday } from '@/stores/useStreakStore';
import { Avatar } from '@/components/ui/Avatar';
import { PathMap } from '@/components/path/PathMap';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Mock data (used until DB is seeded) ───────────────────── */
const MOCK_SECTIONS: SectionProgress[] = [
  {
    sectionId: 'sec1',
    sectionSlug: 'fractions-intro',
    sectionTitle: 'Introduction to Fractions',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: true,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec2',
    sectionSlug: 'fractions-operations',
    sectionTitle: 'Fraction Operations',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec3',
    sectionSlug: 'algebra-intro',
    sectionTitle: 'Introduction to Algebra',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec4',
    sectionSlug: 'algebra-expressions',
    sectionTitle: 'Algebraic Expressions',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
];

/* ── Helpers ───────────────────────────────────────────────── */
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getActiveSectionId(sections: SectionProgress[]): string | null {
  // First unlocked & not completed section is the active one
  return sections.find((s) => s.isUnlocked && !s.isCompleted)?.sectionId ?? null;
}

/* ── Streak / Daily Banner ─────────────────────────────────── */
interface StreakDailyBannerProps {
  streak: number;
  practicedToday: boolean;
}

function StreakDailyBanner({ streak, practicedToday }: StreakDailyBannerProps) {
  const router = useRouter();

  const hasPracticed = practicedToday;
  const hasStreak = streak > 0;

  return (
    <div className="px-5 py-3">
      <div
        className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${
          hasPracticed
            ? 'bg-success-bg border border-success'
            : hasStreak
              ? 'bg-primary-lighter border border-primary-light'
              : 'bg-gray-100 border border-gray-200'
        }`}
      >
        {/* Left: streak info */}
        <div className="flex-1 min-w-0">
          {hasPracticed ? (
            <p className="font-ui text-sm font-semibold text-success-dark truncate">
              ✅ You practised today! Streak: {streak} {streak === 1 ? 'day' : 'days'}
            </p>
          ) : hasStreak ? (
            <p className="font-ui text-sm font-semibold text-primary-darker truncate">
              🔥 {streak} {streak === 1 ? 'day' : 'day'} streak — keep it going!
            </p>
          ) : (
            <p className="font-ui text-sm font-semibold text-gray-600 truncate">
              Start your streak today!
            </p>
          )}
        </div>

        {/* Right: challenge link */}
        <motion.button
          onClick={() => router.push('/daily-challenge')}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 font-ui text-xs font-bold text-primary bg-white border border-primary-light rounded-xl px-3 py-1.5 whitespace-nowrap"
          style={{ boxShadow: 'var(--shadow-physical-sm)' }}
        >
          Today&apos;s challenge →
        </motion.button>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  const profile = useUserStore((s) => s.profile);
  const [sections] = useState<SectionProgress[]>(MOCK_SECTIONS);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const practicedToday = useStreakStore(selectPracticedToday);

  const username = profile?.username ?? '';
  const avatarId = profile?.avatarId ?? '';
  const timeOfDay = getTimeOfDay();
  const currentSectionId = getActiveSectionId(sections);

  // In a real implementation, fetch from Supabase here
  // useEffect(() => {
  //   async function loadProgress() {
  //     const supabase = createClient();
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) return;
  //     const { data } = await supabase
  //       .from('user_progress')
  //       .select('*, sections(slug, title, unit_id)')
  //       .eq('user_id', user.id);
  //     if (data) { /* transform and setSections */ }
  //   }
  //   loadProgress();
  // }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Greeting header ── */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-ui text-sm text-gray-500">
              Good {timeOfDay},
            </p>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              {username || 'Student'}! 👋
            </h1>
          </div>
          <Avatar avatarId={avatarId} username={username || 'Student'} size="md" bordered />
        </div>
      </div>

      {/* ── Streak + Daily Challenge banner ── */}
      <StreakDailyBanner streak={currentStreak} practicedToday={practicedToday} />

      {/* ── Path heading ── */}
      <div className="px-5 pb-2">
        <h2 className="font-display text-lg font-bold text-gray-800">Your Learning Path</h2>
        <p className="font-ui text-xs text-gray-500">Complete lessons to unlock new sections</p>
      </div>

      {/* ── Path map ── */}
      <PathMap sections={sections} currentSectionId={currentSectionId} />
    </div>
  );
}
