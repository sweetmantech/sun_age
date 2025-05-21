import { NextResponse } from 'next/server';
import { getUserConsent, updateUserConsent } from '~/lib/consent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, type, message, timestamp, notificationToken, notificationUrl } = body;

    console.log("=== Milestone Notification Request ===");
    console.log("Request data:", { fid, type, message, timestamp });

    if (!fid) {
      console.log("❌ No FID provided");
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    if (!notificationToken || !notificationUrl) {
      console.log("❌ Missing notification details");
      return NextResponse.json({ error: 'Notification details are required' }, { status: 400 });
    }

    // Get user consent
    const consent = await getUserConsent(fid.toString());
    console.log("Current consent status:", consent);

    // Store consent for the notification type
    console.log("Storing consent for notification type:", type);
    await updateUserConsent(fid.toString(), type, {
      type,
      message,
      timestamp,
      notificationToken,
      notificationUrl
    });

    // Send notification using Neynar API
    console.log("Sending notification via Neynar API");
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify({
        notification_token: notificationToken,
        notification_url: notificationUrl,
        message,
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