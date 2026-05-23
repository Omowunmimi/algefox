'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import type { SectionProgress } from '@/types/lesson.types';
import { cn } from '@/lib/utils/cn';

interface UnitSectionProps {
  unitTitle: string;
  subject: 'fractions' | 'algebra';
  sections: SectionProgress[];
}

function SubjectIcon({ subject }: { subject: 'fractions' | 'algebra' }) {
  if (subject === 'fractions') {
    return (
      <div className="flex flex-col items-center leading-none text-white">
        <span className="font-display font-bold text-sm leading-none">1</span>
        <div className="w-4 h-0.5 bg-white my-0.5 rounded-full" />
        <span className="font-display font-bold text-sm leading-none">2</span>
      </div>
    );
  }
  return (
    <span className="font-display font-bold text-xl text-white leading-none">x</span>
  );
}

function SectionCard({
  section,
  index,
  subject,
}: {
  section: SectionProgress;
  index: number;
  subject: 'fractions' | 'algebra';
}) {
  const router = useRouter();
  const isFractions = subject === 'fractions';

  function handleTap() {
    if (!section.isUnlocked) return;
    router.push(`/lesson/${section.sectionSlug}/${section.currentLevel}`);
  }

  const progressPct = Math.round(section.progressPercent * 100);

  return (
    <motion.div
      onClick={handleTap}
      whileTap={section.isUnlocked ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={section.isUnlocked ? { boxShadow: 'var(--shadow-physical)' } : undefined}
      className={cn(
        'bg-white rounded-2xl border-2 p-4 mb-3 flex items-center gap-4',
        section.isUnlocked
          ? cn(
              'border-gray-100 cursor-pointer',
              isFractions ? 'hover:border-primary-light' : 'hover:border-secondary-light',
            )
          : 'border-gray-100 opacity-60 cursor-not-allowed',
      )}
      aria-label={
        section.isUnlocked
          ? `${section.sectionTitle} — Level ${section.currentLevel}`
          : `${section.sectionTitle} — Locked`
      }
    >
      {/* Section number circle */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-lg',
          section.isUnlocked
            ? isFractions
              ? 'bg-primary text-white'
              : 'bg-secondary text-white'
            : 'bg-gray-200 text-gray-400',
        )}
      >
        {index + 1}
      </div>

      {/* Middle: title + level */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-ui font-semibold text-sm leading-tight truncate',
            section.isUnlocked ? 'text-gray-900' : 'text-gray-400',
          )}
        >
          {section.sectionTitle}
        </p>
        <p
          className={cn(
            'font-ui text-xs mt-0.5',
            section.isUnlocked ? 'text-gray-500' : 'text-gray-400',
          )}
        >
          Level {section.currentLevel}
        </p>
      </div>

      {/* Right: status indicator */}
      <div className="shrink-0 flex items-center">
        {!section.isUnlocked && (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
        {section.isUnlocked && section.isCompleted && (
          <CheckCircle2 className="w-6 h-6 text-success" />
        )}
        {section.isUnlocked && !section.isCompleted && (
          <div className="flex flex-col items-end gap-1">
            <span className="font-ui text-xs font-bold text-gray-500">{progressPct}%</span>
            <div className="w-14 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isFractions ? 'bg-primary' : 'bg-secondary',
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function UnitSection({ unitTitle, subject, sections }: UnitSectionProps) {
  const isFractions = subject === 'fractions';

  return (
    <div className="mb-6">
      {/* Unit header banner */}
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-4 rounded-2xl mb-4',
          isFractions ? 'bg-primary' : 'bg-secondary',
        )}
        style={{ boxShadow: isFractions ? 'var(--shadow-physical-primary)' : 'var(--shadow-physical-secondary)' }}
      >
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            isFractions ? 'bg-primary-dark' : 'bg-secondary-dark',
          )}
        >
          <SubjectIcon subject={subject} />
        </div>
        <h2 className="font-display text-xl font-bold text-white leading-tight">
          {unitTitle}
        </h2>
      </div>

      {/* Section cards */}
      <div className="px-1">
        {sections.map((section, index) => (
          <SectionCard
            key={section.sectionId}
            section={section}
            index={index}
            subject={subject}
          />
        ))}
      </div>
    </div>
  );
}
