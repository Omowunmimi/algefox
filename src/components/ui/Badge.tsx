import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'primary' | 'secondary' | 'gold' | 'success' | 'error' | 'gray';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  primary:   'bg-primary-lighter text-primary-dark',
  secondary: 'bg-secondary-lighter text-secondary-dark',
  gold:      'bg-gold-lighter text-gold-dark',
  success:   'bg-success-bg text-success-dark',
  error:     'bg-error-bg text-error-dark',
  gray:      'bg-gray-100 text-gray-600',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-3 py-1',
};

// ─── Component ────────────────────────────────────────────────────────────────

function Badge({
  variant = 'primary',
  size = 'sm',
  icon,
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-ui font-semibold',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
