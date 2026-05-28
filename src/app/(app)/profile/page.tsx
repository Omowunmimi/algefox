'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Flame, Zap, BookOpen, Target, LogOut, Star,
  ChevronRight, Pencil, Check, X, Volume2, VolumeX,
  Trophy, GraduationCap,
} from 'lucide-react';
import { useUserStore, selectAccuracy } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { createClient } from '@/lib/supabase/client';

/* ── Avatar character options ──────────────────────────────── */
const AVATAR_CHARACTERS = [
  { id: 'happy',       src: '/mascot/foxy-happy.png',       label: 'Happy'       },
  { id: 'excited',     src: '/mascot/foxy-excited.png',     label: 'Excited'     },
  { id: 'celebrating', src: '/mascot/foxy-celebrating.png', label: 'Celebrating' },
  { id: 'encouraging', src: '/mascot/foxy-encouraging.png', label: 'Encouraging' },
  { id: 'idle',        src: '/mascot/foxy-idle.png',        label: 'Relaxed'     },
  { id: 'surprised',   src: '/mascot/foxy-surprised.png',   label: 'Surprised'   },
  { id: 'full',        src: '/mascot/foxy-full.png',        label: 'Full Foxy'   },
  { id: 'sad',         src: '/mascot/foxy-sad.png',         label: 'Determined'  },
] as const;

type AvatarId = (typeof AVATAR_CHARACTERS)[number]['id'];

function getAvatarSrc(avatarId: string): string {
  const found = AVATAR_CHARACTERS.find((a) => a.id === avatarId);
  return found?.src ?? '/mascot/foxy-happy.png';
}

/* ── Hex badge (mini) ─────────────────────────────────────── */
type MiniBadgeIcon = 'trophy' | 'flame' | 'book' | 'star' | 'grad' | 'zap';

const MINI_ICON_MAP: Record<MiniBadgeIcon, React.ReactNode> = {
  trophy: <Trophy  size={14} color="white" strokeWidth={2} />,
  flame:  <Flame   size={14} color="white" strokeWidth={2} />,
  book:   <BookOpen size={14} color="white" strokeWidth={2} />,
  star:   <Star    size={14} color="white" strokeWidth={2} />,
  grad:   <GraduationCap size={14} color="white" strokeWidth={2} />,
  zap:    <Zap     size={14} color="white" strokeWidth={2} />,
};

function MiniBadge({ color, icon, earned }: { color: string; icon: MiniBadgeIcon; earned: boolean }) {
  const gid = `mb-${color.replace('#', '')}`;
  return (
    <div className="relative flex-shrink-0" style={{ width: 44, height: 48 }}>
      <svg
        viewBox="0 0 100 110"
        width={44}
        height={48}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={earned ? color : '#D1D5DB'} />
            <stop offset="100%" stopColor={earned ? color : '#9CA3AF'} />
          </linearGradient>
        </defs>
        <polygon
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
          fill={`url(#${gid})`}
          stroke={earned ? color : '#9CA3AF'}
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: 4 }}>
        {MINI_ICON_MAP[icon]}
      </div>
    </div>
  );
}

/* ── Streak calendar ───────────────────────────────────────── */
function StreakCalendar({
  currentStreak,
  lastActivityDate,
}: {
  currentStreak: number;
  lastActivityDate: string | null;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sun
  const today = now.getDate();

  // Build the set of streak-active day numbers
  const activeSet = new Set<number>();
  if (lastActivityDate && currentStreak > 0) {
    const last = new Date(lastActivityDate + 'T00:00:00');
    if (last.getFullYear() === year && last.getMonth() === month) {
      for (let i = 0; i < currentStreak; i++) {
        const d = last.getDate() - i;
        if (d >= 1) activeSet.add(d);
      }
    }
  }

  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="px-4 pb-4">
      <p className="font-ui text-xs font-semibold text-gray-400 mb-2 text-center">{monthName} {year}</p>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center font-ui text-[10px] font-bold text-gray-400">{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const isToday  = day === today;
          const isActive = activeSet.has(day);
          return (
            <div
              key={day}
              className="aspect-square flex items-center justify-center rounded-full"
              style={{
                background: isActive ? '#8A2BE2' : isToday ? '#F5F0FF' : 'transparent',
                color: isActive ? 'white' : isToday ? '#8A2BE2' : '#6B7280',
                fontSize: 11,
                fontWeight: isActive || isToday ? 700 : 500,
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Section card ──────────────────────────────────────────── */
function SectionCard({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <p className="font-ui text-xs font-bold uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: '#9CA3AF' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing]       = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('happy');
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);

  const profile       = useUserStore((s) => s.profile);
  const stats         = useUserStore((s) => s.stats);
  const accuracy      = useUserStore(selectAccuracy);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const resetUser     = useUserStore((s) => s.reset);
  const currentStreak     = useStreakStore((s) => s.currentStreak);
  const lastActivityDate  = useStreakStore((s) => s.lastActivityDate);
  const resetStreak       = useStreakStore((s) => s.reset);
  const sfxEnabled    = useAudioStore((s) => s.sfxEnabled);
  const toggleSfx     = useAudioStore((s) => s.toggleSfx);

  const username         = profile?.username ?? '';
  const avatarId         = profile?.avatarId ?? 'happy';
  const avatarSrc        = getAvatarSrc(avatarId);
  const joinYear         = 2025;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const totalXp          = stats?.totalXp ?? 0;
  const level            = stats?.level ?? 1;

  function startEditing() {
    setEditUsername(username);
    setSelectedAvatar((avatarId as AvatarId) ?? 'happy');
    setSaveError(null);
    setEditing(true);
  }

  async function handleSave() {
    const trimmed = editUsername.trim();
    if (trimmed.length < 2) { setSaveError('Name must be at least 2 characters.'); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ username: trimmed, avatar_id: selectedAvatar }).eq('id', user.id);
      }
      updateProfile({ username: trimmed, avatarId: selectedAvatar });
      setEditing(false);
    } catch {
      setSaveError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

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

  const PROFILE_BADGES: { color: string; icon: MiniBadgeIcon; earned: boolean }[] = [
    { color: '#F59E0B', icon: 'trophy', earned: lessonsCompleted >= 1  },
    { color: '#F97316', icon: 'flame',  earned: currentStreak >= 3     },
    { color: '#F97316', icon: 'book',   earned: lessonsCompleted >= 10 },
    { color: '#10B981', icon: 'zap',    earned: lessonsCompleted >= 5  },
    { color: '#8A2BE2', icon: 'grad',   earned: totalXp >= 50          },
    { color: '#10B981', icon: 'star',   earned: false                  },
  ];

  return (
    <div className="min-h-screen pb-8" style={{ background: '#F8F7FF' }}>

      {/* Top profile section */}
      <div className="bg-white px-4 pt-8 pb-5" style={{ borderRadius: '0 0 24px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <AnimatePresence mode="wait">
          {!editing ? (
            /* ── View mode ── */
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col items-center gap-2">
                {/* Foxy avatar */}
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
                    style={{ background: '#F3F0FF', boxShadow: '0 4px 16px rgba(138,43,226,0.2)' }}
                  >
                    <Image
                      src={avatarSrc}
                      alt={`Foxy ${avatarId}`}
                      width={88}
                      height={88}
                      className="object-contain"
                    />
                  </div>
                  <motion.button
                    onClick={startEditing}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-white border-2 border-purple-300"
                    aria-label="Edit profile"
                  >
                    <Pencil size={12} style={{ color: '#8A2BE2' }} strokeWidth={2.5} />
                  </motion.button>
                </div>
                <h1 className="font-display text-xl font-bold text-gray-900">{username || 'Your Profile'}</h1>
                <p className="font-ui text-xs text-gray-400 mt-0.5">Joined {joinYear}</p>

                {/* Level badge */}
                <div
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full font-ui text-xs font-bold text-white"
                  style={{ background: '#8A2BE2' }}
                >
                  <Star size={10} fill="white" strokeWidth={0} />
                  Level {level}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── Edit mode ── */
            <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col gap-4">
                <p className="font-ui text-xs font-bold uppercase tracking-wider text-gray-400">
                  Choose Your Foxy
                </p>

                {/* Avatar grid */}
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_CHARACTERS.map((char) => (
                    <motion.button
                      key={char.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedAvatar(char.id as AvatarId)}
                      className="flex flex-col items-center gap-1"
                      aria-label={char.label}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center"
                        style={{
                          background: selectedAvatar === char.id ? '#F3F0FF' : '#F9FAFB',
                          border: selectedAvatar === char.id ? '2.5px solid #8A2BE2' : '2px solid transparent',
                          boxShadow: selectedAvatar === char.id ? '0 0 0 3px #EDE9FE' : 'none',
                        }}
                      >
                        <Image
                          src={char.src}
                          alt={char.label}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <p
                        className="font-ui text-[10px] font-semibold text-center"
                        style={{ color: selectedAvatar === char.id ? '#8A2BE2' : '#9CA3AF' }}
                      >
                        {char.label}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Username input */}
                <div>
                  <p className="font-ui text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Display Name</p>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    maxLength={30}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 font-display text-base font-semibold text-gray-900 outline-none focus:border-purple-400 transition-colors"
                    placeholder="Your display name"
                  />
                  {saveError && <p className="font-ui text-xs text-red-500 mt-1">{saveError}</p>}
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setEditing(false)}
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 rounded-xl py-2.5 border-2 border-gray-200 font-display font-bold text-sm text-gray-500 flex items-center justify-center gap-1.5"
                  >
                    <X size={14} strokeWidth={2.5} />Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileTap={!saving ? { y: 3, boxShadow: 'none' } : undefined}
                    className="flex-1 rounded-xl py-2.5 font-display font-bold text-sm text-white flex items-center justify-center gap-1.5"
                    style={{ background: '#8A2BE2', boxShadow: '0 4px 0 0 #5B1483' }}
                  >
                    <Check size={14} strokeWidth={2.5} />{saving ? 'Saving...' : 'Save'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">

        {/* Overview */}
        <SectionCard label="Overview">
          <div className="grid grid-cols-2 gap-px bg-gray-100 mx-4 mb-4 rounded-2xl overflow-hidden">
            {[
              { Icon: Flame,    iconProps: { fill: '#F97316', stroke: '#EA580C', strokeWidth: 0.5 }, value: `${currentStreak} days`, label: 'Streak'   },
              { Icon: Zap,      iconProps: { fill: '#FCD34D', stroke: '#D97706', strokeWidth: 0.5 }, value: `${totalXp} XP`,         label: 'Total XP'  },
              { Icon: BookOpen, iconProps: { color: '#8A2BE2', strokeWidth: 2 },                    value: `${lessonsCompleted}`,    label: 'Lessons'   },
              { Icon: Target,   iconProps: { color: '#16A34A', strokeWidth: 2 },                    value: `${accuracy}%`,           label: 'Accuracy'  },
            ].map(({ Icon, iconProps, value, label }) => (
              <div key={label} className="bg-white p-3 flex flex-col gap-1">
                <Icon size={18} {...iconProps} />
                <p className="font-display text-lg font-bold text-gray-900">{value}</p>
                <p className="font-ui text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Streak Calendar */}
        <SectionCard label="Activity">
          <StreakCalendar currentStreak={currentStreak} lastActivityDate={lastActivityDate} />
        </SectionCard>

        {/* Achievements */}
        <SectionCard label="Achievements">
          <div className="px-4 pb-4">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {PROFILE_BADGES.map((b, i) => (
                <div key={i} style={{ opacity: b.earned ? 1 : 0.35 }}>
                  <MiniBadge color={b.color} icon={b.icon} earned={b.earned} />
                </div>
              ))}
            </div>
            <Link href="/achievements" className="mt-3 flex items-center justify-between py-2 border-t border-gray-100">
              <span className="font-ui text-sm font-semibold text-gray-700">View all achievements</span>
              <ChevronRight size={16} color="#9CA3AF" />
            </Link>
          </div>
        </SectionCard>

        {/* Sound toggle */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <motion.button
            onClick={toggleSfx}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between px-4 py-4"
          >
            <div className="flex items-center gap-3">
              {sfxEnabled
                ? <Volume2 size={18} style={{ color: '#8A2BE2' }} strokeWidth={2} />
                : <VolumeX size={18} style={{ color: '#9CA3AF' }} strokeWidth={2} />}
              <span className="font-ui text-sm font-semibold text-gray-700">
                {sfxEnabled ? 'Sounds On' : 'Sounds Off'}
              </span>
            </div>
            <div
              className="w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5"
              style={{ background: sfxEnabled ? '#8A2BE2' : '#E5E7EB' }}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                animate={{ x: sfxEnabled ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </motion.button>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <motion.button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-4"
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={18} style={{ color: '#EF4444' }} strokeWidth={2} />
            <span className="font-ui text-sm font-semibold" style={{ color: '#EF4444' }}>
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </span>
          </motion.button>
        </div>

      </div>
    </div>
  );
}
