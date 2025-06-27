"use client";

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { EntryPreviewModal } from '~/components/Journal/EntryPreviewModal';
import type { JournalEntry } from '~/types/journal';
import { useJournal } from '~/hooks/useJournal';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { Metadata } from 'next';
import { SharedEntryViewer } from '~/components/Journal/SharedEntryViewer';
import { createServiceRoleClient } from '~/utils/supabase/server';

interface ShareData {
  entry: JournalEntry;
  authorFid: number;
}

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServiceRoleClient();
  
  // Fetch share and entry data
  const { data: share } = await supabase
    .from('journal_shares')
    .select('*, journal_entries(*), user_fid')
    .eq('id', params.id)
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
  const ogImageUrl = `${baseUrl}/api/og/journal/${params.id}`;
  
  // Create the fc:frame metadata for proper mini app embedding
  const frameData = {
    version: "next",
    imageUrl: ogImageUrl,
    button: {
      title: "🌞 Read on Solara",
      action: {
        type: "launch_frame",
        url: `${baseUrl}/journal/shared/${params.id}`,
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

export default async function SharedJournalPage({ params }: PageProps) {
  const supabase = createServiceRoleClient();
  
  const { data: share, error } = await supabase
    .from('journal_shares')
    .select('*, journal_entries(*), user_fid')
    .eq('id', params.id)
    .single();

  if (error || !share || !share.journal_entries) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Entry Not Found</h1>
          <p className="text-gray-600 mb-4">This journal entry may have been deleted or is no longer available.</p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
          >
            GO TO SOLARA
          </a>
        </div>
      </div>
    );
  }

  return (
    <SharedEntryViewer 
      entry={share.journal_entries} 
      authorFid={share.user_fid} 
    />
  );
} 