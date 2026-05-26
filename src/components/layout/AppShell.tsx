'use client';

import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { AchievementToast } from '@/components/gamification/AchievementToast';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f4f1fb' }}>
      <AppHeader />
      {/* Content: full-width on mobile, 120px inset on desktop */}
      <main className="flex-1 pb-20 overflow-y-auto w-full mx-auto px-0 lg:px-[120px] max-w-screen-xl">
        {children}
      </main>
      <BottomNav />
      <AchievementToast />
    </div>
  );
}
