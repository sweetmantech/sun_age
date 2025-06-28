import { ImageResponse } from '@vercel/og';
import React from 'react';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userName = searchParams.get('userName') || 'TRAVELLER';
    const fid = searchParams.get('fid') || '...';
    const solAge = searchParams.get('solAge') || '0';
    const currentDate = searchParams.get('currentDate') || '';
    const profilePicUrl = searchParams.get('profilePicUrl');

    // Determine the base URL for fetching assets
    const baseUrl = req.headers.get('host')
      ? `http://${req.headers.get('host')}`
      : 'http://localhost:3000';
    const logoUrl = `${baseUrl}/logo.png`;

    // Try to load the font from the public directory
    let gtAlpinaFont: ArrayBuffer | null = null;
    try {
      const fontUrl = `${baseUrl}/fonts/GT%20Alpina.ttf`;
      console.log('[OG IMAGE] Attempting to load font from:', fontUrl);
      
      const fontRes = await fetch(fontUrl);
      if (fontRes.ok) {
        gtAlpinaFont = await fontRes.arrayBuffer();
        console.log('[OG IMAGE] Font loaded successfully, size:', gtAlpinaFont.byteLength);
      } else {
        console.log('[OG IMAGE] Font fetch failed with status:', fontRes.status);
      }
    } catch (e) {
      console.error('[OG IMAGE] Font loading error:', e);
    }

    const fontConfig = gtAlpinaFont ? {
      fonts: [
        {
          name: 'GT Alpina',
          data: gtAlpinaFont,
          style: 'normal' as const,
          weight: 600 as const,
        },
      ],
    } : {};

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '1200px',
            height: '630px',
            background: '#E6D59A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            fontFamily: 'monospace, sans-serif',
          },
        },
        [
          // Profile Picture Circle - Only render if profilePicUrl is present
          profilePicUrl && React.createElement(
            'div',
            {
              style: {
                position: 'absolute',
                top: 48,
                left: 0,
                right: 0,
                margin: 'auto',
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '3px solid #E6C75A',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              },
            },
            React.createElement('img', {
              src: profilePicUrl,
              alt: 'Profile',
              width: 104,
              height: 104,
              style: { borderRadius: '50%' },
            })
          ),
          // Username
          React.createElement(
            'div',
            {
              style: {
                marginTop: 180,
                fontFamily: 'monospace',
                fontSize: 36,
                color: '#888',
                letterSpacing: 2,
                textAlign: 'center',
                fontWeight: 600,
              },
            },
            `${userName.toUpperCase()} HAS INSCRIBED THIS VOW:`
          ),
          // Vow Text
          React.createElement(
            'div',
            {
              style: {
                margin: '40px 0 0 0',
                fontFamily: gtAlpinaFont ? 'GT Alpina, Georgia, serif' : 'Georgia, serif',
                fontSize: 44,
                color: '#222',
                textAlign: 'center',
                fontWeight: 400,
                maxWidth: 900,
                lineHeight: 1.2,
              },
            },
            `"I inscribe this Solar Vow into eternity: FID ${fid} has completed ${solAge} rotations around our star, sealed by cosmic signature on ${currentDate}."`
          ),
          // SOLARA Logo - partially cut off at bottom
          React.createElement('img', {
            src: logoUrl,
            alt: 'Solara',
            width: 400,
            height: 100,
            style: {
              position: 'absolute',
              left: '50%',
              bottom: -20,
              transform: 'translateX(-50%)',
              opacity: 0.18,
            },
          })
        ]
      ),
      {
        width: 1200,
        height: 630,
        ...fontConfig,
        headers: {
          'Cache-Control': 'public, immutable, no-transform, max-age=300',
        },
      }
    );
  } catch (err: any) {
    console.error('[OG IMAGE] Error generating vow image:', err);
    return new Response(`OG image error: ${err.message}`, { status: 500 });
  }
} 