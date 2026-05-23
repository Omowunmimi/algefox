/**
 * Difficulty band utilities for the AlgeFox question generation engine.
 */

export type DifficultyBand = 1 | 2 | 3 | 4 | 5;

/**
 * Maps a lesson level number to a difficulty band.
 * Levels 1-4   → band 1 (intro)
 * Levels 5-9   → band 2 (developing)
 * Levels 10-14 → band 3 (consolidating)
 * Levels 15-19 → band 4 (extending)
 * Level 20+    → band 5 (mastery)
 */
export function getDifficultyBand(level: number): DifficultyBand {
  if (level >= 20) return 5;
  if (level >= 15) return 4;
  if (level >= 10) return 3;
  if (level >= 5)  return 2;
  return 1;
}

/**
 * How many questions to generate for a given level.
 * Always 10 for now.
 */
export function getQuestionsForLevel(_level: number): number {
  return 10;
}

/**
 * XP reward for completing a level at the given band.
 * band 1: 20xp, band 2: 30xp, band 3: 40xp, band 4: 55xp, band 5: 75xp
 */
export function getBaseXpForBand(band: DifficultyBand): number {
  const xpMap: Record<DifficultyBand, number> = {
    1: 20,
    2: 30,
    3: 40,
    4: 55,
    5: 75,
  };
  return xpMap[band];
}
