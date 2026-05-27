'use client';

import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export function AppHeader() {
  return (
    <header
      className="sticky top-0 z-10 bg-white border-b border-gray-100"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4" style={{ height: '52px' }}>
        <p
          className="font-display text-xl font-bold tracking-wide"
          style={{ color: '#8A2BE2' }}
        >
          AlgeFox
        </p>

        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#F3F0FF' }}
          aria-label="Notifications"
        >
          <Bell size={18} style={{ color: '#8A2BE2' }} strokeWidth={2} />
        </motion.button>
      </div>
    </header>
  );
}
