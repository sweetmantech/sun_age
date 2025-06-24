import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get('id');
  const supabase = await createClient();

  const { data: share, error: shareError } = await supabase
    .from('journal_shares')
    .select('*, journal_entries(*), user_fid')
    .eq('id', shareId)
    .single();

  if (shareError || !share) {
    return NextResponse.json({ error: 'Share not found' }, { status: 404 });
  }

  return NextResponse.json({
    entry: share.journal_entries,
    authorFid: share.user_fid
  });
}