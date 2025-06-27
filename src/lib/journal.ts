// Shared journal utilities

import type { JournalEntry } from '~/types/journal';
import { getLatestBotPost } from './botPosts';

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

// Helper to trigger first entry claim notification
export async function maybeSendFirstEntryClaimNotification({ userFid, entryId, shareId }: {
  userFid: number;
  entryId: string;
  shareId: string;
}) {
  try {
    // Check if this is the user's first share
    const res = await fetch(`/api/journal/share?userFid=${userFid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!res.ok) {
      console.log("Could not check share count, skipping notification");
      return;
    }
    
    const shares = await res.json();
    
    // Only send notification for first share
    if (shares.length === 1) {
      await fetch('/api/notifications/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userFid, entryId, shareId })
      });
      console.log(`Sent first entry claim notification to user ${userFid}`);
    }
  } catch (error) {
    console.error('Error sending first entry claim notification:', error);
    // Don't throw - notification failure shouldn't break sharing
  }
}

// Helper for composing and sharing a journal entry
export async function composeAndShareEntry(entry: JournalEntry, sdk?: any, isInFrame?: boolean, userFid?: number) {
  // Use provided userFid (for dev override) or fall back to entry.user_fid
  const finalUserFid = userFid || entry.user_fid;
  const result = await shareJournalEntry(entry.id, finalUserFid);
  
  // Trigger notification for first entry claim
  await maybeSendFirstEntryClaimNotification({
    userFid: finalUserFid,
    entryId: entry.id,
    shareId: result.shareId
  });
  
  // Get the latest bot affirmation post to reference
  const botPost = await getLatestBotPost('journal_affirmation');
  
  // Compose the cast using Farcaster Mini App SDK
  const miniAppUrl = 'https://www.solara.fyi';
  // Use new dynamic route for share URL
  const ogImageUrl = window.location.origin + `/journal/shared/${result.shareId}`;
  const shareText = `🌞 My Solara reflection:\n\n${entry.content.slice(0, 200)}...\n\nRead more or try Solara: ${miniAppUrl}`;
  
  // Prepare compose options with bot post reference if available
  const composeOptions: any = {
    text: shareText,
    embeds: [ogImageUrl, miniAppUrl],
  };
  
  // Add parent reference to quote the bot's affirmation post
  if (botPost?.cast_hash) {
    composeOptions.parent = {
      type: 'cast',
      hash: botPost.cast_hash
    };
  }
  
  if (isInFrame && sdk) {
    await sdk.actions.composeCast(composeOptions);
  } else {
    // For non-frame sharing, we'll need to construct the URL with parent parameter
    // Note: Warpcast compose URLs don't directly support parent, so we'll add it as a mention for now
    let fallbackText = shareText;
    if (botPost?.cast_hash) {
      fallbackText += `\n\nInspired by this reflection prompt: https://warpcast.com/${botPost.cast_hash}`;
    }
    
    window.open(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(fallbackText)}&embeds=${encodeURIComponent(ogImageUrl)},${encodeURIComponent(miniAppUrl)}`,
      "_blank"
    );
  }
  
  return result;
} 