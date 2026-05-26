'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Zap, BarChart2, Target, ChevronRight } from 'lucide-react';
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

/* ── Stat box ──────────────────────────────────────────────── */
function StatBox({
  icon,
  value,
  label,
  bg,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl p-3 text-center flex flex-col items-center gap-1" style={{ background: bg }}>
      <div className="w-9 h-9 flex items-center justify-center">{icon}</div>
      <p className="font-display text-xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="font-ui text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ── Continue learning banner (mascot breaks out of left edge) ─ */
function ContinueLearningBanner({
  section,
  onPress,
}: {
  section: SectionProgress | null;
  onPress: () => void;
}) {
  if (!section) return null;

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #8A2BE2 0%, #5B1483 100%)' }}
    >
      {/* Mascot breaking out of left edge */}
      <div className="absolute -left-3 bottom-0 pointer-events-none select-none">
        <Image
          src="/mascot/foxy-full.png"
          alt="Foxy the fox"
          width={150}
          height={150}
          className="object-contain"
          priority
        />
      </div>

      {/* Text + CTA pushed to the right */}
      <div className="ml-36 p-4">
        <p className="font-ui text-sm text-white/75">Continue Learning</p>
        <h2 className="font-display text-xl font-bold text-white mt-1 leading-snug">
          {section.sectionTitle}
        </h2>

        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full mt-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(section.progressPercent * 100, 4)}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
          />
        </div>

        {/* Button */}
        <motion.button
          onClick={onPress}
          className="mt-4 w-full font-display font-bold text-purple-700 rounded-2xl py-2.5"
          style={{ background: '#FFFFFF' }}
          whileTap={{ scale: 0.97 }}
        >
          Continue Lesson
        </motion.button>
      </div>
    </div>
  );
}

/* ── Progress card ─────────────────────────────────────────── */
function ProgressCard({ sections }: { sections: SectionProgress[] }) {
  const visible = sections.filter((s) => s.isUnlocked).slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold text-gray-900">Your Progress</h2>
        <button className="font-ui text-sm text-primary font-semibold">View all</button>
      </div>

      <div className="space-y-4">
        {visible.map((s) => (
          <div key={s.sectionId} className="rounded-2xl p-4" style={{ background: '#f4f1fb' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-ui text-sm font-semibold text-gray-800">{s.sectionTitle}</span>
              <span className="font-display text-sm font-bold text-primary">
                {Math.round(s.progressPercent * 100)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mt-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #8A2BE2, #5B1483)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(s.progressPercent * 100, s.isCompleted ? 100 : 2)}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Daily challenge banner ────────────────────────────────── */
function DailyChallengeCard({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      onClick={onPress}
      className="w-full rounded-3xl p-5 text-left"
      style={{ background: 'linear-gradient(135deg, #8A2BE2, #D946EF)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Daily Challenge</h2>
          <p className="font-ui text-sm text-white/80 mt-1">Earn 100 XP</p>

          <div className="w-52 h-2.5 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="w-[60%] h-full bg-white rounded-full" />
          </div>
        </div>

        <div className="text-5xl select-none">🎁</div>
      </div>
    </motion.button>
  );
}

/* ── Achievements card ─────────────────────────────────────── */
function AchievementsCard({
  streak,
  lessonsCompleted,
}: {
  streak: number;
  lessonsCompleted: number;
}) {
  const badges = [
    {
      earned: lessonsCompleted >= 1,
      emoji: '🏅',
      title: 'First Steps',
      desc: 'Completed first lesson',
      bg: '#FEFCE8',
    },
    {
      earned: streak >= 3,
      emoji: '🔥',
      title: 'Streak Master',
      desc: `${streak} day streak`,
      bg: '#FFF7ED',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold text-gray-900">Recent Achievements</h2>
        <button className="font-ui text-sm text-primary font-semibold">View all</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {badges.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl p-4"
            style={{ background: b.bg, opacity: b.earned ? 1 : 0.45 }}
          >
            <p className="text-4xl select-none">{b.emoji}</p>
            <h3 className="font-display font-bold text-gray-900 mt-2">{b.title}</h3>
            <p className="font-ui text-sm text-gray-500 mt-1">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section label ─────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-ui text-xs font-bold text-gray-400 uppercase tracking-widest px-5 pt-5 pb-2">
      {children}
    </p>
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

  function handleNodeClick(sectionSlug: string, lv: number) {
    router.push(`/lesson/${sectionSlug}/${lv}`);
  }

  function handleContinue() {
    if (activeSection) {
      router.push(`/lesson/${activeSection.sectionSlug}/${activeSection.currentLevel}`);
    }
  }

  const greeting = practicedToday
    ? `Great work today! 🌟`
    : currentStreak > 2
      ? `${currentStreak} day streak! 🔥`
      : `Ready for today's lesson?`;

  return (
    <div className="min-h-screen" style={{ background: '#f4f1fb' }}>

      {/* ── Hero greeting card ─────────────────────────────── */}
      <div className="px-4 pt-5 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-5 shadow-sm mb-4"
        >
          {/* Greeting row */}
          <h2 className="font-display text-3xl font-bold text-gray-900">
            Hi, {firstName}! 👋
          </h2>
          <p className="font-ui text-gray-500 mt-1">{greeting}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <StatBox
              icon={<Flame size={22} fill="#F97316" stroke="#EA580C" strokeWidth={0.5} />}
              value={currentStreak}
              label="Streak"
              bg="#FFF7ED"
            />
            <StatBox
              icon={<Zap size={22} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />}
              value={totalXp}
              label="XP"
              bg="#FEFCE8"
            />
            <StatBox
              icon={<BarChart2 size={22} className="text-primary" strokeWidth={2} />}
              value={`Lv.${level}`}
              label="Level"
              bg="#F5F0FF"
            />
          </div>

          {/* Continue learning banner */}
          {activeSection && (
            <div className="mt-5">
              <ContinueLearningBanner section={activeSection} onPress={handleContinue} />
            </div>
          )}
        </motion.div>

        {/* ── Progress card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4"
        >
          <ProgressCard sections={sections} />
        </motion.div>

        {/* ── Daily challenge ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-2"
        >
          <DailyChallengeCard onPress={() => router.push('/daily-challenge')} />
        </motion.div>
      </div>

      {/* ── Adventure map ─────────────────────────────────────── */}
      <SectionLabel>Adventure Map</SectionLabel>
      {sections.map((section, i) => (
        <WorldSection
          key={section.sectionId}
          section={section}
          worldIndex={i}
          onNodeClick={handleNodeClick}
        />
      ))}

      {/* ── Achievements ──────────────────────────────────────── */}
      <div className="px-4 pt-2 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <AchievementsCard streak={currentStreak} lessonsCompleted={lessonsCompleted} />
        </motion.div>
      </div>

    </div>
  );
}
