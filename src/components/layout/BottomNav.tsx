'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { House, Map, Trophy, Medal, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { href: '/home',         label: 'Home',        Icon: House   },
  { href: '/learn',        label: 'Learn',       Icon: Map     },
  { href: '/leaderboard',  label: 'Leaderboard', Icon: Trophy  },
  { href: '/achievements', label: 'Achievements', Icon: Medal  },
  { href: '/profile',      label: 'Profile',     Icon: User    },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -2px 12px rgba(0,0,0,0.05)' }}
    >
      <div className="max-w-lg mx-auto flex" style={{ height: '64px' }}>
        {TABS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {/* Active top indicator */}
              {isActive && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                  style={{ width: 32, height: 3, background: '#8A2BE2' }}
                />
              )}

              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex flex-col items-center gap-0.5"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-[#8A2BE2]' : 'text-gray-400',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-semibold font-ui transition-colors duration-150',
                    isActive ? 'text-[#8A2BE2]' : 'text-gray-400',
                  )}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
