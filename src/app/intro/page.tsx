/**
 * Intro Slides (3 screens)
 * Walks new users through AlgeFox's key features before auth.
 *
 * TODO: Implement 3-slide carousel with Framer Motion (Epic 2)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to AlgeFox',
};

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <p className="text-gray-500 font-ui">Intro slides — coming soon</p>
    </div>
  );
}
