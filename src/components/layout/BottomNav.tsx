'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { House, Map, Trophy, Medal, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { href: '/home',         label: 'Home',         Icon: House  },
  { href: '/learn',        label: 'Learn',         Icon: Map    },
  { href: '/leaderboard',  label: 'Leaderboard',   Icon: Trophy },
  { href: '/achievements', label: 'Achievements',  Icon: Medal  },
  { href: '/profile',      label: 'Profile',       Icon: User   },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface"
      style={{
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        borderTop: '1px solid #F3F4F6',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-lg mx-auto flex px-1" style={{ height: '60px' }}>
        {TABS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex items-center justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex flex-col items-center justify-center gap-0.5"
                style={{
                  background: isActive ? '#FCF7FF' : 'transparent',
                  border: isActive ? '1.5px solid #B959FD' : '1.5px solid transparent',
                  borderRadius: 8,
                  width: 52,
                  height: 44,
                  padding: '6px 4px',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-primary' : 'text-gray-400',
                  )}
                />
                <span
                  className={cn(
                    'text-[9px] font-semibold font-ui transition-colors duration-150 leading-none',
                    isActive ? 'text-primary' : 'text-gray-400',
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
