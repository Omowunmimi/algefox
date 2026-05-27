'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, BookOpen, Target, LogOut, Star, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { useUserStore, selectAccuracy } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { createClient } from '@/lib/supabase/client';

/* ── Avatar colour options ─────────────────────────────────── */
const AVATAR_OPTIONS = [
  { id: 'purple',  color: '#8A2BE2' },
  { id: 'orange',  color: '#EA580C' },
  { id: 'blue',    color: '#2563EB' },
  { id: 'green',   color: '#16A34A' },
  { id: 'amber',   color: '#F59E0B' },
  { id: 'pink',    color: '#EC4899' },
  { id: 'teal',    color: '#0891B2' },
  { id: 'red',     color: '#EF4444' },
  { id: 'violet',  color: '#7C3AED' },
  { id: 'rose',    color: '#DB2777' },
  { id: 'lime',    color: '#65A30D' },
  { id: 'indigo',  color: '#4F46E5' },
];

function getAvatarColor(avatarId: string): string {
  const found = AVATAR_OPTIONS.find((o) => o.id === avatarId);
  if (found) return found.color;
  // Fallback: hash-based
  let hash = 0;
  for (let i = 0; i < avatarId.length; i++) {
    hash = avatarId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_OPTIONS[Math.abs(hash) % AVATAR_OPTIONS.length].color;
}

/* ── Hex badge (mini) ─────────────────────────────────────── */
function MiniBadge({ color }: { color: string }) {
  return (
    <svg width="36" height="40" viewBox="0 0 100 110">
      <defs>
        <linearGradient id={`mb-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
        fill={`url(#mb-${color.replace('#', '')})`}
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ── Section card wrapper ──────────────────────────────────── */
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
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const profile       = useUserStore((s) => s.profile);
  const stats         = useUserStore((s) => s.stats);
  const accuracy      = useUserStore(selectAccuracy);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const resetUser     = useUserStore((s) => s.reset);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const resetStreak   = useStreakStore((s) => s.reset);

  const username         = profile?.username ?? 'Champion';
  const avatarId         = profile?.avatarId ?? 'purple';
  const joinYear         = 2025;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const totalXp          = stats?.totalXp ?? 0;
  const level            = stats?.level ?? 1;
  const avatarColor      = getAvatarColor(avatarId);
  const initial          = username.charAt(0).toUpperCase();

  function startEditing() {
    setEditUsername(username);
    setSelectedAvatarId(avatarId);
    setSaveError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    const trimmed = editUsername.trim();
    if (trimmed.length < 2) {
      setSaveError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ username: trimmed, avatar_id: selectedAvatarId })
          .eq('id', user.id);
      }
      updateProfile({ username: trimmed, avatarId: selectedAvatarId });
      setEditing(false);
    } catch {
      setSaveError('Could not save changes. Please try again.');
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

  const BADGE_COLORS = ['#F59E0B', '#F97316', '#3B82F6', '#EF4444', '#8A2BE2', '#16A34A'];

  return (
    <div className="min-h-screen pb-8" style={{ background: '#F8F7FF' }}>

      {/* Top profile section */}
      <div
        className="bg-white px-4 pt-8 pb-5"
        style={{ borderRadius: '0 0 24px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <AnimatePresence mode="wait">
          {!editing ? (
            /* ── View mode ── */
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-white text-3xl relative"
                style={{ background: avatarColor, boxShadow: `0 4px 16px ${avatarColor}55` }}
              >
                {initial}
                {/* Edit button */}
                <motion.button
                  onClick={startEditing}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-white border-2"
                  style={{ borderColor: avatarColor }}
                  aria-label="Edit profile"
                >
                  <Pencil size={12} style={{ color: avatarColor }} strokeWidth={2.5} />
                </motion.button>
              </div>
              <h1 className="font-display text-xl font-bold text-gray-900">{username}</h1>
              <p className="font-ui text-xs text-gray-400">Joined {joinYear}</p>
            </motion.div>
          ) : (
            /* ── Edit mode ── */
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Avatar colour picker */}
              <p className="font-ui text-xs font-bold uppercase tracking-wider text-gray-400">
                Choose Avatar Colour
              </p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedAvatarId(opt.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: opt.color,
                      boxShadow:
                        selectedAvatarId === opt.id
                          ? `0 0 0 3px white, 0 0 0 5px ${opt.color}`
                          : 'none',
                    }}
                    aria-label={opt.id}
                  >
                    {selectedAvatarId === opt.id && (
                      <Check size={16} color="white" strokeWidth={2.5} />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Username input */}
              <div>
                <p className="font-ui text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Display Name
                </p>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  maxLength={30}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 font-display text-base font-semibold text-gray-900 outline-none focus:border-purple-400 transition-colors"
                  placeholder="Your display name"
                />
                {saveError && (
                  <p className="font-ui text-xs text-red-500 mt-1">{saveError}</p>
                )}
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-2">
                <motion.button
                  onClick={cancelEditing}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 rounded-xl py-2.5 border-2 border-gray-200 font-display font-bold text-sm text-gray-500 flex items-center justify-center gap-1.5"
                >
                  <X size={14} strokeWidth={2.5} />
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileTap={!saving ? { y: 3, boxShadow: 'none' } : undefined}
                  className="flex-1 rounded-xl py-2.5 font-display font-bold text-sm text-white flex items-center justify-center gap-1.5"
                  style={{ background: '#8A2BE2', boxShadow: '0 4px 0 0 #5B1483' }}
                >
                  <Check size={14} strokeWidth={2.5} />
                  {saving ? 'Saving...' : 'Save'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats strip */}
        {!editing && (
          <div className="flex items-stretch mt-5 divide-x divide-gray-100">
            <div className="flex-1 flex flex-col items-center gap-1 px-3">
              <div className="flex items-center gap-1">
                <Flame size={16} fill="#F97316" stroke="#EA580C" strokeWidth={0.5} />
                <span className="font-display text-xl font-bold text-gray-900 tabular-nums">{currentStreak}</span>
              </div>
              <p className="font-ui text-xs text-gray-400">Day streak</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 px-3">
              <div className="flex items-center gap-1">
                <Zap size={16} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
                <span className="font-display text-xl font-bold text-gray-900 tabular-nums">{totalXp}</span>
              </div>
              <p className="font-ui text-xs text-gray-400">Total XP</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 px-3">
              <div className="flex items-center gap-1">
                <Star size={16} fill="#FBBF24" stroke="#D97706" strokeWidth={0.5} />
                <span className="font-display text-xl font-bold text-gray-900 tabular-nums">{level}</span>
              </div>
              <p className="font-ui text-xs text-gray-400">Level</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">

        {/* Overview */}
        <SectionCard label="Overview">
          <div className="grid grid-cols-2 gap-px bg-gray-100 mx-4 mb-4 rounded-2xl overflow-hidden">
            {[
              { Icon: Flame,    iconProps: { fill: '#F97316', stroke: '#EA580C', strokeWidth: 0.5 }, value: `${currentStreak} days`, label: 'Streak' },
              { Icon: Zap,      iconProps: { fill: '#FCD34D', stroke: '#D97706', strokeWidth: 0.5 }, value: `${totalXp} XP`,        label: 'Total XP' },
              { Icon: BookOpen, iconProps: { color: '#8A2BE2', strokeWidth: 2 },                    value: `${lessonsCompleted}`,   label: 'Lessons' },
              { Icon: Target,   iconProps: { color: '#16A34A', strokeWidth: 2 },                    value: `${accuracy}%`,          label: 'Accuracy' },
            ].map(({ Icon, iconProps, value, label }) => (
              <div key={label} className="bg-white p-3 flex flex-col gap-1">
                <Icon size={18} {...iconProps} />
                <p className="font-display text-lg font-bold text-gray-900">{value}</p>
                <p className="font-ui text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Achievements strip */}
        <SectionCard label="Achievements">
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BADGE_COLORS.map((c, i) => (
                <div key={i} className="flex-shrink-0" style={{ opacity: i < 2 ? 1 : 0.35 }}>
                  <MiniBadge color={c} />
                </div>
              ))}
            </div>
            <Link
              href="/achievements"
              className="mt-3 flex items-center justify-between py-2 border-t border-gray-100"
            >
              <span className="font-ui text-sm font-semibold text-gray-700">View all achievements</span>
              <ChevronRight size={16} color="#9CA3AF" />
            </Link>
          </div>
        </SectionCard>

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
