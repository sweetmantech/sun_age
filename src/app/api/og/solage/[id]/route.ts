import { ImageResponse } from '@vercel/og';
import React from 'react';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    // Extract shareId from the URL path
    const { pathname } = new URL(req.url);
    const match = pathname.match(/\/api\/og\/solage\/([^/]+)/);
    const shareId = match ? match[1] : null;
    console.log('[OG IMAGE] shareId:', shareId);
    
    if (!shareId) {
      console.log('[OG IMAGE] Missing shareId');
      return new Response('Missing shareId', { status: 400 });
    }

    // Parse the ID as URL-encoded parameters
    let solAge: string | null = null;
    let archetype: string = 'Solar Being';
    let quote: string = '';
    
    try {
      const decodedId = decodeURIComponent(shareId);
      const params = new URLSearchParams(decodedId);
      
      solAge = params.get('solAge');
      archetype = params.get('archetype') || 'Solar Being';
      quote = params.get('quote') || '';
      
      console.log('[OG IMAGE] Parsed params:', { solAge, archetype, quote });
    } catch (error) {
      console.error('[OG IMAGE] Error parsing parameters:', error);
      return new Response('Invalid parameters', { status: 400 });
    }

    if (!solAge) {
      console.log('[OG IMAGE] No solAge found, using placeholder data');
      // Return placeholder image
      return new ImageResponse(
        React.createElement(
          'div',
          {
            style: {
              width: '1200px',
              height: '630px',
              background: '#FDF8EC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              fontFamily: 'Georgia, serif',
            },
          },
          [
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: 'Georgia, serif',
                  fontSize: 56,
                  color: '#D4AF37',
                  fontWeight: 600,
                  letterSpacing: 2,
                  textAlign: 'center',
                  marginBottom: 12,
                },
              },
              'SOLARA'
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: 'monospace',
                  fontSize: 32,
                  color: '#222',
                  letterSpacing: 2,
                  textAlign: 'center',
                },
              },
              'Discover Your Sol Age'
            ),
          ]
        ),
        { width: 1200, height: 630 }
      );
    }

    // Font loading (fix for localhost)
    let gtAlpinaFont: ArrayBuffer | null = null;
    let gtAlpinaItalicFont: ArrayBuffer | null = null;
    try {
      let baseUrl = req.headers.get('host')?.startsWith('localhost')
        ? `http://localhost:3000`
        : `https://${req.headers.get('host')}`;
      const fontUrl = `${baseUrl}/fonts/GT-Alpina.ttf`;
      const italicFontUrl = `${baseUrl}/fonts/GT-Alpina-Standard-Regular-Italic-Trial.otf`;
      const fontRes = await fetch(fontUrl);
      if (fontRes.ok) {
        gtAlpinaFont = await fontRes.arrayBuffer();
      }
      const italicFontRes = await fetch(italicFontUrl);
      if (italicFontRes.ok) {
        gtAlpinaItalicFont = await italicFontRes.arrayBuffer();
      }
    } catch (e) {
      console.error('[OG IMAGE] Font loading error:', e);
    }

    console.log('[OG IMAGE] Generating image with:', { 
      solAge, 
      archetype, 
      quote, 
      hasFont: !!gtAlpinaFont 
    });

    const fontConfig = {
      fonts: [
        gtAlpinaFont && {
          name: 'GT Alpina',
          data: gtAlpinaFont,
          style: 'normal' as const,
          weight: 400 as const,
        },
        gtAlpinaItalicFont && {
          name: 'GT Alpina Italic',
          data: gtAlpinaItalicFont,
          style: 'italic' as const,
          weight: 400 as const,
        },
      ].filter(Boolean) as {
        name: string;
        data: ArrayBuffer;
        style: 'normal' | 'italic';
        weight: 400;
      }[],
    };

    // Asset URLs
    let baseUrl = req.headers.get('host')?.startsWith('localhost')
      ? `http://localhost:3000`
      : `https://${req.headers.get('host')}`;
    const bgUrl = `${baseUrl}/og-bg.png`;
    const logoUrl = `${baseUrl}/logo.png`;
    const sunFaceUrl = `${baseUrl}/sun-face.png`;

    // Insert a line break in the quote after the last space before 28-30 characters
    function breakQuoteLine(q: string) {
      if (!q) return q;
      if (q.length <= 30) return q;
      // Find the last space before 30 chars
      const breakIdx = q.lastIndexOf(' ', 30);
      if (breakIdx === -1) return q; // no space found, don't break
      return q.slice(0, breakIdx) + '\n' + q.slice(breakIdx + 1);
    }

    // Compose OG image using React.createElement
    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '1200px',
            height: '630px',
            background: '#FDF8EC', // fallback color
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            fontFamily: gtAlpinaFont ? 'GT Alpina, Georgia, serif' : 'Georgia, serif',
            overflow: 'hidden',
          },
        },
        [
          // Background image as absolute layer
          React.createElement('img', {
            src: bgUrl,
            width: 1200,
            height: 630,
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1200px',
              height: '630px',
              objectFit: 'cover',
              zIndex: 0,
            },
            alt: 'background',
          }),
          // Main content wrapper
          React.createElement(
            'div',
            {
              style: {
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
            [
              // Days (solAge)
              React.createElement(
                'div',
                {
                  style: {
                    fontFamily: 'GT Alpina, Georgia, serif',
                    fontSize: 143,
                    color: '#222',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    textAlign: 'center',
                    marginBottom: 12,
                  },
                },
                `${solAge} days`
              ),
              // Archetype with sun emojis (left and right)
              React.createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 18,
                    marginBottom: 36,
                  },
                },
                [
                  React.createElement('img', {
                    src: sunFaceUrl,
                    width: 64,
                    height: 64,
                    style: { objectFit: 'contain' },
                    alt: 'sun',
                  }),
                  React.createElement(
                    'div',
                    {
                      style: {
                        fontFamily: 'GT Alpina, Georgia, serif',
                        fontSize: 86,
                        color: '#222',
                        fontWeight: 600,
                        textAlign: 'center',
                        letterSpacing: '-0.02em',
                      },
                    },
                    archetype
                  ),
                  React.createElement('img', {
                    src: sunFaceUrl,
                    width: 64,
                    height: 64,
                    style: { objectFit: 'contain' },
                    alt: 'sun',
                  }),
                ]
              ),
              // Quote (centered, italic, custom font, better spacing)
              quote && React.createElement(
                'div',
                {
                  style: {
                    fontFamily: 'GT Alpina Italic, Georgia, serif',
                    fontSize: 43,
                    color: '#222',
                    textAlign: 'center',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    maxWidth: 700,
                    wordBreak: 'break-word',
                    lineHeight: '37px',
                    margin: '0 auto 64px auto',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'pre-line',
                  },
                },
                breakQuoteLine(quote)
              ),
              // SOLARA logo centered at bottom, gold
              React.createElement('img', {
                src: logoUrl,
                width: 180,
                height: 60,
                style: {
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bottom: 40,
                  objectFit: 'contain',
                  opacity: 0.95,
                },
                alt: 'Solara logo',
              }),
            ]
          ),
        ]
      ),
      {
        width: 1200,
        height: 630,
        ...fontConfig,
      }
    );
  } catch (error) {
    console.error('[OG IMAGE] Error generating image:', error);
    return new Response('Error generating image', { status: 500 });
  }
} 