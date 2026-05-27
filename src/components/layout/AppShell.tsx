'use client';

import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { AchievementToast } from '@/components/gamification/AchievementToast';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F7FF' }}>
      <AppHeader />
      <main className="flex-1 pb-20 overflow-y-auto w-full max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
      <AchievementToast />
    </div>
  );
}
