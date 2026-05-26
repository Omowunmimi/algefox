'use client';

import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Types ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger' | 'success' | 'outline' | 'amber';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  // primary = big green CTA (Duolingo-style action button)
  primary:   'bg-cta text-white',
  secondary: 'bg-secondary text-white',
  gold:      'bg-gold text-white',
  success:   'bg-success text-white',
  danger:    'bg-error text-white',
  ghost:     'bg-transparent text-primary hover:bg-primary-lighter border-2 border-transparent hover:border-primary',
  outline:   'bg-white text-primary border-2 border-primary',
  amber:     'bg-amber text-white',
};

const variantShadow: Record<ButtonVariant, string | null> = {
  primary:   'var(--shadow-physical-cta)',
  secondary: 'var(--shadow-physical-secondary)',
  gold:      'var(--shadow-physical-gold)',
  success:   'var(--shadow-physical-success)',
  danger:    'var(--shadow-physical-error)',
  ghost:     null,
  outline:   null,
  amber:     'var(--shadow-physical-amber)',
};

// ─── Size config ──────────────────────────────────────────────────────────────

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-4 py-2 rounded-full',
  md: 'text-base px-6 py-3.5 rounded-full',
  lg: 'text-lg px-8 py-4 rounded-full font-semibold',
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    className,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;
  const shadow = variantShadow[variant];
  const hasPhysicalShadow = shadow !== null;

  return (
    <motion.button
      ref={ref}
      // Hover lift (physical buttons only)
      whileHover={isDisabled || !hasPhysicalShadow ? undefined : { scale: 1.03 }}
      // Tap press — pushes into physical shadow
      whileTap={
        isDisabled || !hasPhysicalShadow
          ? undefined
          : { y: 4, boxShadow: 'none', scale: 0.98 }
      }
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      style={
        isDisabled || !hasPhysicalShadow
          ? undefined
          : { boxShadow: shadow }
      }
      disabled={isDisabled}
      className={cn(
        // Base
        'relative inline-flex items-center justify-center gap-2 font-ui font-bold select-none',
        'transition-opacity duration-150',
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Width
        fullWidth && 'w-full',
        // Disabled / loading
        isDisabled && 'opacity-60 cursor-not-allowed',
        className,
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
