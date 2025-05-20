import { NextResponse } from 'next/server';
import { getUserConsent } from '~/lib/consent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, milestone, days, isWelcome } = body;

    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    // Get user consent
    const consent = await getUserConsent(fid.toString());
    if (!consent?.hasConsented) {
      return NextResponse.json({ error: 'User has not consented to notifications' }, { status: 403 });
    }

    // Send notification using Neynar API
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify({
        notification_token: consent.notificationToken,
        notification_url: consent.notificationUrl,
        message: isWelcome 
          ? "Welcome to Sun Cycle Age! Track your journey around the sun and receive milestone notifications."
          : `Congratulations! You've completed ${milestone} rotations around the sun. Keep shining!`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending milestone notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
} 