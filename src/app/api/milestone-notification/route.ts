import { NextResponse } from 'next/server';
import { getUserConsent, updateUserConsent } from '~/lib/consent';

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

    // Get user consent
    const consent = await getUserConsent(fid.toString());
    console.log("Current consent status:", consent);
    
    // For welcome notifications, we can force send if requested
    if (!consent?.hasConsented && !forceWelcome) {
      console.log("❌ User has not consented to notifications");
      return NextResponse.json({ error: 'User has not consented to notifications' }, { status: 403 });
    }

    // If this is a welcome notification and we don't have consent yet, store it
    if (isWelcome && !consent?.hasConsented) {
      console.log("Storing initial consent for welcome notification");
      await updateUserConsent(fid.toString(), true);
    }

    // Send notification using Neynar API
    console.log("Sending notification via Neynar API");
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify({
        notification_token: consent?.notificationToken,
        notification_url: consent?.notificationUrl,
        message: isWelcome 
          ? "Welcome to Sun Cycle Age! Track your journey around the sun and receive milestone notifications."
          : `Congratulations! You've completed ${milestone} rotations around the sun. Keep shining!`,
      }),
    });

    if (!response.ok) {
      console.error("❌ Failed to send notification:", await response.text());
      throw new Error('Failed to send notification');
    }

    console.log("✅ Notification sent successfully");
    console.log("=== End Milestone Notification Request ===");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending milestone notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
} 