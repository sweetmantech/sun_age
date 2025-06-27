import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  console.log('[API] GET /api/journal/shared/[id] called for share:', id);
  
  const supabase = createServiceRoleClient();

  const { data: share, error: shareError } = await supabase
    .from('journal_shares')
    .select('*, journal_entries(*), user_fid')
    .eq('id', id)
    .single();

  if (shareError || !share) {
    console.log('[API] Share not found:', id);
    return NextResponse.json({ error: 'Share not found' }, { status: 404 });
  }

  console.log('[API] Share found:', { shareId: id, entryId: share.journal_entries?.id, authorFid: share.user_fid });
  return NextResponse.json({
    entry: share.journal_entries,
    authorFid: share.user_fid
  });
} 