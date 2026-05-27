'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';

/* ── Mock leaderboard data ─────────────────────────────────── */
const MOCK_USERS_WEEKLY = [
  { id: 'u1', username: 'MathWizard',    xp: 1450, color: '#8A2BE2' },
  { id: 'u2', username: 'AlgebraAce',    xp: 1280, color: '#EA580C' },
  { id: 'u3', username: 'FractionKing',  xp: 1100, color: '#3B82F6' },
  { id: 'u4', username: 'NumberNinja',   xp:  950, color: '#16A34A' },
  { id: 'u5', username: 'QuickThinker',  xp:  870, color: '#F59E0B' },
  { id: 'u6', username: 'StarStudent',   xp:  760, color: '#EC4899' },
  { id: 'u7', username: 'BrainBoost',    xp:  640, color: '#06B6D4' },
  { id: 'u8', username: 'LogicLegend',   xp:  520, color: '#8B5CF6' },
  { id: 'u9', username: 'SumSolver',     xp:  410, color: '#EF4444' },
  { id: 'u10', username: 'DeciDemi',     xp:  280, color: '#F97316' },
];

const MOCK_USERS_ALLTIME = [
  { id: 'u1', username: 'MathWizard',    xp: 8420, color: '#8A2BE2' },
  { id: 'u3', username: 'FractionKing',  xp: 7100, color: '#3B82F6' },
  { id: 'u2', username: 'AlgebraAce',    xp: 6850, color: '#EA580C' },
  { id: 'u5', username: 'QuickThinker',  xp: 5470, color: '#F59E0B' },
  { id: 'u4', username: 'NumberNinja',   xp: 4920, color: '#16A34A' },
  { id: 'u7', username: 'BrainBoost',    xp: 3640, color: '#06B6D4' },
  { id: 'u6', username: 'StarStudent',   xp: 3100, color: '#EC4899' },
  { id: 'u9', username: 'SumSolver',     xp: 2410, color: '#EF4444' },
  { id: 'u8', username: 'LogicLegend',   xp: 1920, color: '#8B5CF6' },
  { id: 'u10', username: 'DeciDemi',     xp: 1280, color: '#F97316' },
];

/* ── Avatar circle ─────────────────────────────────────────── */
function AvatarCircle({
  username,
  color,
  size = 40,
  fontSize = 16,
}: {
  username: string;
  color: string;
  size?: number;
  fontSize?: number;
}) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full font-display font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize }}
    >
      {initial}
    </div>
  );
}

/* ── Podium ────────────────────────────────────────────────── */
function Podium({
  first,
  second,
  third,
}: {
  first: { username: string; xp: number; color: string };
  second: { username: string; xp: number; color: string };
  third: { username: string; xp: number; color: string };
}) {
  const slots = [
    { data: second, rank: 2, height: 70,  pedestalColor: '#94A3B8', label: 'silver' },
    { data: first,  rank: 1, height: 96,  pedestalColor: '#F59E0B', label: 'gold'   },
    { data: third,  rank: 3, height: 52,  pedestalColor: '#CD7F32', label: 'bronze' },
  ];

  return (
    <div className="mx-4 mb-5">
      <div className="flex items-end justify-center gap-2">
        {slots.map(({ data, rank, height, pedestalColor }) => (
          <motion.div
            key={rank}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank === 1 ? 0.05 : rank === 2 ? 0.15 : 0.2, duration: 0.4 }}
          >
            {/* Avatar + crown area */}
            <div className="flex flex-col items-center gap-1 mb-2">
              {rank === 1 && (
                <Trophy size={20} style={{ color: '#F59E0B' }} fill="#F59E0B" strokeWidth={0.5} />
              )}
              <AvatarCircle
                username={data.username}
                color={data.color}
                size={rank === 1 ? 52 : 42}
                fontSize={rank === 1 ? 20 : 16}
              />
              <p className="font-display text-xs font-bold text-gray-800 text-center leading-tight max-w-16 truncate">
                {data.username}
              </p>
              <div className="flex items-center gap-0.5">
                <Zap size={10} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
                <span className="font-ui text-[10px] font-bold text-gray-500 tabular-nums">
                  {data.xp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pedestal */}
            <div
              className="w-20 flex items-center justify-center rounded-t-2xl"
              style={{ height, background: pedestalColor }}
            >
              <span className="font-display text-2xl font-black text-white/60">#{rank}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Ranked row ────────────────────────────────────────────── */
function RankedRow({
  rank,
  username,
  color,
  xp,
  isCurrentUser,
}: {
  rank: number;
  username: string;
  color: string;
  xp: number;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl mx-4 mb-2"
      style={{
        background: isCurrentUser ? '#F3F0FF' : 'white',
        border: isCurrentUser ? '1.5px solid #8A2BE2' : '1.5px solid transparent',
      }}
    >
      <span
        className="font-display text-sm font-bold w-6 text-center flex-shrink-0"
        style={{ color: rank <= 3 ? '#F59E0B' : '#9CA3AF' }}
      >
        {rank}
      </span>
      <AvatarCircle username={username} color={color} size={36} fontSize={14} />
      <p
        className="flex-1 font-display text-sm font-bold truncate"
        style={{ color: isCurrentUser ? '#8A2BE2' : '#111827' }}
      >
        {username}
        {isCurrentUser && <span className="font-ui text-xs font-semibold text-purple-400 ml-1">(you)</span>}
      </p>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Zap size={12} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
        <span className="font-display text-sm font-bold text-gray-700 tabular-nums">
          {xp.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const [tab, setTab] = useState<'week' | 'alltime'>('week');
  const profile = useUserStore((s) => s.profile);
  const stats   = useUserStore((s) => s.stats);

  const currentUsername = profile?.username ?? 'You';
  const currentXp       = stats?.totalXp ?? 0;

  // Inject current user into list (slot them in by XP)
  function buildList(base: typeof MOCK_USERS_WEEKLY) {
    const list = [...base];
    // Check if current user is already in list (by XP approximation — mock data only)
    const alreadyIn = list.some((u) => u.username === currentUsername);
    if (!alreadyIn) {
      list.push({ id: 'current', username: currentUsername, xp: currentXp, color: '#8A2BE2' });
      list.sort((a, b) => b.xp - a.xp);
    }
    return list;
  }

  const data = buildList(tab === 'week' ? MOCK_USERS_WEEKLY : MOCK_USERS_ALLTIME);
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="min-h-screen pb-6" style={{ background: '#F8F7FF' }}>
      {/* Title */}
      <div className="px-4 pt-5 pb-4 text-center">
        <h1 className="font-display text-2xl font-bold text-gray-900">Leaderboard</h1>
      </div>

      {/* Tab toggle */}
      <div className="mx-4 mb-6 flex p-1 rounded-2xl" style={{ background: '#EDE9FE' }}>
        {(['week', 'alltime'] as const).map((t) => (
          <motion.button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl font-display text-sm font-bold transition-colors"
            style={{
              background: tab === t ? '#8A2BE2' : 'transparent',
              color: tab === t ? 'white' : '#7C3AED',
              boxShadow: tab === t ? '0 2px 0 0 #5B1483' : 'none',
            }}
            whileTap={{ scale: 0.96 }}
          >
            {t === 'week' ? 'This Week' : 'All Time'}
          </motion.button>
        ))}
      </div>

      {/* Podium */}
      {top3.length === 3 && (
        <Podium
          first={top3[0]}
          second={top3[1]}
          third={top3[2]}
        />
      )}

      {/* Divider */}
      <div className="mx-4 mb-3 h-px" style={{ background: '#E5E7EB' }} />

      {/* Ranked list (positions 4+) */}
      {rest.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
        >
          <RankedRow
            rank={i + 4}
            username={user.username}
            color={user.color}
            xp={user.xp}
            isCurrentUser={user.username === currentUsername}
          />
        </motion.div>
      ))}
    </div>
  );
}
