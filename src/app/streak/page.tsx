'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStreakStore } from '@/stores/useStreakStore';

/* ── Math pattern background ─────────────────────────────── */

const MATH_SYMBOLS = [
  { symbol: 'x²',  x: 8,  y: 6  },
  { symbol: '÷',   x: 82, y: 4  },
  { symbol: '∑',   x: 15, y: 22 },
  { symbol: '+',   x: 70, y: 18 },
  { symbol: '=',   x: 90, y: 32 },
  { symbol: '√',   x: 5,  y: 42 },
  { symbol: 'π',   x: 55, y: 8  },
  { symbol: '×',   x: 35, y: 28 },
  { symbol: '%',   x: 78, y: 52 },
  { symbol: '∞',   x: 20, y: 60 },
  { symbol: 'f(x)', x: 60, y: 68 },
  { symbol: '÷',   x: 88, y: 72 },
  { symbol: '+',   x: 10, y: 80 },
  { symbol: 'x²',  x: 45, y: 88 },
];

function MathPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {MATH_SYMBOLS.map((item, i) => (
        <span
          key={i}
          className="absolute font-display font-bold"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            color: 'rgba(138,43,226,0.07)',
            fontSize: i % 3 === 0 ? '18px' : i % 3 === 1 ? '14px' : '20px',
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

/* ── Week calendar ───────────────────────────────────────── */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function WeekCalendar({ activeDayIndex }: { activeDayIndex: number }) {
  return (
    <div
      className="w-full rounded-2xl px-4 py-4 flex items-center justify-between gap-1"
      style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {DAYS.map((day, i) => {
        const isActive = i === activeDayIndex;
        const isPast   = i < activeDayIndex;

        return (
          <div key={day} className="flex flex-col items-center gap-1.5">
            <span
              className="font-ui text-xs font-semibold"
              style={{ color: isActive ? '#EA580C' : '#9CA3AF' }}
            >
              {day}
            </span>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 36, height: 36 }}
            >
              {isActive ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.4 }}
                >
                  <Flame size={26} fill="#EA580C" stroke="#C2410C" strokeWidth={0.5} />
                </motion.div>
              ) : isPast ? (
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 28, height: 28, background: '#FEF3C7' }}
                >
                  <Flame size={16} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
                </div>
              ) : (
                <div
                  className="rounded-full border-2 border-gray-200"
                  style={{ width: 28, height: 28 }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function StreakPage() {
  const router = useRouter();
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12 safe-top safe-bottom relative overflow-hidden"
      style={{ background: '#FAF7F0' }}
    >
      <MathPattern />

      <div />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Large Flame icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame
              size={110}
              fill="#EA580C"
              stroke="#C2410C"
              strokeWidth={0.3}
            />
          </motion.div>
        </motion.div>

        {/* Streak count */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span
            className="font-display font-black text-gray-900"
            style={{ fontSize: '72px', lineHeight: 1 }}
          >
            {currentStreak}
          </span>
          <span className="font-display text-2xl font-bold text-gray-700">
            {currentStreak === 1 ? 'day streak' : 'days streak'}
          </span>
        </motion.div>

        {/* Sub-text */}
        <motion.p
          className="font-ui text-base text-gray-500 text-center max-w-xs leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {currentStreak > 0
            ? "You've started a streak! Learn everyday to build your streak."
            : 'Start practising today to begin your streak!'}
        </motion.p>

        {/* Week calendar */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <WeekCalendar activeDayIndex={currentStreak > 0 ? todayIndex : -1} />
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
      >
        <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/home')}>
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
