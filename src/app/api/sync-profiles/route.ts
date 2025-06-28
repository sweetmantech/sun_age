import { createServiceRoleClient } from '~/utils/supabase/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return new Response(JSON.stringify({ error: 'fid parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fidNumber = parseInt(fid, 10);
    if (isNaN(fidNumber)) {
      return new Response(JSON.stringify({ error: 'Invalid fid parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServiceRoleClient();
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    
    if (!neynarApiKey) {
      return new Response(JSON.stringify({ 
        error: 'NEYNAR_API_KEY environment variable is required' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const neynarClient = new NeynarAPIClient({ apiKey: neynarApiKey });

    try {
      // Try to fetch real Farcaster user data
      const userResponse = await neynarClient.fetchBulkUsers({ fids: [fidNumber] });
      
      if (userResponse && userResponse.users && userResponse.users.length > 0) {
        const user = userResponse.users[0];
        const username = user.username || `soluser_${fidNumber}`;
        const display_name = user.display_name || user.username || `soluser_${fidNumber}`;
        
        // Upsert profile with real data
        const { error } = await supabase
          .from('profiles')
          .upsert([{ fid: fidNumber, username, display_name }], { onConflict: 'fid' });
        
        if (error) {
          console.error(`Error upserting profile for fid ${fidNumber}:`, error);
          return new Response(JSON.stringify({ 
            error: `Error upserting profile: ${error.message}`,
            status: 'error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`Successfully synced real profile for fid ${fidNumber}: ${username} (${display_name})`);
          return new Response(JSON.stringify({ 
            status: 'success',
            fid: fidNumber,
            username,
            display_name
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        // Fallback to generated username if no real data found
        const username = `soluser_${fidNumber}`;
        const display_name = `soluser_${fidNumber}`;
        
        const { error } = await supabase
          .from('profiles')
          .upsert([{ fid: fidNumber, username, display_name }], { onConflict: 'fid' });
        
        if (error) {
          console.error(`Error upserting fallback profile for fid ${fidNumber}:`, error);
          return new Response(JSON.stringify({ 
            error: `Error upserting fallback profile: ${error.message}`,
            status: 'error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`Successfully synced fallback profile for fid ${fidNumber}`);
          return new Response(JSON.stringify({ 
            status: 'success_fallback',
            fid: fidNumber,
            username,
            display_name
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching Farcaster data for fid ${fidNumber}:`, error);
      
      // Fallback to generated username on error
      const username = `soluser_${fidNumber}`;
      const display_name = `soluser_${fidNumber}`;
      
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert([{ fid: fidNumber, username, display_name }], { onConflict: 'fid' });
      
      if (upsertError) {
        console.error(`Error upserting fallback profile for fid ${fidNumber}:`, upsertError);
        return new Response(JSON.stringify({ 
          error: `Error upserting fallback profile: ${upsertError.message}`,
          status: 'error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        console.log(`Successfully synced fallback profile for fid ${fidNumber} after API error`);
        return new Response(JSON.stringify({ 
          status: 'success_fallback',
          fid: fidNumber,
          username,
          display_name
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('Error in single profile sync:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST() {
  try {
    const supabase = createServiceRoleClient();
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    
    if (!neynarApiKey) {
      return new Response(JSON.stringify({ 
        error: 'NEYNAR_API_KEY environment variable is required' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const neynarClient = new NeynarAPIClient({ apiKey: neynarApiKey });

    // Get all unique user_fid from journal_entries
    const { data: entryFids, error: entryError } = await supabase
      .from('journal_entries')
      .select('user_fid');
    if (entryError) {
      return new Response(JSON.stringify({ error: `Error fetching journal_entries: ${entryError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all unique user_fid from journal_shares
    const { data: shareFids, error: shareError } = await supabase
      .from('journal_shares')
      .select('user_fid');
    if (shareError) {
      return new Response(JSON.stringify({ error: `Error fetching journal_shares: ${shareError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Combine and dedupe
    const allFids = new Set([
      ...entryFids.map(e => e.user_fid),
      ...shareFids.map(s => s.user_fid),
    ].filter(Boolean));

    const results: Array<{ fid: number; status: string; message?: string; username?: string; display_name?: string }> = [];
    
    // Fetch all users in bulk
    try {
      const fidsArray = Array.from(allFids);
      const userResponse = await neynarClient.fetchBulkUsers({ fids: fidsArray });
      
      if (userResponse && userResponse.users) {
        // Create a map of FID to user data
        const userMap = new Map();
        userResponse.users.forEach(user => {
          if (user.fid) {
            userMap.set(user.fid, user);
          }
        });
        
        // Process each FID
        for (const fid of allFids) {
          const user = userMap.get(fid);
          
          if (user) {
            const username = user.username || `soluser_${fid}`;
            const display_name = user.display_name || user.username || `soluser_${fid}`;
            
            // Upsert profile with real data
            const { error } = await supabase
              .from('profiles')
              .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
            
            if (error) {
              console.error(`Error upserting profile for fid ${fid}:`, error);
              results.push({ fid, status: 'error', message: error.message });
            } else {
              console.log(`Successfully synced real profile for fid ${fid}: ${username} (${display_name})`);
              results.push({ fid, status: 'success', username, display_name });
            }
          } else {
            // Fallback to generated username if no real data found
            const username = `soluser_${fid}`;
            const display_name = `soluser_${fid}`;
            
            const { error } = await supabase
              .from('profiles')
              .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
            
            if (error) {
              console.error(`Error upserting fallback profile for fid ${fid}:`, error);
              results.push({ fid, status: 'error', message: error.message });
            } else {
              console.log(`Successfully synced fallback profile for fid ${fid}`);
              results.push({ fid, status: 'success_fallback', username, display_name });
            }
          }
        }
      } else {
        // Fallback to generated usernames if bulk fetch fails
        for (const fid of allFids) {
          const username = `soluser_${fid}`;
          const display_name = `soluser_${fid}`;
          
          const { error } = await supabase
            .from('profiles')
            .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
          
          if (error) {
            console.error(`Error upserting fallback profile for fid ${fid}:`, error);
            results.push({ fid, status: 'error', message: error.message });
          } else {
            console.log(`Successfully synced fallback profile for fid ${fid}`);
            results.push({ fid, status: 'success_fallback', username, display_name });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Farcaster data:', error);
      
      // Fallback to generated usernames on error
      for (const fid of allFids) {
        const username = `soluser_${fid}`;
        const display_name = `soluser_${fid}`;
        
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
        
        if (upsertError) {
          console.error(`Error upserting fallback profile for fid ${fid}:`, upsertError);
          results.push({ fid, status: 'error', message: upsertError.message });
        } else {
          console.log(`Successfully synced fallback profile for fid ${fid} after API error`);
          results.push({ fid, status: 'success_fallback', username, display_name });
        }
      }
    }

    return new Response(JSON.stringify({
      message: 'Profile sync complete',
      totalFids: allFids.size,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in profile sync:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 