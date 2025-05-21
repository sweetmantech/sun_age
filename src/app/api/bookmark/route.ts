import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { fid, anon_id, user_type } = await request.json();
    if (!fid && !anon_id) {
      return NextResponse.json({ error: 'No FID or anon_id provided' }, { status: 400 });
    }
    const payload: any = { bookmarked: true, user_type };
    if (fid) payload.fid = fid.toString();
    if (anon_id) payload.anon_id = anon_id;

    // Use upsert with on_conflict=anon_id for browser users
    const conflictKey = fid ? 'fid' : 'anon_id';
    const response = await fetch(`https://nigfjlrnoggqcsladzpv.supabase.co/rest/v1/user_notification_details?on_conflict=${conflictKey}`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Supabase REST error:', data);
      return NextResponse.json({ error: data }, { status: response.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Failed to update bookmark', details: String(error) }, { status: 500 });
  }
} 