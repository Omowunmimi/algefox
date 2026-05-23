'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/useUserStore';
import type { UserProfile, UserStats } from '@/stores/useUserStore';
import type { User } from '@supabase/supabase-js';

/* ── Hook ───────────────────────────────────────────────────── */

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const isLoading = useUserStore((s) => s.isLoading);
  const setProfile = useUserStore((s) => s.setProfile);
  const setStats = useUserStore((s) => s.setStats);
  const setLoading = useUserStore((s) => s.setLoading);
  const setError = useUserStore((s) => s.setError);
  const reset = useUserStore((s) => s.reset);

  const fetchAndPopulate = useCallback(
    async (userId: string) => {
      const supabase = createClient();

      try {
        // Fetch user profile + stats in parallel
        const [{ data: profileData }, { data: statsData }] = await Promise.all([
          supabase
            .from('profiles')
            .select(
              'id, username, avatar_id, auth_provider, onboarding_completed, onboarding_step, skill_level, participant_id',
            )
            .eq('id', userId)
            .single(),
          supabase
            .from('user_stats')
            .select(
              'total_xp, level, hearts, max_hearts, hearts_last_refill, lessons_completed, questions_answered, questions_correct',
            )
            .eq('user_id', userId)
            .single(),
        ]);

        if (profileData) {
          const mapped: UserProfile = {
            id: profileData.id,
            username: profileData.username,
            avatarId: profileData.avatar_id,
            authProvider: profileData.auth_provider,
            onboardingCompleted: profileData.onboarding_completed,
            onboardingStep: profileData.onboarding_step ?? 0,
            skillLevel: profileData.skill_level ?? null,
            participantId: profileData.participant_id ?? null,
          };
          setProfile(mapped);
        }

        if (statsData) {
          const mapped: UserStats = {
            totalXp: statsData.total_xp ?? 0,
            level: statsData.level ?? 1,
            hearts: statsData.hearts ?? 5,
            maxHearts: statsData.max_hearts ?? 5,
            heartsLastRefill: statsData.hearts_last_refill ?? null,
            lessonsCompleted: statsData.lessons_completed ?? 0,
            questionsAnswered: statsData.questions_answered ?? 0,
            questionsCorrect: statsData.questions_correct ?? 0,
          };
          setStats(mapped);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
      }
    },
    [setProfile, setStats, setError],
  );

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Initial session check
    const loadSession = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted && user) {
          await fetchAndPopulate(user.id);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          await fetchAndPopulate(session.user.id);
          setLoading(false);
        }

        if (event === 'SIGNED_OUT') {
          reset();
          router.push('/login');
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAndPopulate, router, reset, setLoading]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT handler will reset store + redirect
  }, []);

  // Derive the current Supabase User from the store profile (lightweight)
  // The actual User object lives in Supabase session — return null here;
  // callers that need the raw User should call supabase.auth.getUser() directly.
  return {
    user: null,
    profile,
    isLoading,
    signOut,
  };
}
