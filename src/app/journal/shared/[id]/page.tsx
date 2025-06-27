"use client";

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { EntryPreviewModal } from '~/components/Journal/EntryPreviewModal';
import type { JournalEntry } from '~/types/journal';
import { useJournal } from '~/hooks/useJournal';
import { useFrameSDK } from '~/hooks/useFrameSDK';

interface ShareData {
  entry: JournalEntry;
  authorFid: number;
}

export default function SharedJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userSolAge, setUserSolAge] = useState<number | null>(null);
  const { entries } = useJournal();
  const { sdk, isInFrame } = useFrameSDK();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        if (!id) {
          setError(true);
          return;
        }
        
        // Use the current origin instead of hardcoded base URL
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/journal/shared/${id}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const shareData = await res.json();
        setData(shareData);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Get solAge from localStorage
    if (typeof window !== 'undefined') {
      const bookmark = localStorage.getItem('sunCycleBookmark');
      if (bookmark) {
        try {
          const parsed = JSON.parse(bookmark);
          if (parsed.days) setUserSolAge(parsed.days);
        } catch {}
      }
    }
  }, [params]);

  const handleClose = () => {
    if (isInFrame && sdk) {
      // In Farcaster frame, navigate back to the main app
      sdk.actions.openUrl(window.location.origin);
    } else {
      // Outside frame, redirect to main app
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return notFound();
  }

  const { entry } = data;
  const isOwnEntry = false;
  const isOnboarded = !!userSolAge;
  const userEntryCount = entries.length;

  return (
    <EntryPreviewModal
      entry={entry}
      isOpen={true}
      onClose={handleClose}
      isOwnEntry={isOwnEntry}
      isOnboarded={isOnboarded}
      userSolAge={userSolAge}
      userEntryCount={userEntryCount}
    />
  );
} 