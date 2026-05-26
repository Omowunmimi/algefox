'use client';

import { Zap, Flame, Heart } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';

/* ── Stat Pill ─────────────────────────────────────────────── */
interface StatPillProps {
  icon: React.ReactNode;
  value: string | number;
  bg: string;
}

function StatPill({ icon, value, bg }: StatPillProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display text-sm font-bold"
      style={{ background: bg, boxShadow: '0 2px 0 0 rgba(0,0,0,0.10)' }}
    >
      {icon}
      <span className="text-gray-800 tabular-nums">{value}</span>
    </div>
  );
}

export function AppHeader() {
  const stats         = useUserStore((s) => s.stats);
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const totalXp = stats?.totalXp ?? 0;
  const hearts  = stats?.hearts  ?? 5;

  return (
    <header
      className="sticky top-0 z-10 bg-white border-b border-gray-100"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between px-4 gap-2" style={{ height: '52px' }}>
        {/* Brand */}
        <p className="font-display text-xl font-bold text-primary tracking-wide">AlgeFox</p>

        {/* Stat pills */}
        <div className="flex items-center gap-2">
          <StatPill
            icon={<Zap size={15} className="fill-amber-400 stroke-amber-500" strokeWidth={1} />}
            value={totalXp}
            bg="#FEF3C7"
          />
          <StatPill
            icon={<Flame size={15} className="fill-orange-400 stroke-orange-500" strokeWidth={1} />}
            value={currentStreak}
            bg="#FFEDD5"
          />
          <StatPill
            icon={<Heart size={15} className="fill-rose-400 stroke-rose-500" strokeWidth={1} />}
            value={hearts}
            bg="#FFE4E6"
          />
        </div>
      </div>
    </header>
  );
}
