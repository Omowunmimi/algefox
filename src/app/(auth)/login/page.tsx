/**
 * Login Page
 * Supports Google OAuth and email/password sign-in.
 *
 * TODO: Implement with GoogleButton + EmailAuthForm (Epic 2)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-3xl font-semibold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-500 font-ui">Login — coming soon</p>
      </div>
    </div>
  );
}
