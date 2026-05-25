'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useGameStore } from '@/stores/useGameStore';
import type { Achievement } from '@/types/gamification.types';
import type { UserStats } from '@/stores/useUserStore';

/* ── Fallback achievements used when DB table is empty ──────── */
const FALLBACK_ACHIEVEMENTS: Achievement[] = [
  { id: 'local-1', slug: 'first-lesson', title: 'First Step', description: 'Complete your first lesson', icon: '🎯', category: 'completion', xpReward: 50, conditionType: 'lessons_completed', conditionValue: 1, earned: false },
  { id: 'local-2', slug: 'streak-3', title: 'On a Roll', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', xpReward: 75, conditionType: 'streak_days', conditionValue: 3, earned: false },
  { id: 'local-3', slug: 'streak-7', title: 'Week Warrior', description: '7-day streak!', icon: '🌟', category: 'streak', xpReward: 150, conditionType: 'streak_days', conditionValue: 7, earned: false },
  { id: 'local-4', slug: 'perfect-lesson', title: 'Perfect Score', description: 'Complete a lesson with no mistakes', icon: '💯', category: 'accuracy', xpReward: 100, conditionType: 'perfect_lesson', conditionValue: 1, earned: false },
  { id: 'local-5', slug: 'level-10', title: 'Level 10 Legend', description: 'Reach Level 10', icon: '🏆', category: 'mastery', xpReward: 200, conditionType: 'level', conditionValue: 10, earned: false },
  { id: 'local-6', slug: 'xp-500', title: 'XP Collector', description: 'Earn 500 total XP', icon: '⚡', category: 'mastery', xpReward: 50, conditionType: 'total_xp', conditionValue: 500, earned: false },
  { id: 'local-7', slug: 'questions-50', title: 'Question Master', description: 'Answer 50 questions', icon: '❓', category: 'completion', xpReward: 100, conditionType: 'questions_answered', conditionValue: 50, earned: false },
  { id: 'local-8', slug: 'accuracy-90', title: 'Sharp Mind', description: 'Maintain 90% accuracy over 10+ questions', icon: '🎓', category: 'accuracy', xpReward: 150, conditionType: 'accuracy_pct', conditionValue: 90, earned: false },
];

/* ── Types ─────────────────────────────────────────────────── */

interface DbAchievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
  is_active: boolean;
}

interface DbUserAchievement {
  achievement_id: string;
  earned_at: string;
}

/* ── Hook ───────────────────────────────────────────────────── */

interface UseAchievementsReturn {
  achievements: Achievement[];
  checkAchievements: (
    stats: UserStats,
    streak: number,
    wasPerfect?: boolean,
  ) => Promise<void>;
  isLoading: boolean;
}

export function useAchievements(): UseAchievementsReturn {
  const [isLoading, setIsLoading] = useState(true);

  const achievements = useGameStore((s) => s.achievements);
  const setAchievements = useGameStore((s) => s.setAchievements);

  /* ── Fetch & merge on mount ─────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    async function fetchAchievements() {
      try {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch all active achievements and user's earned records in parallel
        const [achievementsResult, userAchievementsResult] = await Promise.all([
          supabase
            .from('achievements')
            .select('id, slug, title, description, icon, category, xp_reward, condition_type, condition_value, is_active')
            .eq('is_active', true),
          supabase
            .from('user_achievements')
            .select('achievement_id, earned_at')
            .eq('user_id', user.id),
        ]);

        if (cancelled) return;

        const dbAchievements: DbAchievement[] = achievementsResult.data ?? [];
        const earned: DbUserAchievement[] = userAchievementsResult.data ?? [];

        const earnedMap = new Map(earned.map((ua) => [ua.achievement_id, ua.earned_at]));

        // If the achievements table is empty/not seeded, fall back to local definitions
        const sourceList = dbAchievements.length > 0 ? dbAchievements.map((row) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          icon: row.icon,
          category: row.category as Achievement['category'],
          xpReward: row.xp_reward,
          conditionType: row.condition_type,
          conditionValue: row.condition_value,
          earned: earnedMap.has(row.id),
          earnedAt: earnedMap.get(row.id),
        })) : FALLBACK_ACHIEVEMENTS;

        setAchievements(sourceList);
      } catch {
        // Tables may not exist yet — silently fall back to empty state
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAchievements();
    return () => { cancelled = true; };
  }, [setAchievements]);

  /* ── Check & unlock achievements ───────────────────────── */

  const checkAchievements = useCallback(
    async (stats: UserStats, streak: number, wasPerfect = false): Promise<void> => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const unearned = useGameStore.getState().achievements.filter((a) => !a.earned);
      if (unearned.length === 0) return;

      const accuracy =
        stats.questionsAnswered > 10
          ? (stats.questionsCorrect / stats.questionsAnswered) * 100
          : 0;

      const newlyUnlocked: Achievement[] = [];

      for (const achievement of unearned) {
        const { conditionType, conditionValue } = achievement;
        let met = false;

        switch (conditionType) {
          case 'lessons_completed':
            met = stats.lessonsCompleted >= conditionValue;
            break;
          case 'streak_days':
            met = streak >= conditionValue;
            break;
          case 'perfect_lesson':
            met = wasPerfect && conditionValue <= 1;
            break;
          case 'level':
            met = stats.level >= conditionValue;
            break;
          case 'total_xp':
            met = stats.totalXp >= conditionValue;
            break;
          case 'questions_answered':
            met = stats.questionsAnswered >= conditionValue;
            break;
          case 'accuracy_pct':
            met = stats.questionsAnswered > 10 && accuracy >= conditionValue;
            break;
          default:
            met = false;
        }

        if (met) {
          newlyUnlocked.push(achievement);
        }
      }

      if (newlyUnlocked.length === 0) return;

      // Persist to DB and fire toasts (best-effort — errors are non-fatal)
      await Promise.allSettled(
        newlyUnlocked.map(async (achievement) => {
          // Only write to DB if it's a real DB achievement (not a local fallback)
          if (!achievement.id.startsWith('local-')) {
            try {
              await supabase.from('user_achievements').insert({
                user_id: user.id,
                achievement_id: achievement.id,
                earned_at: new Date().toISOString(),
              });
            } catch {
              // Non-fatal
            }
          }
          useGameStore.getState().unlockAchievement(achievement);
        }),
      );
    },
    [],
  );

  return { achievements, checkAchievements, isLoading };
}
