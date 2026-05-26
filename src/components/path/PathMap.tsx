'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Star, Trophy, BookOpen, Calculator } from 'lucide-react';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import type { SectionProgress } from '@/types/lesson.types';

interface PathMapProps {
  sections: SectionProgress[];
  currentSectionId: string | null;
}

/* ── Section visual config ─────────────────────────────────── */

interface SectionTheme {
  gradient: string;
  shadowColor: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ReactNode;
  emoji: string;
  world: string;
  bgPattern: string;
}

const SECTION_THEMES: Record<string, SectionTheme> = {
  'fractions-intro': {
    gradient: 'from-orange-400 via-amber-400 to-yellow-300',
    shadowColor: '#d97706',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: <span className="font-display font-bold text-white text-2xl">½</span>,
    emoji: '🍕',
    world: 'Fraction Forest',
    bgPattern: 'bg-orange-50',
  },
  'fractions-operations': {
    gradient: 'from-rose-400 via-pink-400 to-fuchsia-400',
    shadowColor: '#be185d',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    icon: <span className="font-display font-bold text-white text-2xl">÷</span>,
    emoji: '🧮',
    world: 'Operations Ocean',
    bgPattern: 'bg-rose-50',
  },
  'algebra-intro': {
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    shadowColor: '#5b21b6',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    icon: <span className="font-display font-bold text-white text-2xl">x</span>,
    emoji: '🔮',
    world: 'Algebra Academy',
    bgPattern: 'bg-violet-50',
  },
  'algebra-expressions': {
    gradient: 'from-teal-500 via-cyan-500 to-sky-500',
    shadowColor: '#0e7490',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    icon: <Calculator className="text-white w-6 h-6" />,
    emoji: '🏔️',
    world: 'Expression Summit',
    bgPattern: 'bg-teal-50',
  },
};

function getTheme(slug: string): SectionTheme {
  return SECTION_THEMES[slug] ?? {
    gradient: 'from-blue-400 to-indigo-500',
    shadowColor: '#5B1483',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    icon: <BookOpen className="text-white w-6 h-6" />,
    emoji: '📚',
    world: 'Knowledge Keep',
    bgPattern: 'bg-blue-50',
  };
}

/* ── Stars display ─────────────────────────────────────────── */
function StarsRow({ level, total }: { level: number; total: number }) {
  const pct = Math.min(level / total, 1);
  const filled = Math.round(pct * 3);
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < filled ? 'text-gold fill-gold' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

/* ── Single adventure section card ────────────────────────── */
function SectionCard({
  section,
  isActive,
  showFoxy,
}: {
  section: SectionProgress;
  isActive: boolean;
  showFoxy: boolean;
}) {
  const router = useRouter();
  const theme = getTheme(section.sectionSlug);
  const pct = Math.min((section.highestLevel / 20) * 100, 100);

  function handleStart() {
    if (!section.isUnlocked) return;
    router.push(`/lesson/${section.sectionSlug}/${section.currentLevel}`);
  }

  if (!section.isUnlocked) {
    /* ── Locked card ── */
    return (
      <div
        className="relative rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-100 opacity-70"
      >
        <div className="flex items-center gap-4 p-5">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-ui text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
              {theme.world}
            </p>
            <p className="font-display text-base font-bold text-gray-400 line-clamp-1">
              {section.sectionTitle}
            </p>
            <p className="font-ui text-xs text-gray-400 mt-1">
              🔒 Complete the previous topic to unlock
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Unlocked card ── */
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleStart}
      className="relative rounded-3xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: isActive
          ? `0 8px 0 0 ${theme.shadowColor}, 0 12px 32px rgba(0,0,0,0.18)`
          : `0 6px 0 0 ${theme.shadowColor}, 0 8px 20px rgba(0,0,0,0.12)`,
      }}
    >
      {/* Coloured top banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} p-5 flex items-center gap-4 relative`}>
        {/* World emoji / icon circle */}
        <div className="w-14 h-14 rounded-2xl bg-white/25 flex items-center justify-center shrink-0 text-2xl select-none">
          {theme.emoji}
        </div>

        {/* Titles */}
        <div className="flex-1 min-w-0">
          <p className="font-ui text-xs font-bold text-white/80 uppercase tracking-wide mb-0.5">
            {theme.world}
          </p>
          <p className="font-display text-lg font-bold text-white leading-tight line-clamp-2">
            {section.sectionTitle}
          </p>
        </div>

        {/* Completed badge */}
        {section.isCompleted && (
          <div className="shrink-0 bg-white/20 rounded-full p-1.5">
            <Trophy className="w-5 h-5 text-gold" />
          </div>
        )}

        {/* "You are here" + Foxy */}
        {isActive && showFoxy && (
          <div className="absolute -top-2 -right-2">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FoxyImage expression="encouraging" size={60} />
            </motion.div>
          </div>
        )}
      </div>

      {/* White bottom section */}
      <div className={`${theme.bgPattern} px-5 py-4`}>
        {/* Level + stars */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`font-ui text-xs font-bold ${theme.badgeText} ${theme.badgeBg} px-2 py-0.5 rounded-full`}>
              Level {section.currentLevel}
            </span>
            <StarsRow level={section.highestLevel} total={20} />
          </div>
          <span className="font-ui text-xs text-gray-500 font-semibold">
            {section.highestLevel}/20
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
          />
        </div>

        {/* CTA button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97, y: 3, boxShadow: 'none' }}
          style={{ boxShadow: '0 4px 0 0 #5B1483' }}
          className="w-full bg-cta text-white font-display font-bold text-base py-3 rounded-2xl"
        >
          {section.isCompleted
            ? '🏆 Replay'
            : section.highestLevel > 0
              ? '▶ Continue'
              : '🚀 Start Adventure'}
        </motion.button>
      </div>

      {/* Pulsing border for active */}
      {isActive && (
        <div
          className={`absolute inset-0 rounded-3xl pointer-events-none ring-4 ring-offset-2 ring-primary/40`}
          style={{ animation: 'breathe 2.5s ease-in-out infinite' }}
        />
      )}
    </motion.div>
  );
}

/* ── Path connector between cards ──────────────────────────── */
function PathConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div className="flex flex-col items-center py-1 gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors duration-500 ${
            isCompleted ? 'bg-cta' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

/* ── World heading between units ────────────────────────────── */
function WorldHeading({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 px-2 pt-2 pb-1">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="font-display text-base font-bold text-gray-800">{title}</p>
        <p className="font-ui text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

/* ── Main PathMap ────────────────────────────────────────────── */

export function PathMap({ sections, currentSectionId }: PathMapProps) {
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (!sections.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <p className="font-ui text-gray-500">No sections available yet.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 flex flex-col gap-3">
      {sections.map((section, index) => {
        const isActive = section.sectionId === currentSectionId;
        const showFoxy = isActive;
        const prevCompleted = index === 0 ? true : (sections[index - 1]?.isCompleted ?? false);

        // Insert world heading before algebra sections
        const showHeading =
          (index === 0 && section.sectionSlug.startsWith('fractions')) ||
          (index === 2 && section.sectionSlug.startsWith('algebra'));

        return (
          <div
            key={section.sectionId}
            ref={isActive ? activeRef : undefined}
          >
            {showHeading && (
              <WorldHeading
                icon={index === 0 ? '🌿' : '🔮'}
                title={index === 0 ? 'World 1 — Fraction Forest' : 'World 2 — Algebra Academy'}
                subtitle={index === 0 ? 'Master fractions from basics to operations' : 'Conquer variables and expressions'}
              />
            )}

            {/* Connector before card (except first) */}
            {index > 0 && (
              <PathConnector isCompleted={prevCompleted} />
            )}

            <SectionCard
              section={section}
              isActive={isActive}
              showFoxy={showFoxy}
            />
          </div>
        );
      })}

      {/* End of path message */}
      <div className="mt-4 rounded-3xl bg-gradient-to-r from-gold to-amber-400 p-5 flex items-center gap-4">
        <span className="text-4xl">🏆</span>
        <div>
          <p className="font-display text-base font-bold text-white">Master it all!</p>
          <p className="font-ui text-xs text-white/80">Complete every world to become an AlgeFox Champion</p>
        </div>
      </div>
    </div>
  );
}
