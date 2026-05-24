'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SkillLevel, AuthProvider } from '@/types/database.types';

/* ── Types ─────────────────────────────────────────────────── */
export interface UserProfile {
  id: string;
  username: string;
  avatarId: string;
  authProvider: AuthProvider;
  onboardingCompleted: boolean;
  onboardingStep: number;
  skillLevel: SkillLevel | null;
  participantId: string | null;
}

export interface UserStats {
  totalXp: number;
  level: number;
  hearts: number;
  maxHearts: number;
  heartsLastRefill: string | null;
  lessonsCompleted: number;
  questionsAnswered: number;
  questionsCorrect: number;
}

interface UserState {
  profile: UserProfile | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;

  /* Actions */
  setProfile: (profile: UserProfile) => void;
  setStats: (stats: UserStats) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateStats: (partial: Partial<UserStats>) => void;
  loseHeart: () => void;
  addXp: (amount: number) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/* ── Store ─────────────────────────────────────────────────── */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      stats: null,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile }),

      setStats: (stats) => set({ stats }),

      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...partial } : null,
        })),

      updateStats: (partial) =>
        set((state) => ({
          stats: state.stats ? { ...state.stats, ...partial } : null,
        })),

      loseHeart: () =>
        set((state) => {
          if (!state.stats) return state;
          const hearts = Math.max(0, state.stats.hearts - 1);
          return { stats: { ...state.stats, hearts } };
        }),

      addXp: (amount) =>
        set((state) => {
          if (!state.stats) return state;
          const totalXp = state.stats.totalXp + amount;
          // Simple level calculation — level = floor(sqrt(totalXp / 100)) + 1
          const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
          return { stats: { ...state.stats, totalXp, level } };
        }),

      reset: () => set({ profile: null, stats: null, isLoading: false, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'algefox-user',
      // Only persist non-sensitive UI state; auth is managed by Supabase
      partialize: (state) => ({
        profile: state.profile,
        stats: state.stats,
      }),
    },
  ),
);

/* ── Selectors ─────────────────────────────────────────────── */
export const selectProfile = (s: UserState) => s.profile;
export const selectStats = (s: UserState) => s.stats;
export const selectHasHearts = (s: UserState) => (s.stats?.hearts ?? 0) > 0;
export const selectAccuracy = (s: UserState) => {
  const { questionsAnswered, questionsCorrect } = s.stats ?? {};
  if (!questionsAnswered) return 0;
  return Math.round(((questionsCorrect ?? 0) / questionsAnswered) * 100);
};
