import { NextRequest, NextResponse } from "next/server";
import { createClient } from '~/utils/supabase/server';

export async function POST(request: NextRequest) {
  console.log("=== Webhook Request Received ===");
  
  try {
    const data = await request.json();
    console.log("Webhook data:", data);

    const { event, fid } = data;
    console.log("Event:", event);
    console.log("FID:", fid);

    if (!fid) {
      console.error("No FID provided in webhook data");
      return NextResponse.json({ error: 'No FID provided' }, { status: 400 });
    }

    if (event === 'frame_added') {
      console.log("Processing frame_added event...");
      const supabase = await createClient();
      
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
      return NextResponse.json({ success: true });
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
