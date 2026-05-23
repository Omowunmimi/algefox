'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoogleButtonProps {
  mode?: 'signin' | 'signup';
  className?: string;
}

// ─── Google "G" SVG ───────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        fill="#FFC107"
      />
      <path
        d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        fill="#FF3D00"
      />
      <path
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 35c-5.311 0-9.818-3.311-11.586-7.94l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        fill="#4CAF50"
      />
      <path
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        fill="#4285F4"
      />
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 shrink-0 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GoogleButton({ mode = 'signin', className }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const label = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  async function handleClick() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      // Navigation handled by OAuth redirect — no need to reset loading state
    } catch (err) {
      console.error('[GoogleButton] OAuth error:', err);
      setIsLoading(false);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      whileTap={isLoading ? undefined : { y: 3, boxShadow: 'none' }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{ boxShadow: 'var(--shadow-physical)' }}
      aria-label={label}
      className={cn(
        'relative w-full inline-flex items-center justify-center gap-3',
        'bg-white border-2 border-gray-200 rounded-xl',
        'font-ui font-semibold text-base text-gray-700',
        'px-6 py-3',
        'transition-colors duration-150',
        'hover:bg-gray-50',
        isLoading && 'opacity-60 cursor-not-allowed',
        className,
      )}
    >
      {isLoading ? <Spinner /> : <GoogleIcon />}
      <span>{label}</span>
    </motion.button>
  );
}
