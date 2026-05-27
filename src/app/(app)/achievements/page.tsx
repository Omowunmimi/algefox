'use client';

import { motion } from 'framer-motion';
import { Star, Flame, Trophy, Zap, BookOpen, GraduationCap, CheckCircle, Lock } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import type { Achievement } from '@/types/gamification.types';

/* ── Achievement definitions ────────────────────────────────── */

interface AchievementDef {
  id: string;
  slug: string;
  title: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
  category: string;
  hexColor: string;
  hexColorDark: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string; stroke?: string }>;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: '1', slug: 'first-lesson',  title: 'First Steps',        description: 'Complete your first lesson',
    conditionType: 'lessons_completed', conditionValue: 1, xpReward: 50, category: 'completion',
    hexColor: '#F59E0B', hexColorDark: '#D97706',
    IconComponent: Trophy,
  },
  {
    id: '2', slug: 'streak-3',      title: 'Streak Master',       description: 'Maintain a 3-day streak',
    conditionType: 'streak_days', conditionValue: 3, xpReward: 75, category: 'streak',
    hexColor: '#F97316', hexColorDark: '#C2410C',
    IconComponent: Flame,
  },
  {
    id: '3', slug: 'fraction-exp',  title: 'Fraction Explorer',   description: 'Complete 10 fraction lessons',
    conditionType: 'lessons_completed', conditionValue: 10, xpReward: 100, category: 'completion',
    hexColor: '#3B82F6', hexColorDark: '#1D4ED8',
    IconComponent: BookOpen,
  },
  {
    id: '4', slug: 'quick-thinker', title: 'Quick Thinker',       description: 'Answer 5 in a row correctly',
    conditionType: 'lessons_completed', conditionValue: 5, xpReward: 80, category: 'accuracy',
    hexColor: '#EF4444', hexColorDark: '#B91C1C',
    IconComponent: Zap,
  },
  {
    id: '5', slug: 'scholar',       title: 'Scholar',             description: 'Earn 50 total XP',
    conditionType: 'total_xp', conditionValue: 50, xpReward: 50, category: 'mastery',
    hexColor: '#8A2BE2', hexColorDark: '#5B1483',
    IconComponent: GraduationCap,
  },
  {
    id: '6', slug: 'perfect-score', title: 'Perfect Score',       description: 'All correct in a lesson',
    conditionType: 'perfect_lesson', conditionValue: 1, xpReward: 100, category: 'accuracy',
    hexColor: '#16A34A', hexColorDark: '#166534',
    IconComponent: Star,
  },
];

/* ── Hexagon badge SVG ───────────────────────────────────────── */

function HexBadge({
  color,
  colorDark,
  Icon,
  earned,
  size = 64,
}: {
  color: string;
  colorDark: string;
  Icon: AchievementDef['IconComponent'];
  earned: boolean;
  size?: number;
}) {
  const iconSize = Math.round(size * 0.36);
  // Hexagon polygon points (flat-top, centered in viewBox 0 0 100 110)
  const pts = '50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size * 1.1 }}>
      <svg
        viewBox="0 0 100 110"
        width={size}
        height={size * 1.1}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={`hg-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={earned ? color : '#D1D5DB'} />
            <stop offset="100%" stopColor={earned ? colorDark : '#9CA3AF'} />
          </linearGradient>
          {/* Sparkle dots */}
          {earned && (
            <>
              <circle cx="15" cy="15" r="3" fill={color} opacity="0.5" />
              <circle cx="85" cy="20" r="2" fill={color} opacity="0.4" />
              <circle cx="10" cy="85" r="2.5" fill={color} opacity="0.45" />
              <circle cx="90" cy="80" r="2" fill={color} opacity="0.4" />
            </>
          )}
        </defs>
        <polygon
          points={pts}
          fill={`url(#hg-${color.replace('#', '')})`}
          stroke={earned ? colorDark : '#9CA3AF'}
          strokeWidth="1.5"
        />
        {earned && (
          <>
            <circle cx="15" cy="15" r="3" fill={color} opacity="0.45" />
            <circle cx="85" cy="20" r="2" fill={color} opacity="0.35" />
            <circle cx="10" cy="85" r="2.5" fill={color} opacity="0.4" />
            <circle cx="90" cy="80" r="2" fill={color} opacity="0.35" />
          </>
        )}
      </svg>
      {/* Icon centered */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ paddingTop: size * 0.05 }}
      >
        <Icon
          size={iconSize}
          color="white"
          strokeWidth={earned ? 2 : 1.5}
          fill={earned ? 'rgba(255,255,255,0.3)' : 'none'}
        />
      </div>
    </div>
  );
}

/* ── Badge card ──────────────────────────────────────────────── */

function BadgeCard({
  def,
  earned,
  progress,
}: {
  def: AchievementDef;
  earned: boolean;
  progress: number; // 0-1
}) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
      style={{
        boxShadow: earned
          ? `0 4px 16px rgba(0,0,0,0.08), 0 0 0 1.5px ${def.hexColor}33`
          : '0 2px 8px rgba(0,0,0,0.06)',
        opacity: earned ? 1 : 0.6,
      }}
    >
      <HexBadge
        color={def.hexColor}
        colorDark={def.hexColorDark}
        Icon={def.IconComponent}
        earned={earned}
      />
      <p className="font-display text-sm font-bold text-gray-900">{def.title}</p>
      <p className="font-ui text-xs text-gray-500 leading-snug">{def.description}</p>

      {earned ? (
        <div className="flex items-center gap-1">
          <CheckCircle size={13} style={{ color: '#16A34A' }} strokeWidth={2} />
          <span className="font-ui text-xs font-bold" style={{ color: '#16A34A' }}>Completed</span>
        </div>
      ) : progress > 0 ? (
        <div className="w-full">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress * 100}%`, background: def.hexColor }}
            />
          </div>
          <p className="font-ui text-[10px] text-gray-400 mt-0.5">{Math.round(progress * 100)}%</p>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Lock size={12} color="#9CA3AF" strokeWidth={2} />
          <span className="font-ui text-xs text-gray-400">Locked</span>
        </div>
      )}
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export default function AchievementsPage() {
  const stats         = useUserStore((s) => s.stats);
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const lessonsCompleted  = stats?.lessonsCompleted  ?? 0;
  const totalXp           = stats?.totalXp           ?? 0;

  function isEarned(def: AchievementDef): boolean {
    switch (def.conditionType) {
      case 'lessons_completed': return lessonsCompleted >= def.conditionValue;
      case 'streak_days':       return currentStreak >= def.conditionValue;
      case 'total_xp':          return totalXp >= def.conditionValue;
      case 'perfect_lesson':    return false; // needs explicit tracking
      default:                  return false;
    }
  }

  function getProgress(def: AchievementDef): number {
    switch (def.conditionType) {
      case 'lessons_completed': return Math.min(lessonsCompleted / def.conditionValue, 1);
      case 'streak_days':       return Math.min(currentStreak / def.conditionValue, 1);
      case 'total_xp':          return Math.min(totalXp / def.conditionValue, 1);
      default:                  return 0;
    }
  }

  const earnedCount = ACHIEVEMENT_DEFS.filter(isEarned).length;

  return (
    <div className="min-h-screen pb-6" style={{ background: '#F8F7FF' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-bold text-gray-900">Achievements</h1>
        <span
          className="font-display text-sm font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: '#8A2BE2', color: 'white' }}
        >
          {earnedCount} earned
        </span>
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {ACHIEVEMENT_DEFS.map((def, i) => {
          const earned = isEarned(def);
          const prog   = getProgress(def);
          return (
            <motion.div
              key={def.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <BadgeCard def={def} earned={earned} progress={prog} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
