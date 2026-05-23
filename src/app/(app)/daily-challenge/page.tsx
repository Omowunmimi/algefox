'use client';

import { useRouter } from 'next/navigation';
import { AyoMascot } from '@/components/mascot/AyoMascot';
import { Button } from '@/components/ui/Button';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DailyChallengePage() {
  const router = useRouter();
  const today = formatDate(new Date());

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Page header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
        <h1 className="font-display text-2xl font-bold text-gray-900">Daily Challenge</h1>
        <p className="font-ui text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      {/* Coming soon state */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center gap-6">
        {/* Challenge badge */}
        <div
          className="bg-gold-lighter border-2 border-gold rounded-2xl px-5 py-2"
          style={{ boxShadow: 'var(--shadow-physical-gold)' }}
        >
          <span className="font-display font-bold text-gold-dark text-sm">
            ⚡ Bonus XP Available
          </span>
        </div>

        {/* Mascot */}
        <AyoMascot expression="excited" size={140} animated />

        {/* Message */}
        <div className="max-w-xs">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
            Coming Soon!
          </h2>
          <p className="font-ui text-sm text-gray-600 leading-relaxed">
            Today&apos;s challenge is on its way! Keep practising your lessons and check
            back soon for bonus XP challenges.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full max-w-xs">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push('/learn')}
          >
            Go to Learn
          </Button>
        </div>

        {/* Small back link */}
        <button
          onClick={() => router.back()}
          className="font-ui text-sm text-gray-400 underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
