// Centralized sharing utilities with bot post references
import { getLatestBotPost, type BotPostType } from './botPosts';

export interface ShareOptions {
  text: string;
  embeds: string[];
  botPostType?: BotPostType;
  sdk?: any;
  isInFrame?: boolean;
}

// Enhanced compose cast function that includes bot post references
export async function composeWithBotReference(options: ShareOptions) {
  const { text, embeds, botPostType, sdk, isInFrame } = options;
  
  // Get bot post reference if type is specified
  let botPost: any = null;
  if (botPostType) {
    botPost = await getLatestBotPost(botPostType);
  }
  
  // Prepare compose options
  const composeOptions: any = {
    text,
    embeds,
  };
  
  // Add parent reference to quote the bot post if available
  if (botPost && botPost.cast_hash) {
    composeOptions.parent = {
      type: 'cast',
      hash: botPost.cast_hash
    };
  }
  
  if (isInFrame && sdk) {
    return await sdk.actions.composeCast(composeOptions);
  } else {
    // For non-frame sharing, add bot post reference as a link
    let fallbackText = text;
    if (botPost && botPost.cast_hash) {
      fallbackText += `\n\nInspired by: https://warpcast.com/${botPost.cast_hash}`;
    }
    
    const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(fallbackText)}&embeds=${encodeURIComponent(embeds.join(','))}`;
    window.open(composeUrl, "_blank");
    return { success: true };
  }
}

// Sol Age sharing with bot reference
export async function shareSolAge(
  days: number, 
  approxYears: number, 
  birthDate: string, 
  userName: string = 'TRAVELLER',
  profilePicUrl?: string,
  sdk?: any,
  isInFrame?: boolean
) {
  const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
  const ogImageUrl = `${url}/api/og/solage?userName=${encodeURIComponent(userName)}&solAge=${days}&birthDate=${encodeURIComponent(birthDate)}&age=${approxYears}` +
    (profilePicUrl ? `&profilePicUrl=${encodeURIComponent(profilePicUrl)}` : '');
  const miniAppUrl = 'https://www.solara.fyi';
  const message = `Forget birthdays—I've completed ${days} rotations around the sun ☀️🌎 What's your Sol Age?\n\nTry it yourself: ${miniAppUrl}`;
  
  return await composeWithBotReference({
    text: message,
    embeds: [ogImageUrl, miniAppUrl],
    botPostType: 'sol_age_prompt',
    sdk,
    isInFrame
  });
}

// Pledge sharing with bot reference
export async function sharePledge(
  signatureMsg: string,
  userName: string = 'TRAVELLER',
  fid?: string,
  solAge?: string,
  currentDate?: string,
  profilePicUrl?: string,
  sdk?: any,
  isInFrame?: boolean
) {
  const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
  const ogImageUrl = `${url}/api/og/vow?userName=${encodeURIComponent(userName)}&fid=${fid || ''}&solAge=${solAge || ''}&currentDate=${encodeURIComponent(currentDate || '')}${profilePicUrl ? `&profilePicUrl=${encodeURIComponent(profilePicUrl)}` : ''}`;
  const shareText = `I've inscribed my Solar Vow into eternity:\n"${signatureMsg}"\n\nMake a vow and join the convergence: ${url}`;
  
  return await composeWithBotReference({
    text: shareText,
    embeds: [ogImageUrl],
    botPostType: 'pledge_encouragement',
    sdk,
    isInFrame
  });
}