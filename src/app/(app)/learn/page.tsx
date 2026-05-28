'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, Check, Lock, Zap } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { Button, ProgressBar } from '@/components/ui';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Lesson name catalogue ─────────────────────────────────── */
const LESSON_NAMES: Record<string, string[]> = {
  'fractions-intro': [
    'What is a Fraction?', 'Parts of a Whole', 'Naming Fractions', 'Equal Parts',
    'Fractions on a Number Line', 'Comparing Fractions', 'Ordering Fractions', 'Equivalent Fractions',
    'Simplifying Fractions', 'Unit Fractions', 'Mixed Numbers', 'Improper Fractions',
    'Fraction Word Problems', 'Visual Fractions', 'Fraction Patterns', 'Fraction Challenge',
    'Advanced Fractions', 'Mastery Practice', 'Final Review', 'Section Complete',
  ],
  'fractions-operations': [
    'Adding Like Fractions', 'Adding Unlike Fractions', 'Adding Mixed Numbers', 'Subtracting Like Fractions',
    'Subtracting Unlike Fractions', 'Subtracting Mixed Numbers', 'Multiplying Fractions', 'Multiplying Mixed',
    'Dividing Fractions', 'Dividing Mixed Numbers', 'Mixed Operations', 'Order of Operations',
    'Complex Fractions', 'Word Problems', 'Speed Round', 'Challenge Mode',
    'Mastery Test', 'Advanced Practice', 'Final Review', 'Section Complete',
  ],
  'algebra-intro': [
    'What is Algebra?', 'Variables and Values', 'Writing Expressions', 'Reading Expressions',
    'Evaluating Expressions', 'Simple Equations', 'Solving for X', 'Checking Solutions',
    'Two-Step Equations', 'Word Problems', 'Number Patterns', 'Function Machines',
    'Tables and Graphs', 'Substitution', 'Algebra Challenge', 'Mixed Practice',
    'Mastery Test', 'Advanced Practice', 'Final Review', 'Section Complete',
  ],
  'algebra-expressions': [
    'Like Terms', 'Collecting Like Terms', 'Expanding Brackets', 'Factorising Basics',
    'Substitution', 'Formulae', 'Changing the Subject', 'Linear Expressions',
    'Quadratic Basics', 'Expression Puzzles', 'Real-World Algebra', 'Multi-Step Problems',
    'Expression Challenge', 'Mixed Expressions', 'Speed Practice', 'Advanced Expressions',
    'Mastery Test', 'Final Practice', 'Final Review', 'Section Complete',
  ],
};

function getLessonName(sectionSlug: string, level: number): string {
  const names = LESSON_NAMES[sectionSlug];
  if (names && level >= 1 && level <= names.length) return names[level - 1];
  return `Lesson ${level}`;
}

/* ── Section catalogue ─────────────────────────────────────── */
interface SectionDef {
  sectionId: string;
  sectionSlug: string;
  sectionTitle: string;
  totalLevels: number;
  color: string;
  bg: string;
}

const SECTION_DEFS: SectionDef[] = [
  { sectionId: 'sec1', sectionSlug: 'fractions-intro',       sectionTitle: 'Introduction to Fractions', totalLevels: 20, color: '#F97316', bg: '#FFF7ED' },
  { sectionId: 'sec2', sectionSlug: 'fractions-operations',  sectionTitle: 'Fraction Operations',       totalLevels: 20, color: '#F97316', bg: '#FFF7ED' },
  { sectionId: 'sec3', sectionSlug: 'algebra-intro',         sectionTitle: 'Introduction to Algebra',   totalLevels: 20, color: '#7C3AED', bg: '#F5F3FF' },
  { sectionId: 'sec4', sectionSlug: 'algebra-expressions',   sectionTitle: 'Algebraic Expressions',     totalLevels: 20, color: '#7C3AED', bg: '#F5F3FF' },
];

function buildSections(
  completedSections: Record<string, number>,
): (SectionProgress & { color: string; bg: string })[] {
  return SECTION_DEFS.map((def, index) => {
    const highestLevel = completedSections[def.sectionSlug] ?? 0;
    const prevSlug = index > 0 ? SECTION_DEFS[index - 1].sectionSlug : null;
    const isUnlocked = index === 0 || (prevSlug ? (completedSections[prevSlug] ?? 0) >= 1 : false);
    return {
      sectionId:       def.sectionId,
      sectionSlug:     def.sectionSlug,
      sectionTitle:    def.sectionTitle,
      currentLevel:    highestLevel + 1,
      highestLevel,
      isUnlocked,
      isCompleted:     highestLevel >= def.totalLevels,
      progressPercent: Math.min(highestLevel / def.totalLevels, 1),
      color:           def.color,
      bg:              def.bg,
    };
  });
}

/* ── Lesson tooltip ────────────────────────────────────────── */
function LessonTooltip({
  lessonName,
  sectionSlug,
  level,
  onStart,
}: {
  lessonName: string;
  sectionSlug: string;
  level: number;
  onStart: (s: string, l: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute left-16 top-1/2 -translate-y-1/2 bg-white rounded-2xl px-4 py-3 z-20"
      style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.14)', minWidth: 160, whiteSpace: 'nowrap' }}
    >
      {/* Tail pointing left */}
      <span
        className="absolute -left-2 top-1/2 -translate-y-1/2"
        style={{
          width: 0,
          height: 0,
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderRight: '8px solid white',
        }}
      />
      <p className="font-display text-sm font-bold text-gray-900 mb-2">{lessonName}</p>
      <Button
        onClick={() => onStart(sectionSlug, level)}
        size="sm"
        fullWidth
        leftIcon={<Zap size={12} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />}
        className="text-xs"
        style={{ background: '#8A2BE2', boxShadow: '0 3px 0 0 #5B1483' }}
      >
        Start +10 XP
      </Button>
    </motion.div>
  );
}

/* ── Section path ──────────────────────────────────────────── */
function SectionPath({
  section,
  onLessonTap,
}: {
  section: SectionProgress & { color: string; bg: string };
  onLessonTap: (sectionSlug: string, level: number) => void;
}) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const completedCount = section.highestLevel;
  const totalLevels = 20;
  const showLevels = Math.min(totalLevels, Math.max(completedCount + 4, 6));

  const nodes = Array.from({ length: showLevels }, (_, i) => {
    const level = i + 1;
    const state: 'completed' | 'active' | 'locked' =
      level <= completedCount ? 'completed' : level === completedCount + 1 ? 'active' : 'locked';
    return { level, state };
  });

  return (
    <div className="pb-4">
      {/* Section header */}
      <div
        className="mx-4 mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: section.isUnlocked ? section.color : '#E5E7EB',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.22)' }}
        >
          <BookOpen size={17} color="white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold text-white leading-tight">{section.sectionTitle}</p>
          <p className="font-ui text-xs text-white/80 mt-0.5">{section.highestLevel} / {totalLevels} lessons</p>
        </div>
      </div>

      {/* Progress bar */}
      {section.isUnlocked && (
        <div className="mx-4 mb-4">
          <ProgressBar
            value={Math.max(section.progressPercent * 100, 2)}
            variant={section.sectionSlug.startsWith('fractions') ? 'gold' : 'secondary'}
            size="thin"
          />
        </div>
      )}

      {/* Straight-line node path */}
      {section.isUnlocked && (
        <div className="relative px-4">
          {/* Foxy mascot floating on right side at active level */}
          {nodes.map(({ level, state }, i) => {
            if (state !== 'active') return null;
            return (
              <div
                key={`foxy-${level}`}
                className="absolute right-0 z-10 flex items-center"
                style={{ top: i * 64 + 8 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src="/mascot/foxy-excited.png"
                    alt="Foxy"
                    width={52}
                    height={52}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </div>
            );
          })}

          {/* Nodes column */}
          <div className="flex flex-col items-start" style={{ paddingLeft: 4 }}>
            {nodes.map(({ level, state }, i) => {
              const isCompleted = state === 'completed';
              const isActive    = state === 'active';
              const isLocked    = state === 'locked';
              const lessonName  = getLessonName(section.sectionSlug, level);

              return (
                <div key={level} className="flex flex-col items-start">
                  {/* Connector */}
                  {i > 0 && (
                    <div
                      style={{
                        width: 4,
                        height: 14,
                        marginLeft: 32,
                        background: nodes[i - 1].state === 'completed' ? '#FFB12D' : '#E5E7EB',
                        borderRadius: 2,
                      }}
                    />
                  )}

                  {/* Node row */}
                  <div className="flex items-center gap-3 relative">
                    <motion.button
                      onClick={() => {
                        if (isLocked) return;
                        if (activeTooltip === level) {
                          setActiveTooltip(null);
                        } else {
                          setActiveTooltip(level);
                          if (isCompleted) onLessonTap(section.sectionSlug, level);
                        }
                      }}
                      whileTap={!isLocked ? { y: 5, boxShadow: 'none' } : undefined}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width:       isActive ? 76 : 68,
                        height:      isActive ? 56 : 50,
                        borderRadius: 9999,
                        background:  isLocked ? '#E5E5E5' : isCompleted ? '#FFB12D' : '#FFB12D',
                        boxShadow:   isLocked ? '0 5px 0 0 #B7B7B7' : isActive ? '0 6px 0 0 #C47D00' : '0 5px 0 0 #DD9111',
                        border:      isActive ? '3px solid #FFF0C8' : 'none',
                      }}
                      aria-label={lessonName}
                    >
                      {isCompleted && <Check size={22} color="white" strokeWidth={2.5} />}
                      {isActive    && <span className="font-display font-bold text-white text-xl">{level}</span>}
                      {isLocked    && <Lock  size={18} color="#9CA3AF" strokeWidth={2} />}
                    </motion.button>

                    {/* Lesson name beside node */}
                    {!isLocked && (
                      <p
                        className="font-ui text-sm font-semibold leading-tight"
                        style={{ color: isActive ? section.color : '#9CA3AF', maxWidth: 160 }}
                      >
                        {lessonName}
                      </p>
                    )}

                    {/* Tooltip on active node tap */}
                    <AnimatePresence>
                      {isActive && activeTooltip === level && (
                        <LessonTooltip
                          key="tooltip"
                          lessonName={lessonName}
                          sectionSlug={section.sectionSlug}
                          level={level}
                          onStart={onLessonTap}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked section */}
      {!section.isUnlocked && (
        <div className="mx-4 rounded-2xl bg-gray-100 py-6 flex flex-col items-center gap-2">
          <Lock size={28} color="#9CA3AF" strokeWidth={1.5} />
          <p className="font-ui text-sm font-semibold text-gray-400">Complete the previous section to unlock</p>
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function LearnPage() {
  const router = useRouter();
  const completedSections = useUserStore((s) => s.completedSections);
  const sections = buildSections(completedSections);

  function handleLessonTap(sectionSlug: string, level: number) {
    router.push(`/lesson/${sectionSlug}/${level}`);
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="px-4 pt-5 pb-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">Learn</h1>
        <p className="font-ui text-sm text-gray-500 mt-0.5">Choose where to continue</p>
      </div>

      {sections.map((section, i) => (
        <motion.div
          key={section.sectionId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
        >
          <SectionPath section={section} onLessonTap={handleLessonTap} />
        </motion.div>
      ))}
    </div>
  );
}
