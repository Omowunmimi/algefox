import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';

/* ============================================================
   FONTS
   ============================================================ */
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-nunito',
  display: 'swap',
});

/* ============================================================
   METADATA
   ============================================================ */
export const metadata: Metadata = {
  title: {
    default: 'AlgeFox — Learn Maths the Fun Way',
    template: '%s | AlgeFox',
  },
  description:
    'A gamified mathematics learning app that makes fractions and algebra exciting for junior secondary school students.',
  keywords: ['mathematics', 'algebra', 'fractions', 'learning', 'gamification', 'JSS', 'Nigeria'],
  authors: [{ name: 'AlgeFox' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AlgeFox',
  },
  openGraph: {
    type: 'website',
    siteName: 'AlgeFox',
    title: 'AlgeFox — Learn Maths the Fun Way',
    description: 'Gamified maths learning for JSS students',
  },
};

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

/* ============================================================
   ROOT LAYOUT
   ============================================================ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable}`}
    >
      <head>
        {/* PWA icons */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
