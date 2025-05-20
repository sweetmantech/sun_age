import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UserConsent {
  fid: string;
  hasConsented: boolean;
  consentDate: string;
  notificationToken?: string;
  notificationUrl?: string;
}

export async function getUserConsent(fid: string): Promise<UserConsent | null> {
  const { data, error } = await supabase
    .from('user_consent')
    .select('*')
    .eq('fid', fid)
    .single();

  if (error) {
    console.error('Error fetching user consent:', error);
    return null;
  }

  return data;
}

export async function updateUserConsent(
  fid: string,
  hasConsented: boolean,
  notificationDetails?: { token: string; url: string }
): Promise<boolean> {
  const consentData = {
    fid,
    has_consented: hasConsented,
    consent_date: new Date().toISOString(),
    ...(notificationDetails && {
      notification_token: notificationDetails.token,
      notification_url: notificationDetails.url
    })
  };

  const { error } = await supabase
    .from('user_consent')
    .upsert(consentData, {
      onConflict: 'fid'
    });

  if (error) {
    console.error('Error updating user consent:', error);
    return false;
  }

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