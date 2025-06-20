import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';
import type { UpdateJournalEntryRequest } from '~/types/journal';

export async function PUT(
  request: NextRequest,
  params: Promise<{ params: { id: string } }>
) {
  try {
    const { params: resolvedParams } = await params;
    const supabase = await createClient();
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: UpdateJournalEntryRequest = await request.json();
    const { content } = body;

    // Validate input
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    // Check if entry exists and belongs to user
    const { data: existingEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_fid', user.id)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Only allow editing local entries
    if (existingEntry.preservation_status === 'preserved') {
      return NextResponse.json({ error: 'Cannot edit preserved entries' }, { status: 400 });
    }

    // Calculate new word count
    const word_count = content.trim().split(/\s+/).length;

    // Update journal entry
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .update({
        content: content.trim(),
        word_count
      })
      .eq('id', resolvedParams.id)
      .eq('user_fid', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating journal entry:', error);
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Unexpected error in PUT /api/journal/entries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  params: Promise<{ params: { id: string } }>
) {
  try {
    const { params: resolvedParams } = await params;
    const supabase = await createClient();
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if entry exists and belongs to user
    const { data: existingEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_fid', user.id)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Only allow deleting local entries
    if (existingEntry.preservation_status === 'preserved') {
      return NextResponse.json({ error: 'Cannot delete preserved entries' }, { status: 400 });
    }

    // Delete journal entry
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_fid', user.id);

    if (error) {
      console.error('Error deleting journal entry:', error);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/journal/entries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 