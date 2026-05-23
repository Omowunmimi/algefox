'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── Sound categories ──────────────────────────────────────── */
export type SoundKey =
  | 'correct'
  | 'incorrect'
  | 'level_complete'
  | 'achievement'
  | 'button_tap'
  | 'streak_milestone'
  | 'heart_lost'
  | 'xp_gain';

/* ── State ─────────────────────────────────────────────────── */
interface AudioState {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number; // 0–1
  musicVolume: number; // 0–1

  /* Actions */
  toggleSfx: () => void;
  toggleMusic: () => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  playSound: (key: SoundKey) => void;
}

/* ── Sound file mapping ────────────────────────────────────── */
const SOUND_FILES: Record<SoundKey, string> = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  level_complete: '/sounds/level-complete.mp3',
  achievement: '/sounds/achievement.mp3',
  button_tap: '/sounds/button-tap.mp3',
  streak_milestone: '/sounds/streak-milestone.mp3',
  heart_lost: '/sounds/heart-lost.mp3',
  xp_gain: '/sounds/xp-gain.mp3',
};

/* ── Lazy Howl instances cache ─────────────────────────────── */
// We lazy-load Howler to avoid SSR issues
const soundCache: Partial<Record<SoundKey, unknown>> = {};

async function getHowl(key: SoundKey, volume: number): Promise<{ play: () => void } | null> {
  if (typeof window === 'undefined') return null;

  if (soundCache[key]) return soundCache[key] as { play: () => void };

  const { Howl } = await import('howler');
  const howl = new Howl({
    src: [SOUND_FILES[key]],
    volume,
    preload: false,
  });
  soundCache[key] = howl;
  return howl as unknown as { play: () => void };
}

/* ── Store ─────────────────────────────────────────────────── */
export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      sfxEnabled: true,
      musicEnabled: false, // off by default — less intrusive
      sfxVolume: 0.7,
      musicVolume: 0.4,

      toggleSfx: () => set((s) => ({ sfxEnabled: !s.sfxEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),

      playSound: async (key: SoundKey) => {
        const { sfxEnabled, sfxVolume } = get();
        if (!sfxEnabled) return;

        const howl = await getHowl(key, sfxVolume);
        howl?.play();
      },
    }),
    {
      name: 'algefox-audio',
      partialize: (s) => ({
        sfxEnabled: s.sfxEnabled,
        musicEnabled: s.musicEnabled,
        sfxVolume: s.sfxVolume,
        musicVolume: s.musicVolume,
      }),
    },
  ),
);
