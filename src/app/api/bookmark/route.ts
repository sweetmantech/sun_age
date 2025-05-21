import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, anon_id, user_type, is_frame_pinned } = body;
    console.log('Bookmark request body:', body);
    console.log('Bookmark request details:', { 
      fid, 
      anon_id, 
      user_type, 
      is_frame_pinned,
      fidType: fid ? typeof fid : 'undefined',
      hasFid: !!fid
    });

    if (!fid && !anon_id) {
      console.error('No FID or anon_id provided in request');
      return NextResponse.json({ error: 'No FID or anon_id provided' }, { status: 400 });
    }

    const payload: any = { 
      bookmarked: true, 
      user_type,
      created_at: new Date().toISOString(),
      is_frame_pinned: is_frame_pinned || false,
      has_pinned: is_frame_pinned || false,
      notifications_enabled: is_frame_pinned || false, // We'll assume notifications are enabled if frame is pinned
      last_updated: new Date().toISOString()
    };

    // Handle FID for Farcaster users
    if (fid) {
      // Ensure FID is stored as a string
      payload.fid = String(fid);
      console.log('Storing FID:', {
        original: fid,
        converted: payload.fid,
        type: typeof payload.fid
      });
    }

    // Handle anon_id for browser users
    if (anon_id) {
      payload.anon_id = anon_id;
      console.log('Storing anon_id:', anon_id);
    }

    // Use upsert with appropriate conflict key
    const conflictKey = fid ? 'fid' : 'anon_id';
    console.log('Using conflict key:', conflictKey);

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
      console.error('Supabase REST error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return NextResponse.json({ error: data }, { status: response.status });
    }

    console.log('Successfully stored bookmark:', {
      payload,
      response: data
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Failed to update bookmark', details: String(error) }, { status: 500 });
  }
} 