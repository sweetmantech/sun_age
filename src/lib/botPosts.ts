// Bot posts utility functions

export type BotPostType = 'journal_affirmation' | 'sol_age_prompt' | 'pledge_encouragement';

export interface BotPost {
  id: string;
  cast_hash: string;
  content: string;
  post_type: BotPostType;
  mini_app_url?: string;
  is_active: boolean;
  created_at: string;
  bot_fid: number;
}

export interface BotPostsByType {
  journal_affirmation: BotPost | null;
  sol_age_prompt: BotPost | null;
  pledge_encouragement: BotPost | null;
}

// Fetch the latest bot post for a specific type
export async function getLatestBotPost(type: BotPostType): Promise<BotPost | null> {
  try {
    const response = await fetch(`/api/bot-posts?type=${type}`);
    if (!response.ok) {
      console.error('Failed to fetch bot post:', response.statusText);
      return null;
    }
    const data = await response.json();
    return data.post;
  } catch (error) {
    console.error('Error fetching bot post:', error);
    return null;
  }
}

// Fetch all active bot posts grouped by type
export async function getAllActiveBotPosts(): Promise<BotPostsByType> {
  try {
    const response = await fetch('/api/bot-posts');
    if (!response.ok) {
      console.error('Failed to fetch bot posts:', response.statusText);
      return {
        journal_affirmation: null,
        sol_age_prompt: null,
        pledge_encouragement: null,
      };
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching bot posts:', error);
    return {
      journal_affirmation: null,
      sol_age_prompt: null,
      pledge_encouragement: null,
    };
  }
}

// Create a new bot post (for bot management)
export async function createBotPost(
  castHash: string,
  content: string,
  postType: BotPostType,
  miniAppUrl?: string,
  botFid: number = 5543 // Default to solaracosmos FID, update this to actual FID
): Promise<{ success: boolean; error?: string; postId?: string }> {
  try {
    const response = await fetch('/api/bot-posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        castHash,
        content,
        postType,
        miniAppUrl,
        botFid,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create bot post' };
    }

    return { success: true, postId: data.postId };
  } catch (error) {
    console.error('Error creating bot post:', error);
    return { success: false, error: 'Network error' };
  }
}