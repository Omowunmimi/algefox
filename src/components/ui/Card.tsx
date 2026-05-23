'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'physical' | 'elevated' | 'outlined' | 'success' | 'error';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  variant?: CardVariant;
  padding?: CardPadding;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const variantClasses: Record<CardVariant, { className: string; style?: React.CSSProperties }> = {
  default: {
    className: 'bg-white rounded-2xl',
    style: { boxShadow: 'var(--shadow-elevation-2)' },
  },
  physical: {
    className: 'bg-white rounded-2xl',
    style: { boxShadow: 'var(--shadow-physical)' },
  },
  elevated: {
    className: 'bg-white rounded-2xl',
    style: { boxShadow: 'var(--shadow-elevation-3)' },
  },
  outlined: {
    className: 'bg-white rounded-2xl border-2 border-gray-200',
  },
  success: {
    className: 'bg-success-bg rounded-2xl border-2 border-success',
  },
  error: {
    className: 'bg-error-bg rounded-2xl border-2 border-error',
  },
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

// ─── Component ────────────────────────────────────────────────────────────────

function Card({
  variant = 'default',
  padding = 'md',
  onClick,
  children,
  className,
  ...rest
}: CardProps) {
  const { className: variantCls, style: variantStyle } = variantClasses[variant];

  const combinedClassName = cn(
    variantCls,
    paddingClasses[padding],
    onClick && 'cursor-pointer',
    className,
  );

  if (onClick) {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        whileHover={{ y: -2 }}
        whileTap={{ y: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={variantStyle}
        className={combinedClassName}
        {...(rest as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      style={variantStyle}
      className={combinedClassName}
      {...rest}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps, CardVariant, CardPadding };
