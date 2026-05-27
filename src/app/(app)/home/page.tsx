'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Flame, Zap, Star, Heart, Target, Gift,
  BookOpen, CheckCircle,
} from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore, selectPracticedToday } from '@/stores/useStreakStore';
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

/* ── Hero card ─────────────────────────────────────────────── */
function HeroCard({
  firstName,
  streak,
  xp,
  level,
  hearts,
}: {
  firstName: string;
  streak: number;
  xp: number;
  level: number;
  hearts: number;
}) {
  return (
    <div
      className="mx-4 rounded-3xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #8A2BE2 0%, #6D28D9 100%)',
        minHeight: 148,
      }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-0 right-16 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 pt-5 pl-5 pb-4 pr-32">
        <p className="font-display text-xl font-bold text-white leading-tight">
          Hi, {firstName}!
        </p>
        <p className="font-ui text-sm text-white/80 mt-0.5">Ready to learn today?</p>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          <StatChip icon={<Flame size={12} fill="#FB923C" stroke="#EA580C" strokeWidth={0.5} />} value={streak} />
          <StatChip icon={<Zap size={12} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />} value={xp} />
          <StatChip icon={<Star size={12} fill="#FBBF24" stroke="#D97706" strokeWidth={0.5} />} value={`Lv ${level}`} />
          <StatChip icon={<Heart size={12} fill="#FB7185" stroke="#E11D48" strokeWidth={0.5} />} value={hearts} />
        </div>
      </div>

      {/* Foxy bottom-right */}
      <div className="absolute bottom-0 right-0">
        <Image
          src="/mascot/foxy-happy.png"
          alt="Foxy"
          width={112}
          height={112}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

function StatChip({ icon, value }: { icon: React.ReactNode; value: string | number }) {
  return (
    <div
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-ui text-xs font-bold"
      style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}
    >
      {icon}
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

/* ── Continue Learning card ─────────────────────────────────── */
function ContinueLearningCard({
  activeSection,
  onContinue,
}: {
  activeSection: SectionProgress | null;
  onContinue: () => void;
}) {
  if (!activeSection) return null;

  return (
    <div
      className="mx-4 rounded-3xl bg-white p-4"
      style={{ boxShadow: '0 2px 16px rgba(138,43,226,0.08)' }}
    >
      <p className="font-ui text-xs font-bold uppercase tracking-widest" style={{ color: '#8A2BE2' }}>
        Continue Learning
      </p>
      <h3 className="font-display text-base font-bold text-gray-900 mt-1 leading-tight">
        {activeSection.sectionTitle}
      </h3>
      <p className="font-ui text-xs text-gray-400 mt-0.5">Level {activeSection.currentLevel}</p>

      <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: '#EDE9FE' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#8A2BE2' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(activeSection.progressPercent * 100, 3)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <p className="font-ui text-[10px] text-gray-400 mt-1 text-right">
        {activeSection.highestLevel} / 20
      </p>

      <motion.button
        onClick={onContinue}
        className="w-full mt-3 rounded-2xl py-3 font-display font-bold text-white text-sm flex items-center justify-center gap-1"
        style={{ background: '#8A2BE2', boxShadow: '0 4px 0 0 #5B1483' }}
        whileTap={{ y: 4, boxShadow: 'none' }}
      >
        Start Lesson <span aria-hidden="true">→</span>
      </motion.button>
    </div>
  );
}

/* ── Daily Challenge card ───────────────────────────────────── */
function DailyChallengeCard({ onPress }: { onPress: () => void }) {
  return (
    <div className="mx-4">
      <motion.button
        onClick={onPress}
        className="w-full rounded-3xl p-4 text-left flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, #0F0A1E 0%, #1E0A3C 50%, #2D0A4E 100%)',
          boxShadow: '0 4px 0 0 #080412',
        }}
        whileTap={{ y: 4, boxShadow: 'none' }}
      >
        {/* Target icon */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <Target size={22} style={{ color: '#FCD34D' }} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-bold text-white">Daily Challenge</p>
          <p className="font-ui text-xs text-white/75 mt-0.5">Earn 100 XP</p>
          <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="w-[60%] h-full rounded-full bg-white" />
          </div>
          <p className="font-ui text-[10px] text-white/60 mt-0.5">60 / 100</p>
        </div>

        <Gift size={28} style={{ color: '#FCD34D' }} strokeWidth={1.5} className="flex-shrink-0" />
      </motion.button>
    </div>
  );
}

/* ── Progress section ──────────────────────────────────────── */
const SECTION_CONFIG: Record<string, { color: string; bg: string }> = {
  'fractions-intro':      { color: '#2563EB', bg: '#EFF6FF' },
  'fractions-operations': { color: '#059669', bg: '#ECFDF5' },
  'algebra-intro':        { color: '#7C3AED', bg: '#F5F3FF' },
  'algebra-expressions':  { color: '#DB2777', bg: '#FDF2F8' },
};

function ProgressSection({ sections }: { sections: SectionProgress[] }) {
  const visible = sections.filter((s) => s.isUnlocked).slice(0, 4);
  if (visible.length === 0) return null;

  const pairs: SectionProgress[][] = [];
  for (let i = 0; i < visible.length; i += 2) {
    pairs.push(visible.slice(i, i + 2));
  }

  return (
    <div className="mx-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Your Progress</h2>
        <Link href="/learn" className="font-ui text-sm font-semibold" style={{ color: '#8A2BE2' }}>View all</Link>
      </div>

      {pairs.map((pair, pi) => (
        <div key={pi} className="flex gap-3 mb-3">
          {pair.map((s) => {
            const cfg = SECTION_CONFIG[s.sectionSlug] ?? { color: '#8A2BE2', bg: '#F5F0FF' };
            return (
              <div
                key={s.sectionId}
                className="flex-1 bg-white rounded-2xl p-3"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: cfg.bg }}
                >
                  <BookOpen size={16} style={{ color: cfg.color }} strokeWidth={2} />
                </div>
                <p className="font-display text-xs font-bold text-gray-900 leading-tight truncate">
                  {s.sectionTitle}
                </p>
                <p className="font-display text-base font-bold mt-0.5" style={{ color: cfg.color }}>
                  {Math.round(s.progressPercent * 100)}%
                </p>
                <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: cfg.bg }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: cfg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(s.progressPercent * 100, s.isCompleted ? 100 : 2)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Achievements strip ─────────────────────────────────────── */
const BADGE_DEFS = [
  { id: '1', color: '#F59E0B', bg: '#FEF3C7', title: 'First Steps',    icon: <Star size={16} fill="#F59E0B" stroke="#D97706" strokeWidth={0.5} /> },
  { id: '2', color: '#EA580C', bg: '#FFF7ED', title: 'Streak Master',  icon: <Flame size={16} fill="#EA580C" stroke="#C2410C" strokeWidth={0.5} /> },
  { id: '3', color: '#3B82F6', bg: '#EFF6FF', title: 'Explorer',       icon: <BookOpen size={16} style={{ color: '#3B82F6' }} strokeWidth={2} /> },
  { id: '4', color: '#8A2BE2', bg: '#F5F0FF', title: 'Quick Thinker',  icon: <Zap size={16} fill="#8A2BE2" stroke="#6D28D9" strokeWidth={0.5} /> },
] as const;

function AchievementsStrip({ lessonsCompleted, streak }: { lessonsCompleted: number; streak: number }) {
  const earned = [lessonsCompleted >= 1, streak >= 3, lessonsCompleted >= 10, lessonsCompleted >= 5];

  return (
    <div className="mx-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Recent Achievements</h2>
        <Link href="/achievements" className="font-ui text-sm font-semibold" style={{ color: '#8A2BE2' }}>View all</Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-0">
        {BADGE_DEFS.map((badge, i) => (
          <div
            key={badge.id}
            className="flex-shrink-0 w-24 rounded-2xl p-3 bg-white flex flex-col items-center gap-1.5 text-center"
            style={{
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              opacity: earned[i] ? 1 : 0.45,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: badge.bg }}
            >
              {badge.icon}
            </div>
            <p className="font-ui text-[10px] font-bold text-gray-700 leading-tight">{badge.title}</p>
            {earned[i] && (
              <CheckCircle size={12} style={{ color: '#22C55E' }} />
            )}
          </div>
        ))}
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

  const sections         = buildSections(completedSections);
  const username         = profile?.username ?? 'Champion';
  const firstName        = username.split(' ')[0];
  const totalXp          = stats?.totalXp ?? 0;
  const level            = stats?.level ?? 1;
  const hearts           = stats?.hearts ?? 5;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const activeSection    = sections.find((s) => s.isUnlocked && !s.isCompleted) ?? null;

  void practicedToday; // used in greeting below but suppress lint

  function handleContinue() {
    if (activeSection) {
      router.push(`/lesson/${activeSection.sectionSlug}/${activeSection.currentLevel}`);
    }
  }

  return (
    <div className="min-h-screen pb-6" style={{ background: '#F8F7FF' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="pt-4 mb-4"
      >
        <HeroCard
          firstName={firstName}
          streak={currentStreak}
          xp={totalXp}
          level={level}
          hearts={hearts}
        />
      </motion.div>

      {/* Continue Learning */}
      {activeSection && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-4"
        >
          <ContinueLearningCard activeSection={activeSection} onContinue={handleContinue} />
        </motion.div>
      )}

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mb-4"
      >
        <DailyChallengeCard onPress={() => router.push('/daily-challenge')} />
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="mb-4"
      >
        <ProgressSection sections={sections} />
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <AchievementsStrip lessonsCompleted={lessonsCompleted} streak={currentStreak} />
      </motion.div>
    </div>
  );
}
