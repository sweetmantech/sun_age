import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';
import { sendFarcasterNotification } from '~/lib/notifs';

export async function POST(req: NextRequest) {
  const { userFid, entryId, shareId } = await req.json();
  const supabase = await createClient();

  // Check if notification already exists
  const { data: existing } = await supabase
    .from('claim_notifications')
    .select('id')
    .eq('user_fid', userFid)
    .eq('entry_id', entryId)
    .eq('share_id', shareId)
    .single();

  if (existing) {
    return NextResponse.json({ alreadySent: true });
  }

  // Create notification
  const { error } = await supabase
    .from('claim_notifications')
    .insert({
      user_fid: userFid,
      title: "🎉 Cosmic Achievement Unlocked!",
      message: "You've shared your first reflection. Claim your 10,000 $SOLAR tokens.",
      entry_id: entryId,
      share_id: shareId,
      claim_amount: 10000
    });

  if (error) {
    return NextResponse.json({ error: 'Could not create notification' }, { status: 500 });
  }

  // Send Farcaster notification
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const targetUrl = `${baseUrl}/claim?entry=${entryId}&share=${shareId}`;
  
  const notificationSent = await sendFarcasterNotification(userFid, {
    title: "🎉 Cosmic Achievement Unlocked!",
    body: "You've shared your first reflection. Claim your 10,000 $SOLAR tokens.",
    targetUrl
  });

  return NextResponse.json({ 
    sent: true, 
    notificationSent,
    targetUrl 
  });
}