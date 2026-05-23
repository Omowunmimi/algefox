/**
 * Root route — redirects to splash screen on first load.
 * Middleware handles auth-aware routing from there.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/splash');
}
