'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, Check, Lock } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Lesson name catalogue ─────────────────────────────────────── */
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
  if (names && level >= 1 && level <= names.length) {
    return names[level - 1];
  }
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
  headerBg: string;
}

const SECTION_DEFS: SectionDef[] = [
  {
    sectionId: 'sec1',
    sectionSlug: 'fractions-intro',
    sectionTitle: 'Introduction to Fractions',
    totalLevels: 20,
    color: '#2563EB',
    bg: '#EFF6FF',
    headerBg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
  },
  {
    sectionId: 'sec2',
    sectionSlug: 'fractions-operations',
    sectionTitle: 'Fraction Operations',
    totalLevels: 20,
    color: '#059669',
    bg: '#ECFDF5',
    headerBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },
  {
    sectionId: 'sec3',
    sectionSlug: 'algebra-intro',
    sectionTitle: 'Introduction to Algebra',
    totalLevels: 20,
    color: '#7C3AED',
    bg: '#F5F3FF',
    headerBg: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
  },
  {
    sectionId: 'sec4',
    sectionSlug: 'algebra-expressions',
    sectionTitle: 'Algebraic Expressions',
    totalLevels: 20,
    color: '#DB2777',
    bg: '#FDF2F8',
    headerBg: 'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)',
  },
];

function buildSections(
  completedSections: Record<string, number>,
): (SectionProgress & { color: string; bg: string; headerBg: string })[] {
  return SECTION_DEFS.map((def, index) => {
    const highestLevel = completedSections[def.sectionSlug] ?? 0;
    const prevSlug = index > 0 ? SECTION_DEFS[index - 1].sectionSlug : null;
    const isUnlocked =
      index === 0 || (prevSlug ? (completedSections[prevSlug] ?? 0) >= 1 : false);
    return {
      sectionId: def.sectionId,
      sectionSlug: def.sectionSlug,
      sectionTitle: def.sectionTitle,
      currentLevel: highestLevel + 1,
      highestLevel,
      isUnlocked,
      isCompleted: highestLevel >= def.totalLevels,
      progressPercent: Math.min(highestLevel / def.totalLevels, 1),
      color: def.color,
      bg: def.bg,
      headerBg: def.headerBg,
    };
  });
}

/* ── Lesson node ───────────────────────────────────────────── */
function LessonNode({
  level,
  state,
  isActive,
  offsetRight,
  color,
  bg,
  sectionSlug,
  onTap,
}: {
  level: number;
  state: 'completed' | 'active' | 'locked';
  isActive: boolean;
  offsetRight: boolean;
  color: string;
  bg: string;
  sectionSlug: string;
  onTap: (sectionSlug: string, level: number) => void;
}) {
  const isCompleted = state === 'completed';
  const isLocked = state === 'locked';
  const lessonName = getLessonName(sectionSlug, level);

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      style={{
        alignSelf: offsetRight ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Active: Foxy sticker above node */}
      {isActive && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src="/mascot/foxy-excited.png"
            alt="Foxy"
            width={48}
            height={48}
            className="object-contain"
          />
        </motion.div>
      )}

      <motion.button
        onClick={() => !isLocked && onTap(sectionSlug, level)}
        whileTap={!isLocked ? { scale: 0.9 } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: isActive ? 72 : 64,
          height: isActive ? 72 : 64,
          background: isLocked
            ? '#E5E7EB'
            : isCompleted
            ? color
            : `linear-gradient(135deg, ${color}, ${color}CC)`,
          boxShadow: isLocked
            ? 'none'
            : isActive
            ? `0 6px 0 0 ${color}99, 0 0 0 5px ${color}22`
            : `0 5px 0 0 ${color}99`,
          border: isActive ? `3px solid white` : 'none',
        }}
        aria-label={lessonName}
      >
        {isCompleted && <Check size={24} color="white" strokeWidth={2.5} />}
        {isActive && <span className="font-display font-bold text-white text-xl">{level}</span>}
        {isLocked && <Lock size={20} color="#9CA3AF" strokeWidth={2} />}
      </motion.button>

      {/* Lesson name */}
      {!isLocked && (
        <p
          className="font-ui text-xs font-semibold text-center leading-tight max-w-24"
          style={{ color: isActive ? color : '#6B7280' }}
        >
          {lessonName}
        </p>
      )}

      {/* Active tooltip popup */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl px-3 py-2.5 text-center mt-1"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 130 }}
        >
          <p className="font-display text-xs font-bold text-gray-900 leading-tight">{lessonName}</p>
          <motion.button
            onClick={() => onTap(sectionSlug, level)}
            className="mt-1.5 w-full rounded-xl py-1.5 font-display font-bold text-white text-xs"
            style={{
              background: color,
              boxShadow: `0 3px 0 0 ${color}BB`,
            }}
            whileTap={{ y: 3, boxShadow: 'none' }}
          >
            Start +10 XP
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

/* ── Section path ──────────────────────────────────────────── */
function SectionPath({
  section,
  onLessonTap,
}: {
  section: SectionProgress & { color: string; bg: string; headerBg: string };
  onLessonTap: (sectionSlug: string, level: number) => void;
}) {
  const completedCount = section.highestLevel;
  const totalLevels = 20;
  const showLevels = Math.min(totalLevels, Math.max(completedCount + 3, 5));

  const nodes = Array.from({ length: showLevels }, (_, i) => {
    const level = i + 1;
    const state: 'completed' | 'active' | 'locked' =
      level <= completedCount
        ? 'completed'
        : level === completedCount + 1
        ? 'active'
        : 'locked';
    return { level, state };
  });

  return (
    <div className="pb-6">
      {/* Section header banner */}
      <div
        className="mx-4 mb-5 rounded-2xl px-4 py-3.5 flex items-center gap-3"
        style={{
          background: section.isUnlocked ? section.headerBg : '#E5E7EB',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          <BookOpen size={18} color="white" strokeWidth={2} />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white leading-tight">
            {section.sectionTitle}
          </p>
          <p className="font-ui text-xs text-white/80 mt-0.5">
            {section.highestLevel} / {totalLevels} lessons
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {section.isUnlocked && (
        <div className="mx-4 mb-5">
          <div
            className="w-full h-2.5 rounded-full overflow-hidden"
            style={{ background: section.bg }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: section.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(section.progressPercent * 100, 2)}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Winding path nodes */}
      {section.isUnlocked && (
        <div className="px-10 flex flex-col gap-3">
          {nodes.map(({ level, state }, i) => {
            const offsetRight = i % 4 === 1 || i % 4 === 2;
            return (
              <div key={level} className="flex flex-col">
                {/* Connector line */}
                {i > 0 && (
                  <div
                    style={{
                      width: 2,
                      height: 14,
                      background:
                        nodes[i - 1].state === 'completed' ? section.color : '#E5E7EB',
                      alignSelf: 'center',
                      marginBottom: 2,
                    }}
                  />
                )}
                <LessonNode
                  level={level}
                  state={state}
                  isActive={state === 'active'}
                  offsetRight={offsetRight}
                  color={section.color}
                  bg={section.bg}
                  sectionSlug={section.sectionSlug}
                  onTap={onLessonTap}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Locked state */}
      {!section.isUnlocked && (
        <div className="mx-4 rounded-2xl bg-gray-100 py-6 flex flex-col items-center gap-2">
          <Lock size={28} color="#9CA3AF" strokeWidth={1.5} />
          <p className="font-ui text-sm font-semibold text-gray-400">
            Complete the previous section to unlock
          </p>
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
    <div className="min-h-screen" style={{ background: '#F8F7FF' }}>
      {/* Page title */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">Learn</h1>
        <p className="font-ui text-sm text-gray-500 mt-0.5">Choose where to continue</p>
      </div>

      <AnimatePresence>
        {sections.map((section, i) => (
          <motion.div
            key={section.sectionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <SectionPath section={section} onLessonTap={handleLessonTap} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
