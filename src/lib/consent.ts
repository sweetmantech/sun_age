import { supabase } from '~/utils/supabase/client';

export interface UserConsent {
  fid: string;
  hasConsented: boolean;
  consentDate: string;
  notificationToken?: string;
  notificationUrl?: string;
}

export async function getUserConsent(fid: string): Promise<UserConsent | null> {
  const startTime = performance.now();
  console.log("Starting Supabase fetch at:", new Date().toISOString());

  const { data, error } = await supabase
    .from('user_consent')
    .select('*')
    .eq('fid', fid)
    .single();

  const endTime = performance.now();
  const duration = endTime - startTime;

  if (error) {
    console.error('Error fetching user consent:', error);
    console.log(`Operation failed after ${duration.toFixed(2)}ms`);
    return null;
  }

  console.log(`Successfully fetched user consent after ${duration.toFixed(2)}ms`);
  return data;
}

export async function updateUserConsent(
  fid: string,
  hasConsented: boolean,
  notificationDetails?: { token: string; url: string }
): Promise<boolean> {
  const startTime = performance.now();
  console.log("Starting Supabase update at:", new Date().toISOString());

  console.log("Updating user consent in Supabase:", {
    fid,
    hasConsented,
    hasNotificationDetails: !!notificationDetails
  });

  const consentData = {
    fid,
    has_consented: hasConsented,
    consent_date: new Date().toISOString(),
    ...(notificationDetails && {
      notification_token: notificationDetails.token,
      notification_url: notificationDetails.url
    })
  };

  console.log("Consent data to be stored:", consentData);

  const { error } = await supabase
    .from('user_consent')
    .upsert(consentData, {
      onConflict: 'fid'
    });

  const endTime = performance.now();
  const duration = endTime - startTime;

  if (error) {
    console.error('Error updating user consent in Supabase:', error);
    console.log(`Operation failed after ${duration.toFixed(2)}ms`);
    return false;
  }

  console.log(`Successfully updated user consent in Supabase after ${duration.toFixed(2)}ms`);
  return true;
}

export async function revokeUserConsent(fid: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_consent')
    .update({
      has_consented: false,
      consent_date: new Date().toISOString(),
      notification_token: null,
      notification_url: null
    })
    .eq('fid', fid);

  if (error) {
    console.error('Error revoking user consent:', error);
    return false;
  }

  return true;
} 