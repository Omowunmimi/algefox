'use client';

import { useState } from 'react';
import { Bell, X, Zap, Flame, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Notification item type ────────────────────────────────── */
interface Notif {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  time: string;
}

const SAMPLE_NOTIFS: Notif[] = [
  {
    id: 'n1',
    icon: <Zap size={16} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />,
    title: 'XP Milestone',
    body: 'You\'ve earned 100 XP this week. Keep it up!',
    time: '2h ago',
  },
  {
    id: 'n2',
    icon: <Flame size={16} fill="#F97316" stroke="#EA580C" strokeWidth={0.5} />,
    title: 'Streak Reminder',
    body: 'Don\'t forget to practice today to maintain your streak!',
    time: '5h ago',
  },
  {
    id: 'n3',
    icon: <Star size={16} fill="#FBBF24" stroke="#D97706" strokeWidth={0.5} />,
    title: 'Achievement Unlocked',
    body: 'You earned the "First Steps" badge. Well done!',
    time: '1d ago',
  },
];

/* ── Header ────────────────────────────────────────────────── */
export function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-10 bg-white border-b border-gray-100"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-end px-4" style={{ height: '52px' }}>
          <motion.button
            onClick={() => setOpen((v) => !v)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#F3F0FF' }}
            aria-label="Notifications"
          >
            <Bell size={18} style={{ color: '#8A2BE2' }} strokeWidth={2} />
            {/* Unread dot */}
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: '#EF4444' }}
            />
          </motion.button>
        </div>
      </header>

      {/* Notification panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-14 right-4 z-50 w-80 bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="font-display text-base font-bold text-gray-900">Notifications</p>
                <motion.button
                  onClick={() => setOpen(false)}
                  whileTap={{ scale: 0.88 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: '#F3F4F6' }}
                >
                  <X size={14} strokeWidth={2.5} className="text-gray-500" />
                </motion.button>
              </div>

              {/* Notif list */}
              <div className="divide-y divide-gray-50">
                {SAMPLE_NOTIFS.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
                      style={{ background: '#FEF9C3' }}
                    >
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-bold text-gray-900 leading-tight">{n.title}</p>
                      <p className="font-ui text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    <p className="font-ui text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-gray-100">
                <p className="font-ui text-xs text-center text-gray-400">You&apos;re all caught up!</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
