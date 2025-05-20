import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABLE = "user_notification_details";

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("notification_details")
    .eq("fid", fid)
    .single();
  if (error || !data) return null;
  return data.notification_details as FrameNotificationDetails;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  await supabase.from(TABLE).upsert([
    { fid, notification_details: notificationDetails },
  ]);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  await supabase.from(TABLE).delete().eq("fid", fid);
}
