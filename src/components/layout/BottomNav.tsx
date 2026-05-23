'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BookOpen, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { href: '/home',         label: 'Home',         Icon: Home },
  { href: '/learn',        label: 'Learn',        Icon: BookOpen },
  { href: '/achievements', label: 'Achievements', Icon: Trophy },
  { href: '/profile',      label: 'Profile',      Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex" style={{ height: '64px' }}>
        {TABS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex flex-col items-center gap-0.5"
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-b-full bg-primary" />
                )}

                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-primary' : 'text-gray-400',
                  )}
                />

                <span
                  className={cn(
                    'text-xs font-semibold font-ui transition-colors duration-150',
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
