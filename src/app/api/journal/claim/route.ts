import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';
import { ethers } from 'ethers';

// SOLAR token contract details
const SOLAR_TOKEN_ADDRESS = '0x746042147240304098C837563aAEc0F671881B07';
const SOLAR_TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// Admin wallet configuration
const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';

export async function POST(req: NextRequest) {
  const { userFid, entryId, shareId, walletAddress } = await req.json();
  const supabase = await createClient();

  // Accept both checksummed and lowercase addresses
  let normalizedAddress;
  try {
    normalizedAddress = ethers.getAddress(walletAddress.toLowerCase());
  } catch (error) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
  }

  // Double-check eligibility
  const { data: claim } = await supabase
    .from('token_claims')
    .select('id')
    .eq('user_fid', userFid)
    .single();

  if (claim) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
  }

  // Verify entry and share exist
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
    return NextResponse.json({ error: 'Entry or share not found' }, { status: 404 });
  }

  let txHash: string;
  let status: string;

  try {
    if (!ADMIN_PRIVATE_KEY) {
      // Fallback: simulate transaction for development
      console.log('No admin wallet configured, simulating transaction...');
      txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
      status = 'pending';
    } else {
      // Real token transfer
      console.log('Processing real token transfer...');
      
      // Setup provider and wallet
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
      
      // Connect to SOLAR token contract
      const solarToken = new ethers.Contract(SOLAR_TOKEN_ADDRESS, SOLAR_TOKEN_ABI, adminWallet);
      
      // Check admin wallet balance
      const adminBalance = await solarToken.balanceOf(adminWallet.address);
      const claimAmount = ethers.parseUnits('10000', 18); // 10,000 SOLAR tokens
      
      if (adminBalance < claimAmount) {
        return NextResponse.json({ 
          error: 'Insufficient tokens in admin wallet' 
        }, { status: 500 });
      }
      
      // Transfer tokens
      const tx = await solarToken.transfer(normalizedAddress, claimAmount);
      await tx.wait(); // Wait for confirmation
      
      txHash = tx.hash;
      status = 'pending';
      
      console.log(`Successfully transferred 10,000 SOLAR tokens to ${normalizedAddress}`);
    }

    // Record claim in database
    const { error: insertError } = await supabase
      .from('token_claims')
      .insert({
        user_fid: userFid,
        amount: 10000,
        transaction_hash: txHash,
        trigger_entry_id: entryId,
        trigger_share_id: shareId,
        wallet_address: normalizedAddress,
        status: status
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: 'Could not record claim', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      amount: 10000,
      status: status
    });

  } catch (error: any) {
    console.error('Token transfer error:', error);
    return NextResponse.json({ 
      error: 'Token transfer failed', 
      details: error.message 
    }, { status: 500 });
  }
}