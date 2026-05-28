'use client';

import { Zap, Flame, Star, Heart } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';

/* ── Stat chip ─────────────────────────────────────────────── */
function StatChip({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string | number;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white font-ui font-bold"
      style={{
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        border: '1px solid #F3F4F6',
        fontSize: 13,
        color: '#111827',
      }}
    >
      {icon}
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

/* ── Header ────────────────────────────────────────────────── */
export function AppHeader() {
  const stats         = useUserStore((s) => s.stats);
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const xp     = stats?.totalXp ?? 0;
  const level  = stats?.level   ?? 1;
  const hearts = stats?.hearts  ?? 5;

  return (
    <header
      className="sticky top-0 z-10 bg-surface border-b border-gray-100"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <div
        className="max-w-lg mx-auto flex items-center justify-between px-4"
        style={{ height: '52px' }}
      >
        {/* Brand */}
        <span className="font-display text-lg font-bold text-primary">AlgeFox</span>

        {/* Stat chips row */}
        <div className="flex items-center gap-1.5">
          <StatChip
            icon={<Flame size={13} fill="#F97316" stroke="#EA580C" strokeWidth={0.5} />}
            value={currentStreak}
          />
          <StatChip
            icon={<Zap size={13} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />}
            value={xp}
          />
          <StatChip
            icon={
              <Star size={13} fill="#8A2BE2" stroke="#5B1483" strokeWidth={0.5} />
            }
            value={`L${level}`}
          />
          <StatChip
            icon={<Heart size={13} fill="#F43F5E" stroke="#E11D48" strokeWidth={0.5} />}
            value={hearts}
          />
        </div>
      </div>
    </header>
  );
}
