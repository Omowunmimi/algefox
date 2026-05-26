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

  /** sectionSlug → highest level number completed (1-based) */
  completedSections: Record<string, number>;

  /* Actions */
  setProfile: (profile: UserProfile) => void;
  setStats: (stats: UserStats) => void;
  mergeStats: (incoming: UserStats) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateStats: (partial: Partial<UserStats>) => void;
  loseHeart: () => void;
  addXp: (amount: number) => void;
  completeSection: (slug: string, level: number) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/* ── Store ─────────────────────────────────────────────────── */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      stats: null,
      isLoading: false,
      error: null,
      completedSections: {},

      setProfile: (profile) => set({ profile }),

      setStats: (stats) => set({ stats }),

      // Merge incoming DB stats — take max for accumulative fields so
      // local optimistic updates are never overwritten by a stale DB read
      mergeStats: (incoming) =>
        set((state) => {
          const local = state.stats;
          if (!local) return { stats: incoming };
          return {
            stats: {
              totalXp: Math.max(local.totalXp, incoming.totalXp),
              level: Math.max(local.level, incoming.level),
              hearts: incoming.hearts, // always trust DB for hearts
              maxHearts: incoming.maxHearts,
              heartsLastRefill: incoming.heartsLastRefill,
              lessonsCompleted: Math.max(local.lessonsCompleted, incoming.lessonsCompleted),
              questionsAnswered: Math.max(local.questionsAnswered, incoming.questionsAnswered),
              questionsCorrect: Math.max(local.questionsCorrect, incoming.questionsCorrect),
            },
          };
        }),

      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...partial } : null,
        })),

      updateStats: (partial) =>
        set((state) => ({
          stats: {
            totalXp: 0, level: 1, hearts: 5, maxHearts: 5,
            heartsLastRefill: null, lessonsCompleted: 0,
            questionsAnswered: 0, questionsCorrect: 0,
            ...(state.stats ?? {}),
            ...partial,
          },
        })),

      loseHeart: () =>
        set((state) => {
          if (!state.stats) return state;
          const hearts = Math.max(0, state.stats.hearts - 1);
          return { stats: { ...state.stats, hearts } };
        }),

      addXp: (amount) =>
        set((state) => {
          const base = state.stats ?? {
            totalXp: 0, level: 1, hearts: 5, maxHearts: 5,
            heartsLastRefill: null, lessonsCompleted: 0,
            questionsAnswered: 0, questionsCorrect: 0,
          };
          const totalXp = base.totalXp + amount;
          const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
          return { stats: { ...base, totalXp, level } };
        }),

      completeSection: (slug, level) =>
        set((state) => {
          const prev = state.completedSections[slug] ?? 0;
          if (level <= prev) return state; // already recorded a higher level
          return {
            completedSections: { ...state.completedSections, [slug]: level },
          };
        }),

      reset: () =>
        set({ profile: null, stats: null, isLoading: false, error: null, completedSections: {} }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'algefox-user',
      partialize: (state) => ({
        profile: state.profile,
        stats: state.stats,
        completedSections: state.completedSections,
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
