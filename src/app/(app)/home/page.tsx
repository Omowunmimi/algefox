'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Zap, Coins } from 'lucide-react';
import Image from 'next/image';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore, selectPracticedToday } from '@/stores/useStreakStore';
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
    const highestLevel  = completedSections[def.sectionSlug] ?? 0;
    const prevSlug      = index > 0 ? SECTION_DEFS[index - 1].sectionSlug : null;
    const isUnlocked    = index === 0 || (prevSlug ? (completedSections[prevSlug] ?? 0) >= 1 : false);
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

/* ── Stat chip ─────────────────────────────────────────────── */
function StatChip({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-display text-base font-bold text-gray-900 tabular-nums">{value}</span>
      </div>
      <span className="font-ui text-[10px] text-gray-400 font-semibold">{label}</span>
    </div>
  );
}

/* ── Hero section with landscape ───────────────────────────── */
function HeroSection({
  activeSection,
  onContinue,
}: {
  activeSection: SectionProgress | null;
  onContinue: () => void;
}) {
  return (
    <div
      className="relative mx-4 rounded-3xl overflow-hidden"
      style={{ minHeight: '210px' }}
    >
      {/* Sky gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #B2E0F7 25%, #C8E6A0 55%, #7DC464 80%, #5BA443 100%)',
        }}
      />

      {/* Decorative clouds */}
      <div
        className="absolute rounded-full bg-white/80"
        style={{ width: 80, height: 30, top: '10%', left: '30%', filter: 'blur(2px)' }}
      />
      <div
        className="absolute rounded-full bg-white/70"
        style={{ width: 55, height: 22, top: '8%', left: '40%', filter: 'blur(1px)' }}
      />
      <div
        className="absolute rounded-full bg-white/60"
        style={{ width: 40, height: 18, top: '16%', right: '18%', filter: 'blur(2px)' }}
      />

      {/* Decorative flowers */}
      <div className="absolute bottom-0 left-[44%] text-2xl select-none" style={{ bottom: 2 }}>🌸</div>
      <div className="absolute bottom-0 left-[35%] text-xl select-none" style={{ bottom: 2 }}>🌼</div>

      {/* Foxy — large, bottom-left, slightly overflowing */}
      <div className="absolute bottom-0 left-0 z-10">
        <Image
          src="/mascot/foxy-full.png"
          alt="Foxy the fox"
          width={170}
          height={220}
          className="object-contain"
          priority
        />
      </div>

      {/* Continue Learning floating card */}
      {activeSection ? (
        <div
          className="absolute right-3 top-4 bottom-4 z-20 bg-white rounded-2xl p-4 flex flex-col justify-between shadow-md"
          style={{ width: '52%' }}
        >
          <div>
            <p className="font-ui text-xs font-bold uppercase tracking-wider" style={{ color: '#8A2BE2' }}>
              Continue Learning
            </p>
            <h3 className="font-display text-lg font-bold text-gray-900 mt-1 leading-tight">
              {activeSection.sectionTitle}
            </h3>
            <p className="font-ui text-xs text-gray-400 mt-0.5">
              Level {activeSection.currentLevel}
            </p>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: '#EDE9FE' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #8A2BE2, #5B1483)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(activeSection.progressPercent * 100, 3)}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
            <p className="font-ui text-[10px] text-gray-400 mt-1 text-right">
              {activeSection.highestLevel} / 20
            </p>
          </div>

          <motion.button
            onClick={onContinue}
            className="w-full rounded-xl py-2.5 font-display font-bold text-white text-sm flex items-center justify-center gap-1"
            style={{ background: 'linear-gradient(135deg, #8A2BE2, #5B1483)', boxShadow: '0 3px 0 0 #3B0764' }}
            whileTap={{ y: 3, boxShadow: 'none', scale: 0.98 }}
          >
            Continue Lesson <span>›</span>
          </motion.button>
        </div>
      ) : (
        <div
          className="absolute right-3 top-4 bottom-4 z-20 bg-white rounded-2xl p-4 flex flex-col justify-center items-center shadow-md text-center"
          style={{ width: '52%' }}
        >
          <p className="font-display text-base font-bold text-gray-900">You&apos;re all caught up!</p>
          <p className="font-ui text-xs text-gray-400 mt-1">Keep exploring the map below</p>
        </div>
      )}
    </div>
  );
}

/* ── Progress cards (side by side) ────────────────────────── */
const SECTION_ICONS: Record<string, string> = {
  'fractions-intro':      '🌲',
  'fractions-operations': '🌊',
  'algebra-intro':        '🏰',
  'algebra-expressions':  '⛰️',
};

function ProgressCards({ sections }: { sections: SectionProgress[] }) {
  const visible = sections.filter((s) => s.isUnlocked).slice(0, 4);
  if (visible.length === 0) return null;

  // Show 2 at a time in a row
  const pairs: SectionProgress[][] = [];
  for (let i = 0; i < visible.length; i += 2) {
    pairs.push(visible.slice(i, i + 2));
  }

  return (
    <div className="mx-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Your Progress</h2>
        <button className="font-ui text-sm font-semibold" style={{ color: '#8A2BE2' }}>View all</button>
      </div>

      {pairs.map((pair, pi) => (
        <div key={pi} className="flex gap-3 mb-3">
          {pair.map((s) => (
            <div
              key={s.sectionId}
              className="flex-1 bg-white rounded-2xl p-3 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl select-none">{SECTION_ICONS[s.sectionSlug] ?? '📚'}</span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-gray-900 leading-tight truncate">
                    {s.sectionTitle}
                  </p>
                  <p className="font-display text-base font-bold" style={{ color: '#8A2BE2' }}>
                    {Math.round(s.progressPercent * 100)}%
                  </p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#EDE9FE' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #8A2BE2, #5B1483)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(s.progressPercent * 100, s.isCompleted ? 100 : 2)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Daily challenge ───────────────────────────────────────── */
function DailyChallengeCard({ onPress }: { onPress: () => void }) {
  return (
    <div className="mx-4">
      <motion.button
        onClick={onPress}
        className="w-full rounded-2xl p-4 text-left flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #8A2BE2 0%, #7C3AED 50%, #6D28D9 100%)' }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Target icon in circle */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <span className="text-2xl select-none">🎯</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-bold text-white">Daily Challenge</p>
          <p className="font-ui text-xs text-white/80 mt-0.5">Earn 100 XP</p>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div className="w-[60%] h-full bg-white rounded-full" />
          </div>
          <p className="font-ui text-[10px] text-white/70 mt-0.5">60 / 100</p>
        </div>

        {/* Start Challenge button */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="rounded-xl px-3 py-1.5 bg-white">
            <span className="font-display text-xs font-bold" style={{ color: '#8A2BE2' }}>Start</span>
          </div>
          <span className="text-2xl select-none">🎁</span>
        </div>
      </motion.button>
    </div>
  );
}

/* ── Achievements ──────────────────────────────────────────── */
const ACHIEVEMENTS = [
  { id: 'first-steps',    emoji: '🐾', title: 'First Steps',       desc: 'Complete your first lesson',  color: '#FEF3C7', check: (l: number) => l >= 1 },
  { id: 'streak-master',  emoji: '🔥', title: 'Streak Master',     desc: 'Maintain a 3-day streak',     color: '#FFF7ED', check: (_: number, s: number) => s >= 3 },
  { id: 'fraction-exp',   emoji: '🥧', title: 'Fraction Explorer', desc: 'Finish 10 fraction lessons',  color: '#ECFDF5', check: (l: number) => l >= 10 },
  { id: 'quick-thinker',  emoji: '⚡', title: 'Quick Thinker',     desc: 'Answer 5 in a row correctly', color: '#EFF6FF', check: (l: number) => l >= 5 },
] as const;

function AchievementsSection({ lessonsCompleted, streak }: { lessonsCompleted: number; streak: number }) {
  return (
    <div className="mx-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Recent Achievements</h2>
        <button className="font-ui text-sm font-semibold" style={{ color: '#8A2BE2' }}>View all</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const earned = a.check(lessonsCompleted, streak);
          return (
            <div
              key={a.id}
              className="rounded-2xl p-3 bg-white shadow-sm"
              style={{ opacity: earned ? 1 : 0.55 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-2xl select-none"
                style={{ background: a.color }}
              >
                {a.emoji}
              </div>
              <p className="font-display text-sm font-bold text-gray-900">{a.title}</p>
              <p className="font-ui text-xs text-gray-500 mt-0.5">{a.desc}</p>
              {earned && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-success text-xs">✓</span>
                  <span className="font-ui text-xs font-bold text-success">Completed</span>
                </div>
              )}
            </div>
          );
        })}
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
  const firstName     = username.split(' ')[0];
  const totalXp       = stats?.totalXp ?? 0;
  const level         = stats?.level ?? 1;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const activeSection = sections.find((s) => s.isUnlocked && !s.isCompleted) ?? null;

  const greeting = practicedToday
    ? 'Great work today! 🌟'
    : currentStreak > 2
      ? `${currentStreak} day streak! 🔥`
      : "Ready for today's lesson?";

  function handleNodeClick(sectionSlug: string, lv: number) {
    router.push(`/lesson/${sectionSlug}/${lv}`);
  }

  function handleContinue() {
    if (activeSection) {
      router.push(`/lesson/${activeSection.sectionSlug}/${activeSection.currentLevel}`);
    }
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: '#f4f1fb' }}>

      {/* ── Greeting + stats row ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-4 pt-5 pb-4 flex items-start justify-between"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Hi, {firstName}! 👋
          </h2>
          <p className="font-ui text-sm text-gray-500 mt-0.5">{greeting}</p>
        </div>

        <div className="flex items-center gap-4 mt-1">
          <StatChip
            icon={<Flame size={16} fill="#F97316" stroke="#EA580C" strokeWidth={0.5} />}
            value={currentStreak}
            label="Streak"
          />
          <StatChip
            icon={<Zap size={16} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />}
            value={totalXp}
            label="XP"
          />
          <StatChip
            icon={<Coins size={16} className="text-amber-500" strokeWidth={1.5} />}
            value={level * 10}
            label="Coins"
          />
        </div>
      </motion.div>

      {/* ── Hero with landscape ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-5"
      >
        <HeroSection activeSection={activeSection} onContinue={handleContinue} />
      </motion.div>

      {/* ── Progress cards ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-5"
      >
        <ProgressCards sections={sections} />
      </motion.div>

      {/* ── Daily challenge ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-5"
      >
        <DailyChallengeCard onPress={() => router.push('/daily-challenge')} />
      </motion.div>

      {/* ── Adventure map ─────────────────────────────────── */}
      <div className="mb-5">
        <p className="font-ui text-xs font-bold text-gray-400 uppercase tracking-widest px-5 pb-2">
          Adventure Map
        </p>
        {sections.map((section, i) => (
          <WorldSection
            key={section.sectionId}
            section={section}
            worldIndex={i}
            onNodeClick={handleNodeClick}
          />
        ))}
      </div>

      {/* ── Achievements ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-4"
      >
        <AchievementsSection lessonsCompleted={lessonsCompleted} streak={currentStreak} />
      </motion.div>

    </div>
  );
}
