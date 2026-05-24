'use client';

import { motion } from 'framer-motion';

interface HeartDisplayProps {
  hearts: number;
  maxHearts: number;
  size?: 'sm' | 'md';
}

function HeartIcon({
  filled,
  index,
  wasJustLost,
}: {
  filled: boolean;
  index: number;
  wasJustLost: boolean;
}) {
  return (
    <motion.span
      key={`heart-${index}-${filled}`}
      animate={wasJustLost ? { x: [0, -4, 4, -3, 3, 0] } : {}}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-full h-full"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={filled ? 'var(--color-heart-full, #F43F5E)' : 'var(--color-heart-empty, #E5E7EB)'}
        />
      </svg>
    </motion.span>
  );
}

export function HeartDisplay({ hearts, maxHearts, size = 'sm' }: HeartDisplayProps) {
  const iconSize = size === 'sm' ? 18 : 24;

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${hearts} of ${maxHearts} hearts remaining`}
    >
      {Array.from({ length: maxHearts }, (_, i) => (
        <span
          key={i}
          style={{ width: iconSize, height: iconSize }}
          className="inline-block"
        >
          <HeartIcon
            filled={i < hearts}
            index={i}
            wasJustLost={false}
          />
        </span>
      ))}
    </div>
  );
}
