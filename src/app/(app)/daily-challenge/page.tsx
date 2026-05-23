/**
 * Daily Challenge Screen
 * Today's bonus challenge — 5 questions for extra XP.
 *
 * TODO: Implement with DailyChallengeCard (Epic 5)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Challenge',
};

export default function DailyChallengePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">
        Daily Challenge
      </h1>
      <p className="text-gray-500 font-ui">Daily challenge — coming soon</p>
    </div>
  );
}
