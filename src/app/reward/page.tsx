/**
 * Reward / Level Complete Screen
 * Shown after a successful lesson: XP summary, confetti, and next step CTA.
 *
 * TODO: Implement with XPSummary + ConfettiEffect (Epic 4)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Level Complete!',
};

export default function RewardPage() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="text-center text-white">
        <p className="font-display text-4xl font-bold mb-2">Level Complete!</p>
        <p className="font-ui opacity-80">Reward screen — coming soon</p>
      </div>
    </div>
  );
}
