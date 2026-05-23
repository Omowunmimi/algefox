'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AyoMascot } from '@/components/mascot/AyoMascot';
import { SpeechBubble } from '@/components/mascot/SpeechBubble';

// ─── Avatar options ───────────────────────────────────────────────────────────

const AVATARS = [
  { id: 'avatar-01', bg: 'bg-secondary',       emoji: '🦸' },
  { id: 'avatar-02', bg: 'bg-primary',          emoji: '🧑‍🎓' },
  { id: 'avatar-03', bg: 'bg-blue-500',         emoji: '🧙' },
  { id: 'avatar-04', bg: 'bg-green-500',        emoji: '🦊' },
  { id: 'avatar-05', bg: 'bg-pink-500',         emoji: '👩‍🚀' },
  { id: 'avatar-06', bg: 'bg-gold',             emoji: '🏆' },
  { id: 'avatar-07', bg: 'bg-teal-500',         emoji: '🎯' },
  { id: 'avatar-08', bg: 'bg-red-500',          emoji: '⚡' },
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

      router.push('/onboarding/skill-level');
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
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 safe-top">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-ui text-sm font-semibold text-gray-500">Step 1 of 2</span>
          <span className="font-ui text-sm text-gray-400">Profile</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full transition-all duration-500" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Mascot + speech bubble */}
        <div className="flex items-flex-start gap-3 mb-8">
          <AyoMascot expression="encouraging" size={80} animated={true} />
          <div className="pt-2">
            <SpeechBubble
              message="What should I call you? Pick a cool username!"
              variant="default"
            />
          </div>
        </div>

        {/* Username section */}
        <div className="mb-8">
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
        </div>

        {/* Avatar section */}
        <div className="mb-8">
          <p className="font-ui text-sm font-semibold text-gray-700 mb-3">
            Choose your avatar
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-select">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <motion.button
                  key={avatar.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  aria-label={`Select ${avatar.id}`}
                  aria-pressed={isSelected}
                  className={`
                    flex-none flex items-center justify-center
                    w-16 h-16 rounded-2xl text-2xl
                    transition-all duration-150
                    ${avatar.bg}
                    ${isSelected
                      ? 'ring-4 ring-primary ring-offset-2 scale-105'
                      : 'opacity-80 hover:opacity-100'
                    }
                  `}
                >
                  {avatar.emoji}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky footer CTA */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 safe-bottom">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          isLoading={isLoading}
          onClick={handleContinue}
          style={isValid ? { boxShadow: 'var(--shadow-physical-primary)' } : undefined}
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
