'use client';

import { motion } from 'framer-motion';
import { LessonNode, NodeState } from './LessonNode';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Constants ───────────────────────────────────────────────── */
const SECTION_HEIGHT = 660;
const MILESTONE_LEVELS = [1, 5, 10, 15, 20] as const;

/* ── Consistent purple theme ─────────────────────────────────── */
const PURPLE_GRADIENT: [string, string] = ['#8A2BE2', '#5B1483'];
const PURPLE_SHADOW = '#3B0764';

/* ── Section metadata ────────────────────────────────────────── */
const SECTION_INFO: Record<string, { label: string; worldNum: number }> = {
  'fractions-intro':      { label: 'Introduction to Fractions', worldNum: 1 },
  'fractions-operations': { label: 'Fraction Operations',        worldNum: 2 },
  'algebra-intro':        { label: 'Introduction to Algebra',    worldNum: 3 },
  'algebra-expressions':  { label: 'Algebraic Expressions',      worldNum: 4 },
};

/* ── Node positions (zigzag) ─────────────────────────────────── */
const RIGHT_POSITIONS = [
  { x: 50, y: 80  },
  { x: 72, y: 210 },
  { x: 50, y: 340 },
  { x: 28, y: 470 },
  { x: 50, y: 600 },
] as const;

const LEFT_POSITIONS = [
  { x: 50, y: 80  },
  { x: 28, y: 210 },
  { x: 50, y: 340 },
  { x: 72, y: 470 },
  { x: 50, y: 600 },
] as const;

const RIGHT_PATH =
  'M 50 80  C 50 145,72 145,72 210  C 72 275,50 275,50 340  C 50 405,28 405,28 470  C 28 535,50 535,50 600';
const LEFT_PATH =
  'M 50 80  C 50 145,28 145,28 210  C 28 275,50 275,50 340  C 50 405,72 405,72 470  C 72 535,50 535,50 600';

/* ── Node-state computation ──────────────────────────────────── */
function computeNodeStates(section: SectionProgress): NodeState[] {
  if (!section.isUnlocked) {
    return MILESTONE_LEVELS.map(() => 'locked' as NodeState);
  }
  let currentFound = false;
  return MILESTONE_LEVELS.map((ml) => {
    if (section.highestLevel >= ml) return 'completed' as NodeState;
    if (!currentFound) {
      currentFound = true;
      return 'current' as NodeState;
    }
    return 'upcoming' as NodeState;
  });
}

/* ── Section header ──────────────────────────────────────────── */
function SectionHeader({ sectionSlug, isUnlocked }: { sectionSlug: string; isUnlocked: boolean }) {
  const info = SECTION_INFO[sectionSlug] ?? { label: sectionSlug, worldNum: 1 };

  return (
    <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-100">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white"
        style={
          isUnlocked
            ? { background: 'linear-gradient(135deg, #8A2BE2, #5B1483)', boxShadow: '0 3px 0 0 #3B0764' }
            : { background: '#D1D5DB', boxShadow: '0 3px 0 0 #9CA3AF' }
        }
      >
        {info.worldNum}
      </div>
      <div>
        <p
          className="font-ui text-[10px] font-bold uppercase tracking-widest leading-none"
          style={{ color: isUnlocked ? '#8A2BE2' : '#9CA3AF' }}
        >
          World {info.worldNum}
        </p>
        <p className="font-display text-base font-bold text-gray-800 leading-tight mt-0.5">
          {info.label}
        </p>
      </div>

      {!isUnlocked && (
        <div className="ml-auto">
          <span className="font-ui text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
            Locked
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Progress bar under header ───────────────────────────────── */
function SectionProgressBar({ percent }: { percent: number }) {
  if (percent <= 0) return null;
  return (
    <div className="px-5 py-2 bg-white">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-purple-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #8A2BE2, #5B1483)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percent * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="font-ui text-xs text-gray-500 tabular-nums w-9 text-right">
          {Math.round(percent * 100)}%
        </span>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
interface WorldSectionProps {
  section: SectionProgress;
  worldIndex: number;
  onNodeClick: (sectionSlug: string, level: number) => void;
}

export function WorldSection({ section, worldIndex, onNodeClick }: WorldSectionProps) {
  const isRight = worldIndex % 2 === 0;
  const positions = isRight ? RIGHT_POSITIONS : LEFT_POSITIONS;
  const svgPath = isRight ? RIGHT_PATH : LEFT_PATH;
  const nodeStates = computeNodeStates(section);

  function handleNodePress(state: NodeState) {
    if (state === 'locked') return;
    onNodeClick(section.sectionSlug, section.currentLevel);
  }

  return (
    <div className="mb-1">
      {/* Section label */}
      <SectionHeader sectionSlug={section.sectionSlug} isUnlocked={section.isUnlocked} />
      <SectionProgressBar percent={section.progressPercent} />

      {/* Path area — clean cream background */}
      <div
        className="relative w-full overflow-hidden select-none"
        style={{ height: SECTION_HEIGHT, background: '#FAF7F0' }}
      >
        {/* Winding path SVG */}
        <svg
          className="absolute inset-0 z-10 pointer-events-none"
          width="100%"
          height="100%"
          viewBox={`0 0 100 ${SECTION_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Thick track (light purple) */}
          <path
            d={svgPath}
            fill="none"
            stroke="#EDE9FE"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Dashed purple accent */}
          <path
            d={svgPath}
            fill="none"
            stroke="#8A2BE2"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="5 11"
            opacity={0.5}
          />
        </svg>

        {/* Lesson nodes */}
        {positions.map((pos, i) => {
          const state = nodeStates[i];
          const ml = MILESTONE_LEVELS[i];
          const isBoss = i === 4;

          return (
            <div
              key={i}
              className="absolute z-20"
              style={{
                left: `${pos.x}%`,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <LessonNode
                state={state}
                milestoneLevel={ml}
                isBoss={isBoss}
                nodeGradient={PURPLE_GRADIENT}
                shadowColor={PURPLE_SHADOW}
                onClick={() => handleNodePress(state)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
