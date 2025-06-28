import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { createServiceRoleClient } from '~/utils/supabase/server';
import Link from 'next/link';
import EntryPreviewModalClient from '~/components/Journal/EntryPreviewModalClient';

const EntryPreviewModal = dynamic(
  () => import('~/components/Journal/EntryPreviewModal').then(mod => mod.EntryPreviewModal),
  { ssr: false }
);

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

export default async function SharedJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  
  const { data: share, error } = await supabase
    .from('journal_shares')
    .select('*, journal_entries(*), user_fid')
    .eq('id', id)
    .single();

  if (error || !share || !share.journal_entries) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Entry Not Found</h1>
          <p className="text-gray-600 mb-4">This journal entry may have been deleted or is no longer available.</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
          >
            GO TO SOLARA
          </Link>
        </div>
      </div>
    );
  }

  // Get user's sol age and entry count for the callout
  let userSolAge: number | null = null;
  let userEntryCount: number | undefined = undefined;
  
  // Try to get from localStorage (client-side only)
  if (typeof window !== 'undefined') {
    try {
      const bookmark = localStorage.getItem('sunCycleBookmark');
      if (bookmark) {
        const parsed = JSON.parse(bookmark);
        userSolAge = parsed.days || null;
      }
    } catch (e) {
      console.error('Error parsing bookmark:', e);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <EntryPreviewModalClient
        entry={share.journal_entries}
        isOpen={true}
        onClose={() => window.history.back()}
        isOwnEntry={false}
        isOnboarded={!!userSolAge}
        userSolAge={userSolAge}
        userEntryCount={userEntryCount}
      />
    </div>
  );
} 