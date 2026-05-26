'use client';

/**
 * FoxyImage — renders a Foxy PNG from /public/mascot/ if available,
 * otherwise falls back to the SVG AyoMascot.
 *
 * ── How to add your fox PNGs ─────────────────────────────────
 * Drop files into /public/mascot/ named:
 *   foxy-happy.png
 *   foxy-excited.png
 *   foxy-encouraging.png
 *   foxy-celebrating.png
 *   foxy-thinking.png
 *   foxy-sad.png
 *   foxy-surprised.png
 *   foxy-idle.png   (the default friendly pose)
 *   foxy-full.png   (full-body standing pose for login/home)
 * Once the files are there, this component picks them up automatically.
 * ─────────────────────────────────────────────────────────────
 */

import Image from 'next/image';
import { AyoMascot } from './AyoMascot';
import type { MascotExpression } from '@/types/gamification.types';

interface FoxyImageProps {
  expression?: MascotExpression | 'full';
  size?: number;
  className?: string;
  /** If true, show SVG even if PNG exists (for testing) */
  svgOnly?: boolean;
}

const PNG_EXISTS: Record<string, boolean> = {
  'foxy-happy':       true,
  'foxy-excited':     true,
  'foxy-encouraging': true,
  'foxy-celebrating': true,
  'foxy-thinking':    false,  // no file yet
  'foxy-sad':         true,
  'foxy-surprised':   true,
  'foxy-idle':        true,
  'foxy-full':        true,
};

function expressionToFile(expression: string): string {
  if (expression === 'full') return 'foxy-full';
  return `foxy-${expression}`;
}

export function FoxyImage({
  expression = 'idle',
  size = 120,
  className = '',
  svgOnly = false,
}: FoxyImageProps) {
  const file = expressionToFile(expression);
  const hasPng = !svgOnly && PNG_EXISTS[file];

  if (hasPng) {
    return (
      <Image
        src={`/mascot/${file}.png`}
        alt={`Foxy the fox — ${expression}`}
        width={size}
        height={size}
        className={`object-contain select-none ${className}`}
        priority
      />
    );
  }

  // Fallback: SVG mascot (full-body gets 'idle' expression)
  const svgExpression: MascotExpression =
    expression === 'full' ? 'happy' : (expression as MascotExpression);

  return (
    <AyoMascot
      expression={svgExpression}
      size={size}
      animated={false}
      className={className}
    />
  );
}
