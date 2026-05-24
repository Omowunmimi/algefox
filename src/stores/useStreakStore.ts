'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── State ─────────────────────────────────────────────────── */
interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // ISO date string YYYY-MM-DD
  shieldActive: boolean;

  /* Actions */
  setStreak: (data: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    shieldActive: boolean;
  }) => void;

  /** Call after a lesson is completed on a given date */
  recordActivity: (dateISO: string) => void;

  activateShield: () => void;
  deactivateShield: () => void;
  reset: () => void;
}

/* ── Helpers ───────────────────────────────────────────────── */
function toDateString(iso: string): string {
  return iso.split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

/* ── Store ─────────────────────────────────────────────────── */
export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      shieldActive: false,

      setStreak: ({ currentStreak, longestStreak, lastActivityDate, shieldActive }) =>
        set({ currentStreak, longestStreak, lastActivityDate, shieldActive }),

      recordActivity: (dateISO) => {
        const today = toDateString(dateISO);
        const { lastActivityDate, currentStreak, longestStreak } = get();

        if (lastActivityDate === today) {
          // Already recorded today — no change
          return;
        }

        let newStreak = 1;
        if (lastActivityDate) {
          const diff = daysBetween(lastActivityDate, today);
          if (diff === 1) {
            newStreak = currentStreak + 1;
          } else if (diff === 0) {
            newStreak = currentStreak;
          }
          // diff > 1 means streak broken → reset to 1
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, longestStreak),
          lastActivityDate: today,
        });
      },

      activateShield: () => set({ shieldActive: true }),
      deactivateShield: () => set({ shieldActive: false }),
      reset: () => set({ currentStreak: 0, longestStreak: 0, lastActivityDate: null, shieldActive: false }),
    }),
    {
      name: 'algefox-streak',
    },
  ),
);

/* ── Selectors ─────────────────────────────────────────────── */
export const selectPracticedToday = (s: StreakState): boolean => {
  if (!s.lastActivityDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return s.lastActivityDate === today;
};

export const selectStreakAtRisk = (s: StreakState): boolean => {
  if (!s.lastActivityDate || s.currentStreak === 0) return false;
  // Risk = last activity was yesterday and user hasn't practiced today
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  return s.lastActivityDate === yesterday;
};
