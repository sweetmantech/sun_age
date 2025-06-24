import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { userFid, entryId, shareId, walletAddress } = await req.json();
  const supabase = await createClient();

  // Double-check eligibility
  const { data: claim } = await supabase
    .from('token_claims')
    .select('id')
    .eq('user_fid', userFid)
    .single();

  if (claim) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
  }

  // TODO: Add actual token transfer logic here
  // For now, simulate a transaction hash
  const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');

  // Record claim
  const { error: insertError } = await supabase
    .from('token_claims')
    .insert({
      user_fid: userFid,
      amount: 10000,
      transaction_hash: txHash,
      trigger_entry_id: entryId,
      trigger_share_id: shareId,
      wallet_address: walletAddress,
      status: 'pending'
    });

  if (insertError) {
    return NextResponse.json({ error: 'Could not record claim' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    transactionHash: txHash,
    amount: 10000,
    status: 'pending'
  });
}