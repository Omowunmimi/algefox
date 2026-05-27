'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Zap, BookOpen, Target, LogOut, Star, ChevronRight } from 'lucide-react';
import { useUserStore, selectAccuracy } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { createClient } from '@/lib/supabase/client';

/* ── Avatar colors ──────────────────────────────────────────── */
const AVATAR_COLORS = [
  '#8A2BE2', '#EA580C', '#3B82F6', '#16A34A',
  '#F59E0B', '#EC4899', '#06B6D4', '#EF4444',
];

function getAvatarColor(avatarId: string): string {
  let hash = 0;
  for (let i = 0; i < avatarId.length; i++) {
    hash = avatarId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ── Hex badge (mini, for profile strip) ─────────────────────── */
function MiniBadge({ color }: { color: string }) {
  return (
    <svg width="36" height="40" viewBox="0 0 100 110">
      <defs>
        <linearGradient id={`mb-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
        fill={`url(#mb-${color.replace('#', '')})`}
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ── Section card wrapper ───────────────────────────────────── */
function SectionCard({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <p
        className="font-ui text-xs font-bold uppercase tracking-widest px-4 pt-4 pb-2"
        style={{ color: '#9CA3AF' }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const profile       = useUserStore((s) => s.profile);
  const stats         = useUserStore((s) => s.stats);
  const accuracy      = useUserStore(selectAccuracy);
  const resetUser     = useUserStore((s) => s.reset);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const resetStreak   = useStreakStore((s) => s.reset);

  const username         = profile?.username ?? 'Champion';
  const avatarId         = profile?.avatarId ?? username;
  const joinYear         = 2025;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const totalXp          = stats?.totalXp ?? 0;
  const level            = stats?.level ?? 1;
  const avatarColor      = getAvatarColor(avatarId);
  const initial          = username.charAt(0).toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      resetUser();
      resetStreak();
      router.push('/login');
    } catch {
      setSigningOut(false);
    }
  }

  const BADGE_COLORS = ['#F59E0B', '#F97316', '#3B82F6', '#EF4444', '#8A2BE2', '#16A34A'];

  return (
    <div className="min-h-screen pb-8" style={{ background: '#F8F7FF' }}>

      {/* Top profile section */}
      <div className="bg-white px-4 pt-8 pb-5" style={{ borderRadius: '0 0 24px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-white text-2xl"
            style={{ background: avatarColor, boxShadow: `0 4px 16px ${avatarColor}55` }}
          >
            {initial}
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900">{username}</h1>
          <p className="font-ui text-xs text-gray-400">@{username.toLowerCase()} · Joined {joinYear}</p>
        </div>

        {/* Stats strip */}
        <div className="flex items-stretch mt-5 divide-x divide-gray-100">
          <div className="flex-1 flex flex-col items-center gap-1 px-3">
            <div className="flex items-center gap-1">
              <Flame size={16} fill="#F97316" stroke="#EA580C" strokeWidth={0.5} />
              <span className="font-display text-xl font-bold text-gray-900 tabular-nums">{currentStreak}</span>
            </div>
            <p className="font-ui text-xs text-gray-400">Day streak</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 px-3">
            <div className="flex items-center gap-1">
              <Zap size={16} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
              <span className="font-display text-xl font-bold text-gray-900 tabular-nums">{totalXp}</span>
            </div>
            <p className="font-ui text-xs text-gray-400">Total XP</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 px-3">
            <div className="flex items-center gap-1">
              <Star size={16} fill="#FBBF24" stroke="#D97706" strokeWidth={0.5} />
              <span className="font-display text-xl font-bold text-gray-900 tabular-nums">{level}</span>
            </div>
            <p className="font-ui text-xs text-gray-400">Level</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">

        {/* Overview */}
        <SectionCard label="Overview">
          <div className="grid grid-cols-2 gap-px bg-gray-100 mx-4 mb-4 rounded-2xl overflow-hidden">
            {[
              { Icon: Flame, iconProps: { fill: '#F97316', stroke: '#EA580C', strokeWidth: 0.5 }, value: `${currentStreak} days`, label: 'Streak' },
              { Icon: Zap,   iconProps: { fill: '#FCD34D', stroke: '#D97706', strokeWidth: 0.5 }, value: `${totalXp} XP`,        label: 'Total XP' },
              { Icon: BookOpen, iconProps: { color: '#8A2BE2', strokeWidth: 2 },                   value: `${lessonsCompleted}`,  label: 'Lessons' },
              { Icon: Target,   iconProps: { color: '#16A34A', strokeWidth: 2 },                   value: `${accuracy}%`,         label: 'Accuracy' },
            ].map(({ Icon, iconProps, value, label }) => (
              <div key={label} className="bg-white p-3 flex flex-col gap-1">
                <Icon size={18} {...iconProps} />
                <p className="font-display text-lg font-bold text-gray-900">{value}</p>
                <p className="font-ui text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Achievements strip */}
        <SectionCard label="Achievements">
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BADGE_COLORS.map((c, i) => (
                <div key={i} className="flex-shrink-0" style={{ opacity: i < 2 ? 1 : 0.35 }}>
                  <MiniBadge color={c} />
                </div>
              ))}
            </div>
            <Link
              href="/achievements"
              className="mt-3 flex items-center justify-between py-2 border-t border-gray-100"
            >
              <span className="font-ui text-sm font-semibold text-gray-700">View all achievements</span>
              <ChevronRight size={16} color="#9CA3AF" />
            </Link>
          </div>
        </SectionCard>

        {/* Sign Out */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <motion.button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-4"
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={18} style={{ color: '#EF4444' }} strokeWidth={2} />
            <span className="font-ui text-sm font-semibold" style={{ color: '#EF4444' }}>
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </span>
          </motion.button>
        </div>

      </div>
    </div>
  );
}
