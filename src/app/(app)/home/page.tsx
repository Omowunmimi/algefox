/**
 * Home Screen — main hub
 * Shows the learning path, streak, hearts, and daily challenge.
 *
 * TODO: Implement learning path with PathMap component (Epic 3)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          AlgeFox
        </h1>
      </header>
      <main>
        <p className="text-gray-500 font-ui">Learning path — coming soon</p>
      </main>
    </div>
  );
}
