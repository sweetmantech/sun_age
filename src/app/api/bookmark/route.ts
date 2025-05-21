import { NextRequest, NextResponse } from "next/server";
import { createClient } from '~/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { fid, anon_id, user_type } = await request.json();
    if (!fid && !anon_id) {
      return NextResponse.json({ error: 'No FID or anon_id provided' }, { status: 400 });
    }
    const supabase = await createClient();
    const updateObj: any = { bookmarked: true, user_type };
    let conflictColumn = '';
    if (fid) {
      updateObj.fid = fid.toString();
      conflictColumn = 'fid';
    }
    if (anon_id) {
      updateObj.anon_id = anon_id;
      conflictColumn = 'anon_id';
    }
    const { error } = await supabase
      .from('user_notification_details')
      .upsert(updateObj, { onConflict: conflictColumn });
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Failed to update bookmark', details: String(error) }, { status: 500 });
  }
} 