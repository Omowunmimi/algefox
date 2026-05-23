'use client';

import { AchievementCard } from '@/components/gamification/AchievementCard';
import type { Achievement } from '@/types/gamification.types';

/* ── Mock achievements (until DB is seeded) ──────────────── */
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    slug: 'first-lesson',
    title: 'First Step',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'completion',
    xpReward: 50,
    conditionType: 'lessons_completed',
    conditionValue: 1,
    earned: false,
  },
  {
    id: '2',
    slug: 'streak-3',
    title: 'On a Roll',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    xpReward: 75,
    conditionType: 'streak_days',
    conditionValue: 3,
    earned: false,
  },
  {
    id: '3',
    slug: 'streak-7',
    title: 'Week Warrior',
    description: '7-day streak!',
    icon: '🌟',
    category: 'streak',
    xpReward: 150,
    conditionType: 'streak_days',
    conditionValue: 7,
    earned: false,
  },
  {
    id: '4',
    slug: 'perfect-lesson',
    title: 'Perfect Score',
    description: 'Complete a lesson with no mistakes',
    icon: '💯',
    category: 'accuracy',
    xpReward: 100,
    conditionType: 'perfect_lesson',
    conditionValue: 1,
    earned: false,
  },
  {
    id: '5',
    slug: 'level-10',
    title: 'Level 10 Legend',
    description: 'Reach Level 10',
    icon: '🏆',
    category: 'mastery',
    xpReward: 200,
    conditionType: 'level',
    conditionValue: 10,
    earned: false,
  },
  {
    id: '6',
    slug: 'xp-500',
    title: 'XP Collector',
    description: 'Earn 500 total XP',
    icon: '⚡',
    category: 'mastery',
    xpReward: 50,
    conditionType: 'total_xp',
    conditionValue: 500,
    earned: false,
  },
  {
    id: '7',
    slug: 'questions-50',
    title: 'Question Master',
    description: 'Answer 50 questions',
    icon: '❓',
    category: 'completion',
    xpReward: 100,
    conditionType: 'questions_answered',
    conditionValue: 50,
    earned: false,
  },
  {
    id: '8',
    slug: 'accuracy-90',
    title: 'Sharp Mind',
    description: 'Maintain 90% accuracy',
    icon: '🎓',
    category: 'accuracy',
    xpReward: 150,
    conditionType: 'accuracy_pct',
    conditionValue: 90,
    earned: false,
  },
];

export default function AchievementsPage() {
  const earnedCount = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 mb-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">Achievements</h1>
        <p className="font-ui text-sm text-gray-500 mt-0.5">
          <span className="font-bold text-gold">{earnedCount}</span> / {totalCount} unlocked
        </p>
      </div>

      {/* Achievement grid — 2 columns */}
      <div className="px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {MOCK_ACHIEVEMENTS.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  );
}
