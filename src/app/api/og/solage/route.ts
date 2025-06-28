import { ImageResponse } from '@vercel/og';
import React from 'react';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userName = searchParams.get('userName') || 'Traveller';
    const solAge = searchParams.get('solAge') || '0';
    const birthDate = searchParams.get('birthDate') || 'YYYY-MM-DD';
    const age = searchParams.get('age') || '0';
    const hasProfilePic = searchParams.has('profilePicUrl');

    // Determine the base URL for fetching assets
    const baseUrl = req.headers.get('host')
      ? `http://${req.headers.get('host')}`
      : 'http://localhost:3000';

    // Use absolute URLs for all images
    const profilePicUrl = searchParams.get('profilePicUrl');
    const sunUrl = `${baseUrl}/sunsun.png`;
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
            background: '#FDF3C0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            fontFamily: 'monospace, sans-serif',
          },
        },
        // Profile Picture Circle - Only render if profilePicUrl is present
        hasProfilePic && React.createElement(
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
              border: '4px solid #E6C75A',
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
        // Sun faces
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              left: 60,
              top: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
          React.createElement('img', {
            src: sunUrl,
            alt: 'Sun',
            width: 100,
            height: 100,
          })
        ),
        React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              right: 60,
              top: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
          React.createElement('img', {
            src: sunUrl,
            alt: 'Sun',
            width: 100,
            height: 100,
          })
        ),
        // Main Content
        React.createElement(
          'div',
          {
            style: {
              marginTop: hasProfilePic ? 200 : 100,
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                fontFamily: 'monospace',
                fontSize: 32,
                color: '#555',
                letterSpacing: 2,
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'center'
              },
            },
            `DEAR ${userName === 'SolaraUser' ? 'TRAVELLER' : userName.toUpperCase()}, YOU HAVE MADE`
          ),
          React.createElement(
            'div',
            {
              style: {
                fontFamily: gtAlpinaFont ? 'GT Alpina, Georgia, serif' : 'Georgia, serif',
                fontSize: 120,
                fontWeight: 600,
                color: '#222',
                margin: '24px 0',
                display: 'flex',
                justifyContent: 'center'
              },
            },
            solAge
          ),
          React.createElement(
            'div',
            {
              style: {
                fontFamily: 'monospace',
                fontSize: 32,
                color: '#555',
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'center'
              },
            },
            `SOLAR ROTATIONS SINCE ${birthDate}`
          ),
          React.createElement(
            'div',
            {
              style: {
                fontFamily: 'monospace',
                fontSize: 32,
                color: '#555',
                marginBottom: 32,
                display: 'flex',
                justifyContent: 'center'
              },
            },
            `~${age} years old`
          )
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
    console.error('[OG IMAGE] Error generating solage image:', err);
    return new Response(`OG image error: ${err.message}`, { status: 500 });
  }
} 