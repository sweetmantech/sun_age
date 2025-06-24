import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { entryId, userFid } = await req.json();
  const supabase = await createClient();

  // Validate entry exists and belongs to user
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_fid', userFid)
    .single();

  if (entryError || !entry) {
    return NextResponse.json({ error: 'Entry not found or not owned by user' }, { status: 404 });
  }

  // Create share record
  const { data: share, error: shareError } = await supabase
    .from('journal_shares')
    .insert({
      entry_id: entryId,
      user_fid: userFid,
      share_url: '' // We'll update this after getting the share ID
    })
    .select()
    .single();

  if (shareError) {
    return NextResponse.json({ error: 'Could not create share' }, { status: 500 });
  }

  // Update the share URL with the actual share ID
  const shareUrl = `/journal/shared?id=${share.id}`;
  const { error: updateError } = await supabase
    .from('journal_shares')
    .update({ share_url: shareUrl })
    .eq('id', share.id);

  if (updateError) {
    return NextResponse.json({ error: 'Could not update share URL' }, { status: 500 });
  }

  // TODO: Trigger notification if first share (see notification endpoint)

  return NextResponse.json({
    shareId: share.id,
    shareUrl: shareUrl
  });
}