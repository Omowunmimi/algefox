/**
 * Learn Screen — unit/section browser
 * Displays all units (Fractions + Algebra) and their sections.
 *
 * TODO: Implement with UnitCard + SectionList (Epic 3)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn',
};

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">
        Learn
      </h1>
      <p className="text-gray-500 font-ui">Unit browser — coming soon</p>
    </div>
  );
}
