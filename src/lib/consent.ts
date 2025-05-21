import { createClient } from '~/utils/supabase/client';

export interface UserConsent {
  fid: string;
  hasConsented: boolean;
  consentDate: string;
  notificationToken?: string;
  notificationUrl?: string;
}

export async function getUserConsent(fid: string): Promise<UserConsent | null> {
  console.log("Fetching consent for FID:", fid);
  
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_consent')
    .select('*')
    .eq('fid', fid)
    .single();

  if (error) {
    console.error('Error fetching user consent:', error);
    return null;
  }

  console.log("Found consent data:", data);
  return data;
}

export async function updateUserConsent(
  fid: string,
  hasConsented: boolean,
  notificationDetails?: { token: string; url: string }
): Promise<boolean> {
  console.log("=== Updating User Consent ===");
  console.log("FID:", fid);
  console.log("Has Consented:", hasConsented);
  console.log("Has Notification Details:", !!notificationDetails);

  const supabase = createClient();
  const consentData = {
    fid,
    has_consented: hasConsented,
    consent_date: new Date().toISOString(),
    ...(notificationDetails && {
      notification_token: notificationDetails.token,
      notification_url: notificationDetails.url
    })
  };

  console.log("Storing consent data:", consentData);

  const { error } = await supabase
    .from('user_consent')
    .upsert(consentData, {
      onConflict: 'fid'
    });

  if (error) {
    console.error('Error updating user consent:', error);
    console.log("=== End Update (Failed) ===");
    return false;
  }

  console.log("=== End Update (Success) ===");
  return true;
}

export async function revokeUserConsent(fid: string): Promise<boolean> {
  console.log("=== Revoking User Consent ===");
  console.log("FID:", fid);

  const supabase = createClient();
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
    console.log("=== End Revoke (Failed) ===");
    return false;
  }

  console.log("=== End Revoke (Success) ===");
  return true;
} 