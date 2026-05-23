/**
 * Research Export Route
 * Protected with RESEARCH_EXPORT_KEY env variable.
 * Provides CSV download of anonymised participant data.
 *
 * Access: /research?key={RESEARCH_EXPORT_KEY}
 *
 * TODO: Implement research dashboard + CSV export (Epic 7)
 */
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Research Data',
};

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function ResearchPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const validKey = process.env.RESEARCH_EXPORT_KEY;

  if (!validKey || key !== validKey) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">
        Research Dashboard
      </h1>
      <p className="text-gray-500 font-ui">Research data export — coming soon</p>
    </div>
  );
}
