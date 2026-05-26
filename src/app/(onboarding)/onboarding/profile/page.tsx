'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import { useUserStore } from '@/stores/useUserStore';

// ─── Avatar options ───────────────────────────────────────────────────────────

const AVATARS = [
  { id: 'avatar-01', bg: '#EDE9FE', emoji: '🦸' },
  { id: 'avatar-02', bg: '#DBEAFE', emoji: '🧑‍🎓' },
  { id: 'avatar-03', bg: '#DCFCE7', emoji: '🧙' },
  { id: 'avatar-04', bg: '#FEF3C7', emoji: '🦊' },
  { id: 'avatar-05', bg: '#FCE7F3', emoji: '👩‍🚀' },
  { id: 'avatar-06', bg: '#FEF9C3', emoji: '🏆' },
  { id: 'avatar-07', bg: '#CCFBF1', emoji: '🎯' },
  { id: 'avatar-08', bg: '#FEE2E2', emoji: '⚡' },
];

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function ProfileSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPrefill = searchParams.get('prefill') === 'true';

  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [initDone, setInitDone] = useState(false);

  // Prefill username from Google metadata
  useEffect(() => {
    if (!isPrefill) {
      setInitDone(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const rawName: string =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          '';
        if (rawName) {
          // Convert to safe username: strip non-alphanumeric, limit length
          const safe = rawName
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .slice(0, 20);
          setUsername(safe);
        }
      }
      setInitDone(true);
    });
  }, [isPrefill]);

  // ─── Validation ─────────────────────────────────────────────────────────────

  const usernameError = (() => {
    if (!username) return '';
    if (username.length < 3) return 'At least 3 characters required';
    if (username.length > 20) return 'Max 20 characters';
    if (!USERNAME_REGEX.test(username)) return 'Letters, numbers and underscores only';
    return '';
  })();

  const isValid =
    username.length >= 3 &&
    username.length <= 20 &&
    USERNAME_REGEX.test(username) &&
    selectedAvatar !== null;

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleContinue = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Session expired. Please log in again.');
        setIsLoading(false);
        return;
      }

      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          username,
          avatar_id: selectedAvatar!,
          onboarding_step: 2,
        })
        .eq('id', user.id);

      if (dbError) {
        // Handle duplicate username
        if (dbError.message?.includes('unique') || dbError.code === '23505') {
          setError('That username is already taken. Try a different one!');
        } else {
          setError('Something went wrong. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Fetch the full profile and save to Zustand store so mascot-intro has the username
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('id, username, avatar_id, auth_provider, onboarding_completed, onboarding_step, skill_level, participant_id')
        .eq('id', user.id)
        .single();

      if (fullProfile) {
        useUserStore.getState().setProfile({
          id: fullProfile.id,
          username: fullProfile.username,
          avatarId: fullProfile.avatar_id,
          authProvider: fullProfile.auth_provider,
          onboardingCompleted: fullProfile.onboarding_completed,
          onboardingStep: fullProfile.onboarding_step,
          skillLevel: fullProfile.skill_level ?? null,
          participantId: fullProfile.participant_id ?? null,
        });
      }

      router.push('/mascot-intro');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (!initDone) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-primary block"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">

        {/* Foxy + speech bubble */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FoxyImage expression="excited" size={120} />
          </motion.div>

          <div
            className="mt-4 w-full max-w-xs rounded-2xl px-4 py-3 text-center relative"
            style={{
              background: '#FFFFFF',
              border: '2px solid #EDE9FE',
              boxShadow: '0 4px 12px rgba(138,43,226,0.08)',
            }}
          >
            {/* Tail pointing up */}
            <span
              className="absolute -top-2.5 left-1/2 -translate-x-1/2"
              aria-hidden="true"
              style={{
                width: 0, height: 0,
                borderLeft: '9px solid transparent',
                borderRight: '9px solid transparent',
                borderBottom: '11px solid #EDE9FE',
              }}
            />
            <span
              className="absolute -top-[7px] left-1/2 -translate-x-1/2"
              aria-hidden="true"
              style={{
                width: 0, height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '10px solid #FFFFFF',
              }}
            />
            <p className="font-ui text-sm font-semibold text-gray-800">
              What should I call you? Pick a cool username!
            </p>
          </div>
        </motion.div>

        {/* Username section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="mb-8"
        >
          <Input
            label="Your username"
            placeholder="e.g. mathchamp99"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.slice(0, 20));
              setError('');
            }}
            error={usernameError || error}
            hint={
              !usernameError && !error
                ? 'Letters, numbers and underscores only'
                : undefined
            }
            maxLength={20}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            rightIcon={
              <span className="font-ui text-xs text-gray-400">
                {username.length}/20
              </span>
            }
          />
        </motion.div>

        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: 'easeOut' }}
          className="mb-8"
        >
          <p className="font-ui text-sm font-semibold text-gray-700 mb-3">
            Choose your avatar
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <motion.button
                  key={avatar.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  aria-label={`Select ${avatar.id}`}
                  aria-pressed={isSelected}
                  className="flex-none flex items-center justify-center w-16 h-16 rounded-2xl text-2xl transition-all duration-150"
                  style={{
                    background: avatar.bg,
                    outline: isSelected ? '3px solid #8A2BE2' : '3px solid transparent',
                    outlineOffset: '2px',
                    transform: isSelected ? 'scale(1.08)' : undefined,
                    boxShadow: isSelected ? '0 4px 12px rgba(138,43,226,0.25)' : '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {avatar.emoji}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Sticky footer CTA */}
      <div
        className="bg-white px-6 py-4"
        style={{ borderTop: '1px solid #F3F4F6', boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          isLoading={isLoading}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ─── Exported page with Suspense boundary ────────────────────────────────────

export default function OnboardingProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary block animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      }
    >
      <ProfileSetupInner />
    </Suspense>
  );
}
