import type { AchievementCategory } from './database.types';

/**
 * Gamification system types.
 */

/* ── XP & Levels ───────────────────────────────────────────── */
export interface XPAward {
  base: number;
  accuracyBonus: number;
  speedBonus: number;
  streakMultiplier: number;
  perfectBonus: number;
  total: number;
}

export interface LevelThreshold {
  level: number;
  xpRequired: number;
  title: string;
}

/* ── Hearts ────────────────────────────────────────────────── */
export interface HeartsState {
  current: number;
  max: number;
  /** ISO timestamp of last refill */
  lastRefillAt: string | null;
  /** Minutes until next heart (null if full) */
  minutesUntilNextHeart: number | null;
}

/* ── Streak ────────────────────────────────────────────────── */
export interface StreakState {
  current: number;
  longest: number;
  /** ISO date string of last activity */
  lastActivityDate: string | null;
  /** Whether the streak shield will protect today */
  shieldActive: boolean;
  /** Has the user already completed a lesson today? */
  practicedToday: boolean;
}

/* ── Achievements ──────────────────────────────────────────── */
export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  conditionType: string;
  conditionValue: number;
  /** Whether the user has earned this */
  earned: boolean;
  earnedAt?: string;
}

export interface AchievementToast {
  achievement: Achievement;
  xpGained: number;
}

/* ── Mascot / Ayo ──────────────────────────────────────────── */
export type MascotExpression =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'celebrating'
  | 'thinking'
  | 'encouraging'
  | 'sad'
  | 'surprised';

export interface MascotMessage {
  text: string;
  expression: MascotExpression;
  /** Auto-dismiss after ms (0 = stay) */
  duration?: number;
}

/* ── Daily Challenge ───────────────────────────────────────── */
export interface DailyChallenge {
  id: string;
  date: string; // ISO date
  sectionId: string;
  bonusXp: number;
  completed: boolean;
  completedAt?: string;
}

/* ── Leaderboard (future) ──────────────────────────────────── */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarId: string;
  totalXp: number;
  rank: number;
  isCurrentUser: boolean;
}
