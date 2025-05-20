import { NextRequest, NextResponse } from "next/server";
import { parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/frame-node";
import { updateUserConsent, revokeUserConsent } from '~/lib/consent';

export async function POST(request: NextRequest) {
  try {
    const requestJson = await request.json();
    console.log("=== Webhook Event Received ===");
    console.log("Event data:", requestJson);

    // Verify the event signature
    const data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
    console.log("Verified event data:", data);

    if ('event' in data) {
      const { event, notificationDetails } = data;
      const fid = 'fid' in data ? data.fid : null;

      if (!fid) {
        console.error("No FID in webhook data");
        return NextResponse.json({ error: 'No FID provided' }, { status: 400 });
      }

      switch (event) {
        case "frame_added":
          if (notificationDetails) {
            console.log("Frame added with notifications enabled");
            // Store the notification token and URL
            await updateUserConsent(
              fid.toString(),
              true,
              {
                token: notificationDetails.token,
                url: notificationDetails.url
              }
            );
          } else {
            console.log("Frame added without notifications");
            await updateUserConsent(fid.toString(), false);
          }
          break;

        case "frame_removed":
          console.log("Frame removed");
          await revokeUserConsent(fid.toString());
          break;

        case "notifications_disabled":
          console.log("Notifications disabled");
          await revokeUserConsent(fid.toString());
          break;

        case "notifications_enabled":
          if (notificationDetails) {
            console.log("Notifications enabled");
            await updateUserConsent(
              fid.toString(),
              true,
              {
                token: notificationDetails.token,
                url: notificationDetails.url
              }
            );
          }
          break;
      }
    }

    console.log("=== End Webhook Event ===");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
