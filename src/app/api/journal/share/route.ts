import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { entryId, userFid } = await req.json();
  
  const isDev = process.env.NODE_ENV === 'development';
  let supabase;
  let finalUserFid: number;

  if (isDev && userFid) {
    // Use service role for dev override
    supabase = createServiceRoleClient();
    finalUserFid = userFid;
  } else {
    // Use regular client with auth
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    finalUserFid = parseInt(user.id, 10);
  }

  // Validate entry exists and belongs to user
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_fid', finalUserFid)
    .single();

  if (entryError || !entry) {
    return NextResponse.json({ error: 'Entry not found or not owned by user' }, { status: 404 });
  }

  // Check if share record already exists
  const { data: existingShare, error: existingShareError } = await supabase
    .from('journal_shares')
    .select('*')
    .eq('entry_id', entryId)
    .eq('user_fid', finalUserFid)
    .single();

  if (existingShare && !existingShareError) {
    // Share already exists, return it
    return NextResponse.json({
      shareId: existingShare.id,
      shareUrl: existingShare.share_url || `/journal/shared?id=${existingShare.id}`
    });
  }

  // Create share record
  const { data: share, error: shareError } = await supabase
    .from('journal_shares')
    .insert({
      entry_id: entryId,
      user_fid: finalUserFid,
      share_url: '' // We'll update this after getting the share ID
    })
    .select()
    .single();

  if (shareError) {
    console.error('Share creation error:', shareError);
    return NextResponse.json({ error: `Could not create share: ${shareError.message}` }, { status: 500 });
  }

  // Update the share URL with the actual share ID
  const shareUrl = `/journal/shared?id=${share.id}`;
  const { error: updateError } = await supabase
    .from('journal_shares')
    .update({ share_url: shareUrl })
    .eq('id', share.id);

  if (updateError) {
    console.error('Share URL update error:', updateError);
    return NextResponse.json({ error: `Could not update share URL: ${updateError.message}` }, { status: 500 });
  }

  // TODO: Trigger notification if first share (see notification endpoint)

  return NextResponse.json({
    shareId: share.id,
    shareUrl: shareUrl
  });
}