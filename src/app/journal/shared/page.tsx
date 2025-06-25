'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';

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

export default function SharedJournalPage() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get('id');
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError('No share ID provided');
      setLoading(false);
      return;
    }

    const fetchSharedEntry = async () => {
      try {
        const response = await fetch(`/api/journal/shared?id=${shareId}`);
        if (!response.ok) {
          throw new Error('Share not found');
        }
        const data = await response.json();
        setShareData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared entry');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedEntry();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-4">Share Not Found</h2>
                <p className="text-gray-300 mb-6">{error}</p>
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

  if (!shareData) {
    return null;
  }

  const { entry, authorFid } = shareData;
  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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