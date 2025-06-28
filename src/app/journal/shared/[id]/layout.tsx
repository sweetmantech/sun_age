import { Metadata } from 'next';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  
  // Fetch share and entry data
  const { data: share } = await supabase
    .from('journal_shares')
    .select('*, journal_entries(*), user_fid')
    .eq('id', id)
    .single();

  const entry = share?.journal_entries;
  const authorName = share?.author_name || 'Solara User';
  const authorHandle = share?.author_handle || '@SOLARA';
  
  if (!entry) {
    return {
      title: 'Journal Entry - Solara',
      description: 'A cosmic reflection from the Solara community',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.solara.fyi';
  const ogImageUrl = `${baseUrl}/api/og/journal/${id}`;
  
  // Create the fc:frame metadata for proper mini app embedding
  const frameData = {
    version: "next",
    imageUrl: ogImageUrl,
    button: {
      title: "🌞 Read on Solara",
      action: {
        type: "launch_frame",
        url: `${baseUrl}/journal/shared/${id}`,
        name: "Solara",
        splashImageUrl: `${baseUrl}/logo.png`,
        splashBackgroundColor: "#FDF8EC"
      }
    }
  };

  return {
    title: `Journal Entry by ${authorName} - Solara`,
    description: entry.content?.slice(0, 200) + '...',
    openGraph: {
      title: `Journal Entry by ${authorName} - Solara`,
      description: entry.content?.slice(0, 200) + '...',
      images: [ogImageUrl],
    },
    other: {
      'fc:frame': JSON.stringify(frameData),
    },
  };
}

export default function SharedJournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 