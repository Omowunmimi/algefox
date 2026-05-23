/**
 * Achievements Screen
 * Displays all 20 achievements (locked and unlocked).
 *
 * TODO: Implement with AchievementGrid (Epic 5)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achievements',
};

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">
        Achievements
      </h1>
      <p className="text-gray-500 font-ui">Achievement grid — coming soon</p>
    </div>
  );
}
