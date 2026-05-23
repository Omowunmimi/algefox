/**
 * Mascot Intro Screen
 * Ayo the Fox introduces himself to new users after sign-up.
 * Shown once per user, after auth, before profile setup.
 *
 * TODO: Implement with AyoMascot component + speech bubble (Epic 2)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meet Ayo!',
};

export default function MascotIntroPage() {
  return (
    <div className="min-h-screen bg-primary-lighter flex items-center justify-center p-6">
      <div className="text-center">
        <p className="font-display text-2xl font-semibold text-gray-900">
          Meet Ayo the Fox!
        </p>
        <p className="text-gray-500 font-ui mt-2">Mascot intro — coming soon</p>
      </div>
    </div>
  );
}
