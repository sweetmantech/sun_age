import { createClient } from '~/utils/supabase/client';

export interface UserConsent {
  fid: string;
  consent_date: string;
  consent_type: 'welcome' | 'milestone';
  notification_details?: {
    type: 'welcome' | 'milestone';
    message: string;
    timestamp: string;
  };
}

export async function getUserConsent(fid: string): Promise<UserConsent | null> {
  console.log('Fetching consent for FID:', fid);
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_consent')
    .select('*')
    .eq('fid', fid)
    .order('consent_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching user consent:', error);
    return null;
  }

  console.log('Found consent data:', data);
  return data;
}

export async function updateUserConsent(
  fid: string,
  consentType: 'welcome' | 'milestone',
  notificationDetails?: {
    type: 'welcome' | 'milestone';
    message: string;
    timestamp: string;
  }
): Promise<boolean> {
  console.log('Updating consent for FID:', fid, 'Type:', consentType);
  const supabase = createClient();
  
  const consentData = {
    fid,
    consent_date: new Date().toISOString(),
    consent_type: consentType,
    notification_details: notificationDetails
  };

  console.log('Storing consent data:', consentData);

  const { error } = await supabase
    .from('user_consent')
    .insert([consentData]);

  if (error) {
    console.error('Error storing user consent:', error);
    return false;
  }

  console.log('Successfully stored consent data');
  return true;
}

export async function revokeUserConsent(fid: string): Promise<boolean> {
  console.log('Revoking consent for FID:', fid);
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_consent')
    .delete()
    .eq('fid', fid);

  if (error) {
    console.error('Error revoking user consent:', error);
    return false;
  }

  console.log('Successfully revoked consent');
  return true;
} 