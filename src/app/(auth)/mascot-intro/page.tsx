'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useUserStore } from '@/stores/useUserStore';
import { createClient } from '@/lib/supabase/client';

/* ── Step data ────────────────────────────────────────────── */

interface Step {
  foxyPng: string;
  message: string;
  buttonLabel: string;
}

function buildSteps(firstName: string): Step[] {
  const greeting = firstName ? `Welcome, ${firstName}!` : 'Welcome!';
  return [
    {
      foxyPng: '/mascot/foxy-excited.png',
      message: `${greeting} 🎉 I'm Foxy — your personal maths guide. I'll cheer you on every single step of the way! 🦊`,
      buttonLabel: 'Hi Foxy!',
    },
    {
      foxyPng: '/mascot/foxy-encouraging.png',
      message: "We'll master Fractions and Algebra together — one level at a time. Answer questions, earn XP, and watch yourself grow! 🏆",
      buttonLabel: 'Sounds great!',
    },
    {
      foxyPng: '/mascot/foxy-celebrating.png',
      message: "Keep your daily streak 🔥, unlock achievements 🏅, and become a maths champion. Your adventure starts now!",
      buttonLabel: "Let's go! 🚀",
    },
  ];
}

/* ── Math symbols background ──────────────────────────────── */

const MATH_SYMBOLS = [
  { symbol: 'x²',  x: 8,  y: 6  },
  { symbol: '÷',   x: 82, y: 4  },
  { symbol: '∑',   x: 15, y: 22 },
  { symbol: '+',   x: 70, y: 18 },
  { symbol: '=',   x: 90, y: 32 },
  { symbol: '√',   x: 5,  y: 42 },
  { symbol: 'π',   x: 55, y: 8  },
  { symbol: '×',   x: 35, y: 28 },
  { symbol: '%',   x: 78, y: 52 },
  { symbol: '∞',   x: 20, y: 60 },
  { symbol: 'f(x)',x: 60, y: 68 },
  { symbol: '÷',   x: 88, y: 72 },
  { symbol: '+',   x: 10, y: 80 },
  { symbol: 'x²',  x: 45, y: 88 },
  { symbol: '∑',   x: 75, y: 82 },
];

function MathPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {MATH_SYMBOLS.map((item, i) => (
        <span
          key={i}
          className="absolute font-display font-bold"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            color: 'rgba(138,43,226,0.07)',
            fontSize: i % 3 === 0 ? '18px' : i % 3 === 1 ? '14px' : '20px',
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

/* ── Slide animation variants ─────────────────────────────── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  }),
};

/* ── Page ─────────────────────────────────────────────────── */

export default function MascotIntroPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  // Resolve the user's real first name from Google auth metadata
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Prefer Google display name over the generated username
      const fullName: string =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        '';

      if (fullName) {
        // Use only the first name
        setFirstName(fullName.split(' ')[0]);
        return;
      }

      // Fallback: read from Supabase profile (the generated username)
      supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.username) {
            // Strip the _XXXX suffix added during generation and capitalise
            const base = data.username.replace(/_\d{4}$/, '').replace(/_/g, ' ');
            setFirstName(base.charAt(0).toUpperCase() + base.slice(1));
          }
        });
    });
  }, []);

  const STEPS = buildSteps(firstName);
  const step = STEPS[currentStep];

  async function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
      return;
    }

    // Last step: mark onboarding complete
    setIsFinishing(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true, onboarding_step: 1 })
          .eq('id', user.id);

        // Populate the Zustand store so the home page has data immediately
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_id, auth_provider, onboarding_completed, onboarding_step, skill_level, participant_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          useUserStore.getState().setProfile({
            id: profile.id,
            username: profile.username,
            avatarId: profile.avatar_id,
            authProvider: profile.auth_provider,
            onboardingCompleted: true,
            onboardingStep: 1,
            skillLevel: profile.skill_level ?? null,
            participantId: profile.participant_id ?? null,
          });
        }

        // Load stats into store too
        const { data: stats } = await supabase
          .from('user_stats')
          .select('total_xp, level, hearts, max_hearts, hearts_last_refill, lessons_completed, questions_answered, questions_correct')
          .eq('user_id', user.id)
          .single();

        if (stats) {
          useUserStore.getState().setStats({
            totalXp: stats.total_xp,
            level: stats.level,
            hearts: stats.hearts,
            maxHearts: stats.max_hearts,
            heartsLastRefill: stats.hearts_last_refill ?? null,
            lessonsCompleted: stats.lessons_completed ?? 0,
            questionsAnswered: stats.questions_answered ?? 0,
            questionsCorrect: stats.questions_correct ?? 0,
          });
        }
      }
    } catch (err) {
      console.error('[mascot-intro] Failed to finalise onboarding:', err);
    } finally {
      router.push('/home');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden"
      style={{ background: '#FAF7F0' }}
    >
      <MathPattern />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 text-center"
      >
        <p className="font-display text-2xl font-bold text-primary tracking-wide">AlgeFox</p>
        <p className="font-ui text-xs text-gray-500 mt-0.5">Your maths adventure</p>
      </motion.div>

      {/* Animated slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm"
        >
          {/* Foxy PNG — bouncing float */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src={step.foxyPng}
              alt="Foxy the fox mascot"
              width={180}
              height={180}
              className="object-contain select-none drop-shadow-xl"
              priority
            />
          </motion.div>

          {/* Speech bubble */}
          <div
            className="w-full rounded-2xl px-5 py-4 relative"
            style={{
              background: '#FFFFFF',
              border: '2px solid #DDD6FE',
              boxShadow: '0 6px 20px rgba(138,43,226,0.10)',
            }}
          >
            {/* Bubble tail pointing up at Foxy */}
            <span
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: -13,
                width: 0, height: 0,
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderBottom: '13px solid #DDD6FE',
              }}
              aria-hidden="true"
            />
            <span
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: -10,
                width: 0, height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '12px solid #FFFFFF',
              }}
              aria-hidden="true"
            />

            <p className="font-ui text-[15px] text-gray-800 leading-relaxed text-center">
              {step.message}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Step dots + CTA */}
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-5 items-center">
        {/* Progress dots */}
        <div className="flex items-center gap-2" role="group" aria-label="Progress">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === currentStep  ? 'w-6 h-3 bg-primary'
                : i < currentStep  ? 'w-3 h-3 bg-primary/40'
                :                    'w-3 h-3 bg-gray-300',
              )}
            />
          ))}
        </div>

        <motion.button
          onClick={handleNext}
          disabled={isFinishing}
          whileTap={{ y: 3, boxShadow: '0 1px 0 0 #15803D' }}
          style={{
            boxShadow: '0 4px 0 0 #15803D',
            background: '#22C55E',
          }}
          className="w-full rounded-2xl py-4 font-display text-base font-bold text-white transition-opacity disabled:opacity-60"
        >
          {isFinishing ? 'Starting your adventure…' : step.buttonLabel}
        </motion.button>
      </div>
    </div>
  );
}
