'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { AyoMascot } from '@/components/mascot/AyoMascot';

export default function SplashPage() {
  const router = useRouter();
  const sessionRef = useRef<{ authenticated: boolean; onboardingCompleted: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Background: check auth session
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          sessionRef.current = { authenticated: false, onboardingCompleted: false };
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();

        sessionRef.current = {
          authenticated: true,
          onboardingCompleted: profile?.onboarding_completed ?? false,
        };
      } catch {
        sessionRef.current = { authenticated: false, onboardingCompleted: false };
      }
    };

    checkSession();

    // 2.2 second timer
    const timer = setTimeout(() => {
      const session = sessionRef.current;

      if (!session || !session.authenticated) {
        router.replace('/intro');
        return;
      }

      if (session.onboardingCompleted) {
        router.replace('/home');
      } else {
        router.replace('/mascot-intro');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className="font-display text-5xl font-bold text-white tracking-wide">
          AlgeFox
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        className="font-ui text-white/80 text-lg mt-2 text-center"
      >
        Learn Maths. Earn XP. Have fun.
      </motion.p>

      {/* Mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
        className="mt-8"
      >
        <AyoMascot expression="happy" size={120} animated={true} />
      </motion.div>

      {/* Loading dots */}
      <div className="absolute bottom-12 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-white/60 block"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
