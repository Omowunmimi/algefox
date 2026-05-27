'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, CheckCircle, Gift, Zap } from 'lucide-react';
import { useStreakStore } from '@/stores/useStreakStore';

/* ── Weekly calendar ─────────────────────────────────────────── */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function WeekCalendar({
  streak,
  todayIndex,
}: {
  streak: number;
  todayIndex: number;
}) {
  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex justify-between px-2 mb-2">
        {DAY_LABELS.map((d, i) => (
          <span
            key={d}
            className="font-ui text-xs font-semibold w-8 text-center"
            style={{ color: i === todayIndex ? '#F97316' : '#9CA3AF' }}
          >
            {d}
          </span>
        ))}
      </div>
      {/* Circles */}
      <div className="flex justify-between px-1">
        {DAY_LABELS.map((d, i) => {
          const daysAgo = (todayIndex - i + 7) % 7;
          const isToday = i === todayIndex;
          const isPast  = daysAgo > 0 && daysAgo < streak;
          const isFuture = !isToday && !isPast;

          return (
            <div key={d} className="flex flex-col items-center" style={{ width: 40 }}>
              {isToday ? (
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.4 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#F97316', boxShadow: '0 0 12px rgba(249,115,22,0.5)' }}
                >
                  <Flame size={20} fill="white" stroke="white" strokeWidth={0.5} />
                </motion.div>
              ) : isPast ? (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#F97316' }}
                >
                  <CheckCircle size={18} color="white" strokeWidth={2} />
                </div>
              ) : (
                <div
                  className="w-9 h-9 rounded-full border-2"
                  style={{ borderColor: '#E5E7EB', background: 'transparent' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Milestone chips ─────────────────────────────────────────── */
const MILESTONES = [
  { days: 7,  label: '7 Days',   reward: '+50 XP'    },
  { days: 14, label: '14 Days',  reward: '+200 XP'   },
  { days: 21, label: '21 Days',  reward: '+500 XP'   },
  { days: 28, label: '28 Days',  reward: 'Special'   },
] as const;

function Milestones({ streak }: { streak: number }) {
  const nextMilestone = MILESTONES.find((m) => streak < m.days);

  return (
    <div
      className="w-full rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      {nextMilestone && (
        <div className="flex items-center gap-2 mb-3">
          <Gift size={16} style={{ color: '#F97316' }} strokeWidth={2} />
          <p className="font-ui text-sm font-semibold" style={{ color: '#FED7AA' }}>
            Next Reward: {nextMilestone.reward}
          </p>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {MILESTONES.map((m) => {
          const isCompleted = streak >= m.days;
          const isNext      = m === nextMilestone;
          return (
            <div
              key={m.days}
              className="flex-1 min-w-0 rounded-xl px-2 py-2 text-center"
              style={{
                background: isCompleted ? '#F97316' : isNext ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.07)',
                border: isNext ? '1.5px solid #F97316' : '1.5px solid transparent',
              }}
            >
              <p className="font-display text-xs font-bold text-white leading-tight">{m.label}</p>
              <p className="font-ui text-[10px] font-semibold mt-0.5" style={{ color: isCompleted ? 'white' : '#FED7AA' }}>
                {m.reward}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export default function StreakPage() {
  const router = useRouter();
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const todayIndex = new Date().getDay(); // 0 = Sun

  return (
    <div
      className="min-h-screen flex flex-col px-5 py-8 relative overflow-hidden"
      style={{ background: '#1A0A2E' }}
    >
      {/* Glow orbs */}
      <div
        className="absolute -top-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(138,43,226,0.2) 0%, transparent 70%)' }}
      />

      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} color="white" strokeWidth={2} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Streak</h1>
      </div>

      <div className="flex-1 flex flex-col items-center gap-6 relative z-10">
        {/* Large glowing flame */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ filter: 'drop-shadow(0 0 24px rgba(249,115,22,0.7))' }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame size={80} fill="#F97316" stroke="#EA580C" strokeWidth={0.3} />
          </motion.div>
        </motion.div>

        {/* Streak count */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <span
            className="font-display font-black text-white tabular-nums"
            style={{ fontSize: 80, lineHeight: 1 }}
          >
            {currentStreak}
          </span>
          <span className="font-display text-2xl font-bold" style={{ color: '#FED7AA' }}>
            {currentStreak === 1 ? 'day streak' : 'days streak'}
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-ui text-base text-center leading-relaxed max-w-xs"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {currentStreak > 0
            ? 'Keep learning daily to grow your streak!'
            : 'Start practising today to begin your streak!'}
        </motion.p>

        {/* Weekly calendar */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <WeekCalendar streak={currentStreak} todayIndex={todayIndex} />
        </motion.div>

        {/* Milestones */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Milestones streak={currentStreak} />
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.div
        className="relative z-10 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
      >
        <motion.button
          onClick={() => router.push('/home')}
          className="w-full rounded-3xl py-4 font-display font-bold text-white text-lg flex items-center justify-center gap-2"
          style={{ background: '#F97316', boxShadow: '0 5px 0 0 #C2410C' }}
          whileTap={{ y: 5, boxShadow: 'none' }}
        >
          <Zap size={20} fill="white" stroke="white" strokeWidth={0.5} />
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}
