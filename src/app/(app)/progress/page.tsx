/**
 * Progress Screen
 * Displays accuracy charts, XP history, and completed sections.
 *
 * TODO: Implement with ProgressChart + UnitProgressBar (Epic 5)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Progress',
};

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">
        My Progress
      </h1>
      <p className="text-gray-500 font-ui">Progress charts — coming soon</p>
    </div>
  );
}
