'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { AyoMascot } from '@/components/mascot/AyoMascot';
import { SpeechBubble } from '@/components/mascot/SpeechBubble';

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface LevelOption {
  id: SkillLevel;
  emoji: string;
  label: string;
  description: string;
  accentClass: string;
  selectedBg: string;
  selectedBorder: string;
}

// ─── Level data ───────────────────────────────────────────────────────────────

const LEVELS: LevelOption[] = [
  {
    id: 'beginner',
    emoji: '🌱',
    label: 'Beginner',
    description: 'Fractions and algebra are new to me',
    accentClass: 'text-success',
    selectedBg: 'bg-success-bg',
    selectedBorder: 'border-success',
  },
  {
    id: 'intermediate',
    emoji: '📚',
    label: 'Intermediate',
    description: 'I know the basics, want to get better',
    accentClass: 'text-primary',
    selectedBg: 'bg-primary-lighter',
    selectedBorder: 'border-primary',
  },
  {
    id: 'advanced',
    emoji: '🏆',
    label: 'Advanced',
    description: "I'm comfortable but want to master it",
    accentClass: 'text-secondary',
    selectedBg: 'bg-secondary-lighter',
    selectedBorder: 'border-secondary',
  },
];

// ─── Inner component ──────────────────────────────────────────────────────────

function SkillLevelInner() {
  const router = useRouter();
  const [selected, setSelected] = useState<SkillLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!selected) return;
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

      // Update profile: mark onboarding complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          skill_level: selected,
          onboarding_step: 3,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) {
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      // Upsert user_stats row
      await supabase
        .from('user_stats')
        .upsert(
          { user_id: user.id, total_xp: 0, level: 1 },
          { onConflict: 'user_id', ignoreDuplicates: true },
        );

      // Upsert streaks row
      await supabase
        .from('streaks')
        .upsert(
          { user_id: user.id, current_streak: 0, longest_streak: 0 },
          { onConflict: 'user_id', ignoreDuplicates: true },
        );

      router.push('/home');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 safe-top">
        <div className="flex items-center justify-between mb-1">
          <span className="font-ui text-sm font-semibold text-gray-500">Step 2 of 2</span>
          <span className="font-ui text-sm text-gray-400">Skill Level</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-full bg-primary rounded-full transition-all duration-500" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Mascot + speech */}
        <div className="flex items-flex-start gap-3 mb-8">
          <AyoMascot expression="thinking" size={80} animated={true} />
          <div className="pt-2">
            <SpeechBubble
              message="How much maths do you know? No worries — any level is fine! 😊"
              variant="default"
            />
          </div>
        </div>

        {/* Level cards */}
        <div className="flex flex-col gap-4 mb-4">
          {LEVELS.map((level) => {
            const isSelected = selected === level.id;

            return (
              <motion.button
                key={level.id}
                whileTap={{ scale: 0.97, y: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => setSelected(level.id)}
                aria-pressed={isSelected}
                style={isSelected ? { boxShadow: 'var(--shadow-physical)' } : { boxShadow: 'var(--shadow-elevation-1)' }}
                className={`
                  w-full text-left rounded-2xl p-4 border-2 bg-white
                  transition-all duration-200
                  ${isSelected
                    ? `${level.selectedBg} ${level.selectedBorder}`
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`
                      flex-none w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${isSelected ? 'bg-white/60' : 'bg-gray-100'}
                    `}
                  >
                    {level.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-display text-xl font-semibold ${isSelected ? level.accentClass : 'text-gray-900'}`}>
                      {level.label}
                    </p>
                    <p className="font-ui text-sm text-gray-600 mt-0.5">
                      {level.description}
                    </p>
                  </div>
                  {/* Selection indicator */}
                  <span
                    className={`
                      flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center
                      transition-all duration-150
                      ${isSelected ? `${level.selectedBorder} bg-primary` : 'border-gray-300'}
                    `}
                  >
                    {isSelected && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1.5 5L4 7.5L8.5 2"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    )}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <p className="font-ui text-sm text-error text-center mt-2">{error}</p>
        )}
      </div>

      {/* Sticky footer CTA */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 safe-bottom">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          isLoading={isLoading}
          onClick={handleStart}
          style={selected ? { boxShadow: 'var(--shadow-physical-primary)' } : undefined}
        >
          Start Learning!
        </Button>
      </div>
    </div>
  );
}

// ─── Exported page with Suspense boundary ────────────────────────────────────

export default function OnboardingSkillLevelPage() {
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
      <SkillLevelInner />
    </Suspense>
  );
}
