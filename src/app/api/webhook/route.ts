import { NextRequest, NextResponse } from "next/server";
import { createClient } from '~/utils/supabase/server';

export async function POST(request: NextRequest) {
  console.log("=== Webhook Request Received ===");
  
  try {
    const data = await request.json();
    console.log("Webhook data:", data);

    const { event, fid, notificationDetails } = data;
    console.log("Event:", event);
    console.log("FID:", fid);
    console.log("Notification details:", notificationDetails);

    if (!fid) {
      console.error("No FID provided in webhook data");
      return NextResponse.json({ error: 'No FID provided' }, { status: 400 });
    }

    const supabase = await createClient();

    if (event === 'frame_added') {
      console.log("Processing frame_added event...");
      
      // Store FID in Supabase
      const { error } = await supabase
        .from('user_notification_details')
        .upsert({
          fid: fid.toString(),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("Failed to store FID:", error);
        return NextResponse.json({ error: 'Failed to store FID' }, { status: 500 });
      }

      console.log("Successfully stored FID:", fid);
    }

    // Handle notification details if provided
    if ((event === 'frame_added' || event === 'notifications_enabled') && notificationDetails) {
      console.log("Processing notification details...");
      const { token, url } = notificationDetails;
      
      const { error } = await supabase
        .from('user_notification_details')
        .upsert({
          fid: fid.toString(),
          token,
          url,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Failed to store notification details:", error);
        return NextResponse.json({ error: 'Failed to store notification details' }, { status: 500 });
      }

      console.log("Successfully stored notification details for FID:", fid);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
