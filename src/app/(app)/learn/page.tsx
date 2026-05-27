'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, Check, Lock, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import type { SectionProgress } from '@/types/lesson.types';

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
  { sectionId: 'sec1', sectionSlug: 'fractions-intro',       sectionTitle: 'Introduction to Fractions', totalLevels: 20, color: '#EA580C', bg: '#FFF7ED' },
  { sectionId: 'sec2', sectionSlug: 'fractions-operations',  sectionTitle: 'Fraction Operations',       totalLevels: 20, color: '#EA580C', bg: '#FFF7ED' },
  { sectionId: 'sec3', sectionSlug: 'algebra-intro',         sectionTitle: 'Introduction to Algebra',   totalLevels: 20, color: '#8A2BE2', bg: '#F5F0FF' },
  { sectionId: 'sec4', sectionSlug: 'algebra-expressions',   sectionTitle: 'Algebraic Expressions',     totalLevels: 20, color: '#8A2BE2', bg: '#F5F0FF' },
];

function buildSections(completedSections: Record<string, number>): (SectionProgress & { color: string; bg: string })[] {
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
      color: def.color,
      bg: def.bg,
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
  sectionSlug,
  onTap,
}: {
  level: number;
  state: 'completed' | 'active' | 'locked';
  isActive: boolean;
  offsetRight: boolean;
  color: string;
  sectionSlug: string;
  onTap: (sectionSlug: string, level: number) => void;
}) {
  const isCompleted = state === 'completed';
  const isLocked = state === 'locked';

  return (
    <div
      className="flex flex-col items-center"
      style={{ alignSelf: offsetRight ? 'flex-end' : 'flex-start', marginRight: offsetRight ? 0 : undefined, marginLeft: !offsetRight ? 0 : undefined }}
    >
      {/* Active: Foxy sticker beside node */}
      {isActive && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-1"
        >
          <Image src="/mascot/foxy-excited.png" alt="Foxy" width={44} height={44} className="object-contain" />
        </motion.div>
      )}

      <motion.button
        onClick={() => !isLocked && onTap(sectionSlug, level)}
        whileTap={!isLocked ? { scale: 0.9 } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: isActive ? 60 : 52,
          height: isActive ? 60 : 52,
          background: isLocked
            ? '#E5E7EB'
            : isCompleted
              ? color
              : `linear-gradient(135deg, ${color}, ${color}CC)`,
          boxShadow: isLocked
            ? 'none'
            : isActive
              ? `0 6px 0 0 ${color}99, 0 0 0 4px ${color}33`
              : `0 4px 0 0 ${color}99`,
          border: isActive ? `3px solid white` : 'none',
        }}
        aria-label={`Lesson ${level}`}
      >
        {isCompleted && <Check size={22} color="white" strokeWidth={2.5} />}
        {isActive && <span className="font-display font-bold text-white text-lg">{level}</span>}
        {isLocked && <Lock size={18} color="#9CA3AF" strokeWidth={2} />}
      </motion.button>

      {/* Active tooltip */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-2 bg-white rounded-2xl px-3 py-2 text-center"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 120 }}
        >
          <p className="font-display text-xs font-bold text-gray-900">Lesson {level}</p>
          <motion.button
            className="mt-1.5 w-full rounded-xl py-1.5 font-display font-bold text-white text-xs"
            style={{ background: color, boxShadow: `0 3px 0 0 ${color}BB` }}
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
  section: SectionProgress & { color: string; bg: string };
  onLessonTap: (sectionSlug: string, level: number) => void;
}) {
  const completedCount = section.highestLevel;
  const totalLevels = 20;
  const showLevels = Math.min(totalLevels, Math.max(completedCount + 3, 5));

  // Build node states
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
    <div className="pb-4">
      {/* Section header banner */}
      <div
        className="mx-4 mb-6 rounded-2xl px-4 py-3 flex items-center justify-between"
        style={{ background: section.isUnlocked ? section.color : '#E5E7EB' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          >
            <BookOpen size={18} color="white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white leading-tight">{section.sectionTitle}</p>
            <p className="font-ui text-xs text-white/80 mt-0.5">
              {section.highestLevel} / {totalLevels} lessons
            </p>
          </div>
        </div>
        {section.isUnlocked && (
          <ChevronRight size={18} color="white" strokeWidth={2} />
        )}
      </div>

      {/* Progress bar */}
      {section.isUnlocked && (
        <div className="mx-4 mb-5">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: section.bg }}>
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
        <div className="px-12 flex flex-col gap-4">
          {nodes.map(({ level, state }, i) => {
            const offsetRight = i % 4 === 1 || i % 4 === 2;
            return (
              <div key={level} className="flex flex-col">
                {/* Connector line */}
                {i > 0 && (
                  <div
                    className="mx-auto mb-0"
                    style={{
                      width: 2,
                      height: 16,
                      background: nodes[i - 1].state === 'completed'
                        ? section.color
                        : '#E5E7EB',
                      alignSelf: 'center',
                    }}
                  />
                )}
                <LessonNode
                  level={level}
                  state={state}
                  isActive={state === 'active'}
                  offsetRight={offsetRight}
                  color={section.color}
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
          <p className="font-ui text-sm font-semibold text-gray-400">Complete previous section to unlock</p>
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
