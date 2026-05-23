'use client';

import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { AchievementToast } from '@/components/gamification/AchievementToast';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
      <AchievementToast />
    </div>
  );
}
