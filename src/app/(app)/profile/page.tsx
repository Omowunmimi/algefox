'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, LogOut, ClipboardList } from 'lucide-react';
import { useUserStore, selectAccuracy } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

/* ── Stats grid card ────────────────────────────────────────── */
function StatCard({
  value,
  label,
  color = 'text-primary',
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-4 text-center border border-gray-100"
      style={{ boxShadow: 'var(--shadow-elevation-1)' }}
    >
      <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
      <p className="font-ui text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

/* ── Toggle row ─────────────────────────────────────────────── */
function ToggleRow({
  label,
  enabled,
  onToggle,
  icon,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="text-gray-500">{icon}</div>
        <span className="font-ui text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          enabled ? 'bg-primary' : 'bg-gray-300'
        }`}
        aria-label={`${label} — ${enabled ? 'on' : 'off'}`}
        role="switch"
        aria-checked={enabled}
      >
        <motion.span
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
          animate={{ x: enabled ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const profile = useUserStore((s) => s.profile);
  const stats = useUserStore((s) => s.stats);
  const accuracy = useUserStore(selectAccuracy);
  const resetUser = useUserStore((s) => s.reset);

  const currentStreak = useStreakStore((s) => s.currentStreak);
  const resetStreak = useStreakStore((s) => s.reset);

  const sfxEnabled = useAudioStore((s) => s.sfxEnabled);
  const toggleSfx = useAudioStore((s) => s.toggleSfx);

  const username = profile?.username ?? 'Champion';
  const avatarId = profile?.avatarId ?? '';
  const participantId = profile?.participantId;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;

  const showSurvey = lessonsCompleted >= 3;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      resetUser();
      resetStreak();
      router.push('/login');
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ── Profile header ── */}
      <div
        className="px-5 pt-8 pb-6"
        style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Avatar avatarId={avatarId} username={username} size="xl" bordered />
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-white">{username}</h1>
            <p className="font-ui text-sm text-white/70 mt-0.5">AlgeFox Student</p>
            {participantId && (
              <span className="inline-block mt-2 font-ui text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full">
                ID: {participantId}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── Stats grid ── */}
        <section aria-label="Stats">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-3">My Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              value={stats?.totalXp ?? 0}
              label="Total XP"
              color="text-primary"
            />
            <StatCard
              value={stats?.level ?? 1}
              label="Level"
              color="text-secondary"
            />
            <StatCard
              value={currentStreak}
              label="Day Streak"
              color="text-gold"
            />
            <StatCard
              value={`${accuracy}%`}
              label="Accuracy"
              color="text-success"
            />
          </div>
        </section>

        {/* ── Settings ── */}
        <section
          className="bg-white rounded-2xl border border-gray-100 px-4"
          aria-label="Settings"
          style={{ boxShadow: 'var(--shadow-elevation-1)' }}
        >
          <h2 className="font-display text-base font-bold text-gray-800 pt-4 pb-2">Settings</h2>

          <ToggleRow
            label="Sound Effects"
            enabled={sfxEnabled}
            onToggle={toggleSfx}
            icon={sfxEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          />

          {showSurvey && (
            <div className="py-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<ClipboardList size={16} />}
                onClick={() => router.push('/survey/post')}
              >
                Take the survey
              </Button>
            </div>
          )}
        </section>

        {/* ── Account ── */}
        <section aria-label="Account">
          <Button
            variant="danger"
            size="md"
            fullWidth
            isLoading={signingOut}
            leftIcon={<LogOut size={18} />}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
