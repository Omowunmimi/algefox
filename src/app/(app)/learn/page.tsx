'use client';

import { UnitSection } from '@/components/path/UnitSection';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Mock data (used until DB is seeded) ───────────────────── */
const MOCK_SECTIONS: SectionProgress[] = [
  {
    sectionId: 'sec1',
    sectionSlug: 'fractions-intro',
    sectionTitle: 'Introduction to Fractions',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: true,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec2',
    sectionSlug: 'fractions-operations',
    sectionTitle: 'Fraction Operations',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec3',
    sectionSlug: 'algebra-intro',
    sectionTitle: 'Introduction to Algebra',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec4',
    sectionSlug: 'algebra-expressions',
    sectionTitle: 'Algebraic Expressions',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
];

const FRACTIONS_SECTIONS = MOCK_SECTIONS.slice(0, 2);
const ALGEBRA_SECTIONS = MOCK_SECTIONS.slice(2, 4);

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 mb-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">Learn</h1>
        <p className="font-ui text-sm text-gray-500 mt-0.5">
          Choose a section to begin or continue
        </p>
      </div>

      <div className="px-5 pb-8">
        <UnitSection
          unitTitle="Fractions"
          subject="fractions"
          sections={FRACTIONS_SECTIONS}
        />

        <UnitSection
          unitTitle="Algebra"
          subject="algebra"
          sections={ALGEBRA_SECTIONS}
        />
      </div>
    </div>
  );
}
