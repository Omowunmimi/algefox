'use client';

import { useUserStore } from '@/stores/useUserStore';
import { UnitSection } from '@/components/path/UnitSection';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Section catalogue ─────────────────────────────────────── */
interface SectionDef {
  sectionId: string;
  sectionSlug: string;
  sectionTitle: string;
  totalLevels: number;
}

const SECTION_DEFS: SectionDef[] = [
  { sectionId: 'sec1', sectionSlug: 'fractions-intro',       sectionTitle: 'Introduction to Fractions', totalLevels: 20 },
  { sectionId: 'sec2', sectionSlug: 'fractions-operations',  sectionTitle: 'Fraction Operations',       totalLevels: 20 },
  { sectionId: 'sec3', sectionSlug: 'algebra-intro',         sectionTitle: 'Introduction to Algebra',   totalLevels: 20 },
  { sectionId: 'sec4', sectionSlug: 'algebra-expressions',   sectionTitle: 'Algebraic Expressions',     totalLevels: 20 },
];

function buildSections(completedSections: Record<string, number>): SectionProgress[] {
  return SECTION_DEFS.map((def, index) => {
    const highestLevel = completedSections[def.sectionSlug] ?? 0;
    const prevSlug = index > 0 ? SECTION_DEFS[index - 1].sectionSlug : null;
    const isUnlocked = index === 0 || (prevSlug ? (completedSections[prevSlug] ?? 0) >= 1 : false);
    return {
      sectionId: def.sectionId,
      sectionSlug: def.sectionSlug,
      sectionTitle: def.sectionTitle,
      currentLevel: highestLevel + 1,
      highestLevel,
      isUnlocked,
      isCompleted: highestLevel >= def.totalLevels,
      progressPercent: Math.min(highestLevel / def.totalLevels, 1),
    };
  });
}

/* ── Page ──────────────────────────────────────────────────── */
export default function LearnPage() {
  const completedSections = useUserStore((s) => s.completedSections);
  const sections = buildSections(completedSections);

  const fractionsSections = sections.slice(0, 2);
  const algebraSections = sections.slice(2, 4);

  return (
    <div className="min-h-screen bg-gray-50">
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
          sections={fractionsSections}
        />

        <UnitSection
          unitTitle="Algebra"
          subject="algebra"
          sections={algebraSections}
        />
      </div>
    </div>
  );
}
