// Consent logic is deprecated; all functions are now commented out.
// import { createClient } from '~/utils/supabase/client';

// export interface UserConsent {
//   fid: string;
//   hasConsented: boolean;
//   consentDate: string;
//   notificationToken?: string;
//   notificationUrl?: string;
// }

// export async function getUserConsent(fid: string): Promise<UserConsent | null> {
//   return null;
// }

// export async function updateUserConsent(
//   fid: string,
//   hasConsented: boolean,
//   notificationDetails?: { token: string; url: string }
// ): Promise<boolean> {
//   return false;
// }

// export async function revokeUserConsent(fid: string): Promise<boolean> {
//   return false;
// } 