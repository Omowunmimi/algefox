'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Flame, Trophy, Zap, BookOpen, GraduationCap, CheckCircle, Lock, X } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { Badge, ProgressBar } from '@/components/ui';
import { Button } from '@/components/ui/Button';

/* ── Achievement definitions ────────────────────────────────── */

interface AchievementDef {
  id: string;
  slug: string;
  title: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
  category: string;
  hexColor: string;
  hexColorDark: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string; stroke?: string }>;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: '1', slug: 'first-lesson',  title: 'First steps',        description: 'Complete your first lesson',
    conditionType: 'lessons_completed', conditionValue: 1, xpReward: 50, category: 'completion',
    hexColor: '#F59E0B', hexColorDark: '#D97706',
    IconComponent: Trophy,
  },
  {
    id: '2', slug: 'streak-3',      title: 'Streak master',       description: 'Maintain a 3-day streak',
    conditionType: 'streak_days', conditionValue: 3, xpReward: 75, category: 'streak',
    hexColor: '#F97316', hexColorDark: '#C2410C',
    IconComponent: Flame,
  },
  {
    id: '3', slug: 'fraction-exp',  title: 'Fraction explorer',   description: 'Complete 10 fraction lessons',
    conditionType: 'lessons_completed', conditionValue: 10, xpReward: 100, category: 'completion',
    hexColor: '#F97316', hexColorDark: '#C2410C',
    IconComponent: BookOpen,
  },
  {
    id: '4', slug: 'quick-thinker', title: 'Quick thinker',       description: 'Answer 5 in a row correctly',
    conditionType: 'lessons_completed', conditionValue: 5, xpReward: 80, category: 'accuracy',
    hexColor: '#10B981', hexColorDark: '#047857',
    IconComponent: Zap,
  },
  {
    id: '5', slug: 'scholar',       title: 'Scholar',             description: 'Earn 50 total XP',
    conditionType: 'total_xp', conditionValue: 50, xpReward: 50, category: 'mastery',
    hexColor: '#8A2BE2', hexColorDark: '#5B1483',
    IconComponent: GraduationCap,
  },
  {
    id: '6', slug: 'perfect-score', title: 'Perfect score',       description: 'All correct in a lesson',
    conditionType: 'perfect_lesson', conditionValue: 1, xpReward: 100, category: 'accuracy',
    hexColor: '#10B981', hexColorDark: '#047857',
    IconComponent: Star,
  },
];

/* ── Hexagon badge SVG ───────────────────────────────────────── */

function HexBadge({
  color,
  colorDark,
  Icon,
  earned,
  size = 64,
}: {
  color: string;
  colorDark: string;
  Icon: AchievementDef['IconComponent'];
  earned: boolean;
  size?: number;
}) {
  const iconSize = Math.round(size * 0.36);
  const pts = '50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size * 1.1 }}>
      <svg
        viewBox="0 0 100 110"
        width={size}
        height={size * 1.1}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={`hg-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={earned ? color : '#D1D5DB'} />
            <stop offset="100%" stopColor={earned ? colorDark : '#9CA3AF'} />
          </linearGradient>
          {earned && (
            <>
              <circle cx="15" cy="15" r="3" fill={color} opacity="0.5" />
              <circle cx="85" cy="20" r="2" fill={color} opacity="0.4" />
              <circle cx="10" cy="85" r="2.5" fill={color} opacity="0.45" />
              <circle cx="90" cy="80" r="2" fill={color} opacity="0.4" />
            </>
          )}
        </defs>
        <polygon
          points={pts}
          fill={`url(#hg-${color.replace('#', '')})`}
          stroke={earned ? colorDark : '#9CA3AF'}
          strokeWidth="1.5"
        />
        {earned && (
          <>
            <circle cx="15" cy="15" r="3" fill={color} opacity="0.45" />
            <circle cx="85" cy="20" r="2" fill={color} opacity="0.35" />
            <circle cx="10" cy="85" r="2.5" fill={color} opacity="0.4" />
            <circle cx="90" cy="80" r="2" fill={color} opacity="0.35" />
          </>
        )}
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ paddingTop: size * 0.05 }}
      >
        <Icon
          size={iconSize}
          color="white"
          strokeWidth={earned ? 2 : 1.5}
          fill={earned ? 'rgba(255,255,255,0.3)' : 'none'}
        />
      </div>
    </div>
  );
}

/* ── Claim XP popup ──────────────────────────────────────────── */

function ClaimModal({
  def,
  claimed,
  onClaim,
  onClose,
}: {
  def: AchievementDef;
  claimed: boolean;
  onClaim: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="w-full max-w-lg bg-white mx-auto"
        style={{ borderRadius: '24px 24px 0 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Close button */}
        <div className="flex justify-end px-4 pt-1">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
          >
            <X size={14} strokeWidth={2.5} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 pb-2">
          {/* Badge */}
          <HexBadge
            color={def.hexColor}
            colorDark={def.hexColorDark}
            Icon={def.IconComponent}
            earned
            size={80}
          />

          <p className="font-display text-2xl font-bold text-gray-900 text-center mt-1">
            {def.title}
          </p>
          <p className="font-ui text-sm text-center text-gray-500 leading-relaxed">
            {def.description}
          </p>

          {/* XP reward chip */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full font-ui font-bold text-sm"
            style={{ background: '#FEF9C3', color: '#92400E', border: '1.5px solid #FDE047' }}
          >
            <Zap size={14} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
            +{def.xpReward} XP reward
          </div>

          {/* Claim button */}
          {claimed ? (
            <div className="w-full flex items-center justify-center gap-2 py-4">
              <CheckCircle size={20} className="text-success" />
              <span className="font-ui font-bold text-success">XP Claimed!</span>
            </div>
          ) : (
            <Button onClick={onClaim} size="lg" fullWidth className="mt-2">
              Claim {def.xpReward} XP
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Badge card ──────────────────────────────────────────────── */

function BadgeCard({
  def,
  earned,
  progress,
  claimed,
  onTap,
}: {
  def: AchievementDef;
  earned: boolean;
  progress: number;
  claimed: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      onClick={earned ? onTap : undefined}
      className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-2 text-center w-full"
      style={{
        boxShadow: earned
          ? `0 4px 16px rgba(0,0,0,0.08), 0 0 0 1.5px ${def.hexColor}33`
          : '0 2px 8px rgba(0,0,0,0.06)',
        opacity: earned ? 1 : 0.6,
        cursor: earned ? 'pointer' : 'default',
      }}
      whileTap={earned ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <HexBadge
        color={def.hexColor}
        colorDark={def.hexColorDark}
        Icon={def.IconComponent}
        earned={earned}
      />
      <p className="font-display text-sm font-bold text-gray-900">{def.title}</p>
      <p className="font-ui text-xs text-gray-500 leading-snug">{def.description}</p>

      {earned ? (
        claimed ? (
          <div className="flex items-center gap-1">
            <CheckCircle size={13} className="text-success" strokeWidth={2} />
            <span className="font-ui text-xs font-bold text-success">Claimed</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full font-ui text-[10px] font-bold"
            style={{ background: '#FEF9C3', color: '#92400E' }}
          >
            <Zap size={10} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
            +{def.xpReward} XP
          </div>
        )
      ) : progress > 0 ? (
        <div className="w-full">
          <ProgressBar
            value={progress * 100}
            variant={def.hexColor === '#F97316' || def.hexColor === '#F59E0B' ? 'gold' : def.hexColor === '#10B981' ? 'success' : 'primary'}
            size="thin"
            animated
          />
          <p className="font-ui text-[10px] text-gray-400 mt-0.5">{Math.round(progress * 100)}%</p>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Lock size={12} color="#9CA3AF" strokeWidth={2} />
          <span className="font-ui text-xs text-gray-400">Locked</span>
        </div>
      )}
    </motion.button>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export default function AchievementsPage() {
  const stats          = useUserStore((s) => s.stats);
  const addXp          = useUserStore((s) => s.addXp);
  const currentStreak  = useStreakStore((s) => s.currentStreak);

  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const totalXp          = stats?.totalXp          ?? 0;

  // Track which achievements have had XP claimed this session
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [selectedDef, setSelectedDef] = useState<AchievementDef | null>(null);

  function isEarned(def: AchievementDef): boolean {
    switch (def.conditionType) {
      case 'lessons_completed': return lessonsCompleted >= def.conditionValue;
      case 'streak_days':       return currentStreak >= def.conditionValue;
      case 'total_xp':          return totalXp >= def.conditionValue;
      case 'perfect_lesson':    return false;
      default:                  return false;
    }
  }

  function getProgress(def: AchievementDef): number {
    switch (def.conditionType) {
      case 'lessons_completed': return Math.min(lessonsCompleted / def.conditionValue, 1);
      case 'streak_days':       return Math.min(currentStreak / def.conditionValue, 1);
      case 'total_xp':          return Math.min(totalXp / def.conditionValue, 1);
      default:                  return 0;
    }
  }

  function handleClaim() {
    if (!selectedDef || claimedIds.has(selectedDef.id)) return;
    addXp(selectedDef.xpReward);
    setClaimedIds((prev) => new Set([...prev, selectedDef.id]));
  }

  const earnedCount = ACHIEVEMENT_DEFS.filter(isEarned).length;

  return (
    <div className="min-h-screen pb-6 bg-surface-page">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-bold text-gray-900">Achievements</h1>
        <Badge variant="primary" size="md" className="font-display font-bold">
          {earnedCount} earned
        </Badge>
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {ACHIEVEMENT_DEFS.map((def, i) => {
          const earned  = isEarned(def);
          const prog    = getProgress(def);
          const claimed = claimedIds.has(def.id);
          return (
            <motion.div
              key={def.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <BadgeCard
                def={def}
                earned={earned}
                progress={prog}
                claimed={claimed}
                onTap={() => setSelectedDef(def)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Claim modal */}
      <AnimatePresence>
        {selectedDef && (
          <ClaimModal
            key={selectedDef.id}
            def={selectedDef}
            claimed={claimedIds.has(selectedDef.id)}
            onClaim={handleClaim}
            onClose={() => setSelectedDef(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
