'use client';

interface XPDisplayProps {
  totalXp: number;
  level: number;
}

/**
 * XP threshold for a given level: level² × 100
 * Progress within current level: totalXp - (level-1)² × 100
 * XP needed for this level: level² × 100 - (level-1)² × 100
 */
function getXPProgress(totalXp: number, level: number) {
  const levelStartXp = (level - 1) ** 2 * 100;
  const levelEndXp = level ** 2 * 100;
  const progress = totalXp - levelStartXp;
  const needed = levelEndXp - levelStartXp;
  const percent = Math.min(100, Math.max(0, Math.round((progress / needed) * 100)));
  return { progress, needed, percent };
}

export function XPDisplay({ totalXp, level }: XPDisplayProps) {
  const { progress, needed, percent } = getXPProgress(totalXp, level);

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Level badge */}
      <span className="shrink-0 inline-flex items-center justify-center bg-primary text-white text-xs font-bold font-ui rounded-full px-2 py-0.5 leading-none">
        Lv.{level}
      </span>

      {/* Progress bar */}
      <div className="flex-1 min-w-0">
        <div
          className="w-full bg-gray-100 rounded-full overflow-hidden"
          style={{ height: '6px' }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={needed}
          aria-label={`${progress} / ${needed} XP to next level`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* XP text */}
      <span className="shrink-0 text-xs font-ui font-semibold text-gray-500 tabular-nums">
        {progress}<span className="text-gray-400">/{needed}</span>
      </span>
    </div>
  );
}
