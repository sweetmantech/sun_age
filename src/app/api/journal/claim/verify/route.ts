import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userFid = parseInt(searchParams.get('fid') || '0');
  const entryId = searchParams.get('entry');
  const shareId = searchParams.get('share');
  const supabase = await createClient();

  // Check entry and share
  const { data: entry } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('id', entryId)
    .eq('user_fid', userFid)
    .single();

  const { data: share } = await supabase
    .from('journal_shares')
    .select('id')
    .eq('id', shareId)
    .eq('user_fid', userFid)
    .single();

  if (!entry || !share) {
    return NextResponse.json({ eligible: false, reason: 'Entry or share not found' });
  }

  // Check if already claimed
  const { data: claim } = await supabase
    .from('token_claims')
    .select('id')
    .eq('user_fid', userFid)
    .single();

  if (claim) {
    return NextResponse.json({ eligible: false, reason: 'Already claimed' });
  }

  return NextResponse.json({
    eligible: true,
    amount: 10000,
    contract: '0x746042147240304098C837563aAEc0F671881B07'
  });
}