'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Zap, Medal, Target, Trophy, TreePine, Waves, Atom, Mountain } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore, selectPracticedToday } from '@/stores/useStreakStore';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import { WorldSection } from '@/components/world/WorldSection';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Section catalogue ─────────────────────────────────────── */
const SECTION_DEFS = [
  { sectionId: 'sec1', sectionSlug: 'fractions-intro',      sectionTitle: 'Introduction to Fractions', totalLevels: 20 },
  { sectionId: 'sec2', sectionSlug: 'fractions-operations', sectionTitle: 'Fraction Operations',        totalLevels: 20 },
  { sectionId: 'sec3', sectionSlug: 'algebra-intro',        sectionTitle: 'Introduction to Algebra',    totalLevels: 20 },
  { sectionId: 'sec4', sectionSlug: 'algebra-expressions',  sectionTitle: 'Algebraic Expressions',      totalLevels: 20 },
] as const;

function buildSections(completedSections: Record<string, number>): SectionProgress[] {
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
    };
  });
}

/* ── Greeting helpers ──────────────────────────────────────── */
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFoxyMessage(streak: number, practicedToday: boolean) {
  if (practicedToday)
    return { text: 'Amazing! You practised today!', expression: 'celebrating' as const };
  if (streak > 6)
    return { text: `${streak}-day streak — you're on fire!`, expression: 'excited' as const };
  if (streak > 2)
    return { text: `${streak}-day streak! Keep it going!`, expression: 'encouraging' as const };
  return { text: "Ready for today's adventure?", expression: 'happy' as const };
}

/* ── Stat pill ─────────────────────────────────────────────── */
function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
    >
      {icon}
      <div className="flex flex-col leading-none">
        <span className="font-display text-sm font-bold text-white">{value}</span>
        <span className="font-ui text-[10px] text-white/70">{label}</span>
      </div>
    </div>
  );
}

/* ── Hero greeting banner ──────────────────────────────────── */
function HeroGreeting({
  name, streak, practicedToday, xp, level,
}: {
  name: string;
  streak: number;
  practicedToday: boolean;
  xp: number;
  level: number;
}) {
  const foxy = getFoxyMessage(streak, practicedToday);
  const greeting = getTimeGreeting();

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #8A2BE2 0%, #7A1CAC 55%, #5B1483 100%)' }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

      {/* Greeting row */}
      <div className="flex items-end justify-between px-5 pt-5 gap-2">
        <div className="flex-1 pb-3">
          <p className="font-ui text-white/70 text-sm">{greeting},</p>
          <h1 className="font-display text-2xl font-bold text-white leading-tight mt-0.5">
            {name}!
          </h1>
          <p className="font-ui text-sm text-white/85 mt-1.5 max-w-[220px] leading-snug">
            {foxy.text}
          </p>
        </div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="shrink-0 -mb-1"
        >
          <FoxyImage expression={foxy.expression} size={105} />
        </motion.div>
      </div>

      {/* Stats pills row */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        <StatPill
          icon={<Flame size={16} fill="#FB923C" stroke="#FB923C" strokeWidth={0} />}
          value={streak}
          label="Streak"
        />
        <StatPill
          icon={<Zap size={16} fill="#FCD34D" stroke="#FCD34D" strokeWidth={0} />}
          value={xp}
          label="XP"
        />
        <StatPill
          icon={<Medal size={16} className="text-amber-300" />}
          value={`Lv.${level}`}
          label="Level"
        />
      </div>
    </div>
  );
}

/* ── World section icon ────────────────────────────────────── */
function WorldIcon({ slug }: { slug: string }) {
  const map: Record<string, React.ReactNode> = {
    'fractions-intro':      <TreePine size={22} className="text-emerald-300" />,
    'fractions-operations': <Waves    size={22} className="text-sky-300" />,
    'algebra-intro':        <Atom     size={22} className="text-violet-300" />,
    'algebra-expressions':  <Mountain size={22} className="text-orange-300" />,
  };
  return <>{map[slug] ?? <Zap size={22} className="text-white/70" />}</>;
}

/* ── Current lesson module card ────────────────────────────── */
function ModuleCard({
  section,
  onPress,
}: {
  section: SectionProgress | null;
  onPress: () => void;
}) {
  if (!section) return null;

  const moduleLabels: Record<string, string> = {
    'fractions-intro':      'Module 1 • Fractions',
    'fractions-operations': 'Module 2 • Fractions',
    'algebra-intro':        'Module 3 • Algebra',
    'algebra-expressions':  'Module 4 • Algebra',
  };
  const moduleLabel = moduleLabels[section.sectionSlug] ?? 'Module';

  return (
    <div className="px-4 py-3">
      <motion.button
        className="w-full flex items-center gap-3 rounded-2xl overflow-hidden text-left"
        style={{
          background: '#1a1033',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onPress}
      >
        {/* Colored icon block */}
        <div
          className="flex-shrink-0 w-14 h-14 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8A2BE2, #5B1483)' }}
        >
          <WorldIcon slug={section.sectionSlug} />
        </div>

        <div className="flex-1 py-3 min-w-0">
          <p className="font-ui text-xs text-white/50 font-semibold uppercase tracking-wide">
            {moduleLabel}
          </p>
          <p className="font-display text-sm font-bold text-white truncate">
            {section.sectionTitle}
          </p>
        </div>

        <motion.div
          className="flex-shrink-0 mr-3 rounded-full px-4 py-1.5"
          style={{ background: '#8A2BE2', boxShadow: '0 3px 0 0 #5B1483' }}
          whileTap={{ y: 3, boxShadow: 'none' }}
        >
          <span className="font-display text-xs font-bold text-white">GO!</span>
        </motion.div>
      </motion.button>
    </div>
  );
}

/* ── Section label ─────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pt-4 pb-2">
      <p className="font-ui text-xs font-bold text-gray-400 uppercase tracking-widest">{children}</p>
    </div>
  );
}

/* ── Daily Challenge strip ─────────────────────────────────── */
function DailyChallengeBanner({ onPress }: { onPress: () => void }) {
  return (
    <div className="px-4 pb-3">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onPress}
        className="w-full rounded-2xl overflow-hidden flex items-center justify-between px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          boxShadow: '0 4px 0 0 #B45309',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Target size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="font-display text-sm font-bold text-white">Daily Challenge</p>
            <p className="font-ui text-xs text-white/80">Earn bonus XP today!</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-full px-3 py-1">
          <span className="font-ui text-xs font-bold text-white">Start</span>
        </div>
      </motion.button>
    </div>
  );
}

/* ── Champion footer ───────────────────────────────────────── */
function ChampionFooter() {
  return (
    <div
      className="relative overflow-hidden px-6 py-8 flex items-center gap-5"
      style={{ background: 'linear-gradient(135deg, #5B1483 0%, #8A2BE2 50%, #7C3AED 100%)' }}
    >
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <motion.div
        className="shrink-0 w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center"
        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Trophy size={32} className="fill-amber-300 stroke-amber-400" strokeWidth={0.5} />
      </motion.div>
      <div>
        <p className="font-display text-lg font-bold text-white leading-tight">
          Complete all 4 worlds!
        </p>
        <p className="font-ui text-sm text-white/80 mt-1">
          Conquer every level to become an AlgeFox Champion!
        </p>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const profile           = useUserStore((s) => s.profile);
  const stats             = useUserStore((s) => s.stats);
  const completedSections = useUserStore((s) => s.completedSections);
  const currentStreak     = useStreakStore((s) => s.currentStreak);
  const practicedToday    = useStreakStore(selectPracticedToday);

  const sections      = buildSections(completedSections);
  const username      = profile?.username ?? 'Champion';
  const activeSection = sections.find((s) => s.isUnlocked && !s.isCompleted) ?? null;

  function handleNodeClick(sectionSlug: string, level: number) {
    router.push(`/lesson/${sectionSlug}/${level}`);
  }

  function handleContinue() {
    if (activeSection) {
      router.push(`/lesson/${activeSection.sectionSlug}/${activeSection.currentLevel}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroGreeting
        name={username}
        streak={currentStreak}
        practicedToday={practicedToday}
        xp={stats?.totalXp ?? 0}
        level={stats?.level ?? 1}
      />

      {activeSection && (
        <>
          <SectionLabel>Continue Adventure</SectionLabel>
          <ModuleCard section={activeSection} onPress={handleContinue} />
        </>
      )}

      <SectionLabel>Daily Challenge</SectionLabel>
      <DailyChallengeBanner onPress={() => router.push('/daily-challenge')} />

      <SectionLabel>Adventure Map</SectionLabel>
      {sections.map((section, i) => (
        <WorldSection
          key={section.sectionId}
          section={section}
          worldIndex={i}
          onNodeClick={handleNodeClick}
        />
      ))}

      <ChampionFooter />
    </div>
  );
}
