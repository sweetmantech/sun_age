import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userFid: string }> }
) {
  const { userFid } = await params;
  const userFidNum = parseInt(userFid);
  const supabase = await createClient();

  const { data: claim } = await supabase
    .from('token_claims')
    .select('*')
    .eq('user_fid', userFidNum)
    .single();

  if (!claim) {
    return NextResponse.json({ hasClaimed: false });
  }

  return NextResponse.json({
    hasClaimed: true,
    amount: claim.amount,
    status: claim.status,
    transactionHash: claim.transaction_hash,
    claimedAt: claim.claimed_at
  });
}