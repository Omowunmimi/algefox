'use client';

import { create } from 'zustand';
import type { Achievement, MascotExpression, MascotMessage, AchievementToast } from '@/types/gamification.types';

/* ── State ─────────────────────────────────────────────────── */
interface GameState {
  /* Achievements */
  achievements: Achievement[];
  pendingToasts: AchievementToast[];

  /* Mascot */
  mascotExpression: MascotExpression;
  mascotMessage: MascotMessage | null;

  /* UI flags */
  showConfetti: boolean;
  activeModal: string | null;

  /* Actions */
  setAchievements: (achievements: Achievement[]) => void;
  unlockAchievement: (achievement: Achievement) => void;
  dismissToast: () => void;
  setMascotExpression: (expression: MascotExpression) => void;
  showMascotMessage: (message: MascotMessage) => void;
  clearMascotMessage: () => void;
  triggerConfetti: () => void;
  stopConfetti: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

/* ── Store ─────────────────────────────────────────────────── */
export const useGameStore = create<GameState>()((set) => ({
  achievements: [],
  pendingToasts: [],
  mascotExpression: 'idle',
  mascotMessage: null,
  showConfetti: false,
  activeModal: null,

  setAchievements: (achievements) => set({ achievements }),

  unlockAchievement: (achievement) =>
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === achievement.id ? { ...a, earned: true, earnedAt: new Date().toISOString() } : a,
      ),
      pendingToasts: [
        ...state.pendingToasts,
        { achievement, xpGained: achievement.xpReward },
      ],
      mascotExpression: 'celebrating',
    })),

  dismissToast: () =>
    set((state) => ({ pendingToasts: state.pendingToasts.slice(1) })),

  setMascotExpression: (mascotExpression) => set({ mascotExpression }),

  showMascotMessage: (mascotMessage) =>
    set({ mascotMessage, mascotExpression: mascotMessage.expression }),

  clearMascotMessage: () => set({ mascotMessage: null, mascotExpression: 'idle' }),

  triggerConfetti: () => set({ showConfetti: true }),

  stopConfetti: () => set({ showConfetti: false }),

  openModal: (activeModal) => set({ activeModal }),

  closeModal: () => set({ activeModal: null }),
}));

/* ── Selectors ─────────────────────────────────────────────── */
export const selectEarnedAchievements = (s: GameState) =>
  s.achievements.filter((a) => a.earned);

export const selectNextToast = (s: GameState) =>
  s.pendingToasts[0] ?? null;
