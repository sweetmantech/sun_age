import type { FrameClientEvent } from '@farcaster/frame-core';
import { createClient } from '~/utils/supabase/server';

type NotificationPayload = {
  fid: number;
  title: string;
  body: string;
};

type NotificationResult = {
  state: 'success' | 'error' | 'rate_limit';
  error?: string;
};

export async function sendFrameNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  // TODO: Implement notification sending logic
  console.log('Sending notification:', payload);
  
  // For now, return a success result
  return { state: 'success' };
}

interface NotificationDetails {
  token?: string;
  url?: string;
}

export async function getNotificationTokenAndUrl(userFid: number): Promise<NotificationDetails> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_notification_details')
    .select('token, url')
    .eq('fid', userFid.toString())
    .single();
  
  return data || {};
}

export async function sendFarcasterNotification(userFid: number, notificationData: {
  title: string;
  body: string;
  targetUrl: string;
}) {
  try {
    const { token, url } = await getNotificationTokenAndUrl(userFid);
    
    if (!token || !url) {
      console.log(`No notification token/url found for user ${userFid}`);
      return false;
    }

    const notificationId = `first-entry-claim-${userFid}`;
    const body = {
      notificationId,
      title: notificationData.title,
      body: notificationData.body,
      targetUrl: notificationData.targetUrl,
      tokens: [token]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error(`Failed to send notification: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log(`Successfully sent notification to user ${userFid}`);
    return true;
  } catch (error) {
    console.error(`Error sending notification to user ${userFid}:`, error);
    return false;
  }
} 