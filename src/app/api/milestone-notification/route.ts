import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, milestone, days, isWelcome, forceWelcome } = body;

    console.log("=== Milestone Notification Request ===");
    console.log("Request data:", { fid, milestone, days, isWelcome, forceWelcome });

    if (!fid) {
      console.log("❌ No FID provided");
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    // Send notification using Neynar API (example, update as needed)
    console.log("Sending notification via Neynar API");
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify({
        message: isWelcome 
          ? "Welcome to Sun Cycle Age! Track your journey around the sun and receive milestone notifications."
          : `Congratulations! You've completed ${milestone} rotations around the sun. Keep shining!`,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send notification', details: String(error) }, { status: 500 });
  }
} 