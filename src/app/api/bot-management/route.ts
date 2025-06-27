import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

// Simple admin interface for bot management
// In production, you'd want proper authentication here

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    // Get all bot posts (not just active ones) for management view
    const { data: posts, error } = await supabase
      .from('bot_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all bot posts:', error);
      return NextResponse.json({ error: 'Failed to fetch bot posts' }, { status: 500 });
    }
    
    // Group by type for easier management
    const postsByType = {
      journal_affirmation: posts?.filter(p => p.post_type === 'journal_affirmation') || [],
      sol_age_prompt: posts?.filter(p => p.post_type === 'sol_age_prompt') || [],
      pledge_encouragement: posts?.filter(p => p.post_type === 'pledge_encouragement') || [],
    };
    
    return NextResponse.json({ 
      success: true,
      posts: postsByType,
      totalPosts: posts?.length || 0
    });
    
  } catch (error) {
    console.error('Error in bot management API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, postId, ...postData } = await req.json();
    
    const supabase = createServiceRoleClient();
    
    if (action === 'activate') {
      // Activate a specific post (deactivate others of same type)
      const { data: post, error: fetchError } = await supabase
        .from('bot_posts')
        .select('post_type')
        .eq('id', postId)
        .single();
        
      if (fetchError || !post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      // Use the database function to switch active post
      const { error } = await supabase.rpc('activate_bot_post', {
        p_post_id: postId,
        p_post_type: post.post_type
      });
      
      if (error) {
        console.error('Error activating bot post:', error);
        return NextResponse.json({ error: 'Failed to activate post' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, message: 'Post activated successfully' });
      
    } else if (action === 'deactivate') {
      // Deactivate a specific post
      const { error } = await supabase
        .from('bot_posts')
        .update({ is_active: false })
        .eq('id', postId);
        
      if (error) {
        console.error('Error deactivating bot post:', error);
        return NextResponse.json({ error: 'Failed to deactivate post' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, message: 'Post deactivated successfully' });
      
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in bot management action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}