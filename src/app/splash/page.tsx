/**
 * Splash Screen
 * The entry point of the app — shows the AlgeFox logo and Ayo mascot
 * for ~2 seconds, then transitions to the intro slides.
 *
 * TODO: Implement animated splash screen (Epic 2)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome',
};

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center text-white">
        <p className="font-display text-4xl font-bold">AlgeFox</p>
        <p className="font-ui mt-2 text-primary-lighter opacity-80">Loading...</p>
      </div>
    </div>
  );
}
