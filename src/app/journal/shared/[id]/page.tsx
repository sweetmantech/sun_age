// This file is now a dynamic route for shared journal entries
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { notFound } from 'next/navigation';

interface SharedEntry {
  id: string;
  content: string;
  sol_day: number;
  created_at: string;
  user_fid: number;
}

interface ShareData {
  entry: SharedEntry;
  authorFid: number;
}

// Dynamic metadata for OG tags
export async function generateMetadata(props: any) {
  const { params } = props;
  if (!params?.id) return {};
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/journal/shared?id=${params.id}`);
  if (!res.ok) return {};
  const data = await res.json();
  const entry = data.entry;
  const preview = entry?.content?.length > 120 ? entry.content.slice(0, 117) + '...' : entry?.content;
  return {
    title: `Solara Reflection • Sol ${entry?.sol_day ?? ''}`,
    description: preview,
    openGraph: {
      title: `Solara Reflection • Sol ${entry?.sol_day ?? ''}`,
      description: preview,
      images: [`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/og/journal/${params.id}`],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Solara Reflection • Sol ${entry?.sol_day ?? ''}`,
      description: preview,
      images: [`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/og/journal/${params.id}`],
    },
  };
}

export default async function SharedJournalPage(props: any) {
  const { params } = props;
  if (!params?.id) return notFound();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/journal/shared?id=${params.id}`, { cache: 'no-store' });
  if (!res.ok) return notFound();
  const data = await res.json();
  const entry = data.entry;
  const authorFid = data.authorFid;
  const date = entry?.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Sol Day {entry.sol_day} Journal Entry
            </CardTitle>
            <p className="text-gray-300 text-sm">
              Shared by @{authorFid} • {date}
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-white leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <Button 
                onClick={() => window.history.back()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 