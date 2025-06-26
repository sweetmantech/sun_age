// Shared journal utilities

import type { JournalEntry } from '~/types/journal';

// Helper for sharing API call
export async function shareJournalEntry(entryId: string, userFid: number) {
  const res = await fetch("/api/journal/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryId, userFid }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to share entry");
  }
  return await res.json(); // { shareId, shareUrl }
}

// Helper for composing and sharing a journal entry
export async function composeAndShareEntry(entry: JournalEntry, sdk?: any, isInFrame?: boolean, userFid?: number) {
  // Use provided userFid (for dev override) or fall back to entry.user_fid
  const finalUserFid = userFid || entry.user_fid;
  const result = await shareJournalEntry(entry.id, finalUserFid);
  
  // Compose the cast using Farcaster Mini App SDK
  const miniAppUrl = 'https://www.solara.fyi';
  const ogImageUrl = window.location.origin + result.shareUrl;
  const shareText = `🌞 My Solara reflection:\n\n${entry.content.slice(0, 200)}...\n\nRead more or try Solara: ${miniAppUrl}`;
  
  if (isInFrame && sdk) {
    await sdk.actions.composeCast({
      text: shareText,
      embeds: [ogImageUrl, miniAppUrl],
    });
  } else {
    window.open(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds=${encodeURIComponent(ogImageUrl)},${encodeURIComponent(miniAppUrl)}`,
      "_blank"
    );
  }
  
  return result;
} 