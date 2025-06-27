import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postType = searchParams.get('type');
  
  const supabase = createServiceRoleClient();
  
  let query = supabase
    .from('bot_posts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  if (postType) {
    // Get the latest active post of a specific type
    query = query.eq('post_type', postType).limit(1);
  }
  
  const { data: posts, error } = await query;
  
  if (error) {
    console.error('Error fetching bot posts:', error);
    return NextResponse.json({ error: 'Failed to fetch bot posts' }, { status: 500 });
  }
  
  if (postType) {
    // Return single post for specific type
    const post = posts?.[0] || null;
    return NextResponse.json({ post });
  }
  
  // Return all active posts grouped by type
  const postsByType = {
    journal_affirmation: posts?.find(p => p.post_type === 'journal_affirmation') || null,
    sol_age_prompt: posts?.find(p => p.post_type === 'sol_age_prompt') || null,
    pledge_encouragement: posts?.find(p => p.post_type === 'pledge_encouragement') || null,
  };
  
  return NextResponse.json({ posts: postsByType });
}

export async function POST(req: NextRequest) {
  try {
    const { castHash, content, postType, miniAppUrl, botFid } = await req.json();
    
    // Basic validation
    if (!castHash || !content || !postType || !botFid) {
      return NextResponse.json(
        { error: 'Missing required fields: castHash, content, postType, botFid' }, 
        { status: 400 }
      );
    }
    
    // Validate post type
    const validTypes = ['journal_affirmation', 'sol_age_prompt', 'pledge_encouragement'];
    if (!validTypes.includes(postType)) {
      return NextResponse.json(
        { error: 'Invalid postType. Must be one of: ' + validTypes.join(', ') }, 
        { status: 400 }
      );
    }
    
    // Validate cast hash format
    if (!castHash.startsWith('0x') || castHash.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid castHash format. Must be hex string starting with 0x' }, 
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Start a transaction to handle deactivating old posts and creating new one
    const { data, error } = await supabase.rpc('create_bot_post_with_deactivation', {
      p_cast_hash: castHash,
      p_content: content,
      p_post_type: postType,
      p_mini_app_url: miniAppUrl || null,
      p_bot_fid: botFid
    });
    
    if (error) {
      console.error('Error creating bot post:', error);
      return NextResponse.json({ error: 'Failed to create bot post' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bot post created successfully',
      postId: data
    });
    
  } catch (error) {
    console.error('Error in bot posts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}