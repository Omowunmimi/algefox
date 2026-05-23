'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  avatarId?: string;
  username?: string;
  size?: AvatarSize;
  bordered?: boolean;
  className?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const sizePx: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-2xl',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(username?: string): string {
  if (!username) return '?';
  const parts = username.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

function Avatar({
  avatarId,
  username,
  size = 'md',
  bordered = false,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const px = sizePx[size];
  const showImage = Boolean(avatarId) && !imgError;
  const initials = getInitials(username);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0 select-none',
        sizeClasses[size],
        bordered && 'ring-2 ring-primary ring-offset-2',
        className,
      )}
      aria-label={username ?? 'User avatar'}
    >
      {showImage ? (
        <Image
          src={`/avatars/${avatarId}.png`}
          alt={username ?? 'User avatar'}
          width={px}
          height={px}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
          priority={size === 'xl' || size === 'lg'}
        />
      ) : (
        /* Initials fallback */
        <div
          className={cn(
            'flex items-center justify-center w-full h-full',
            'bg-primary text-white font-ui font-bold',
          )}
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export { Avatar };
export type { AvatarProps, AvatarSize };
