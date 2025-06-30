import { ImageResponse } from '@vercel/og';
import React from 'react';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const solAge = searchParams.get('solAge') || '0';
    const archetype = searchParams.get('archetype') || 'Sol Seeker';
    const quote = searchParams.get('quote') || 'I am a seeker of solar wisdom';

    // More reliable baseUrl construction
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.solara.fyi';
    console.log('[OG IMAGE] Using baseUrl:', baseUrl);

    // Try to load the fonts from the public directory
    let gtAlpinaFont: ArrayBuffer | null = null;
    let gtAlpinaItalicFont: ArrayBuffer | null = null;
    
    try {
      const fontUrl = `${baseUrl}/fonts/GT-Alpina.ttf`;
      const italicFontUrl = `${baseUrl}/fonts/GT-Alpina-Standard-Regular-Italic-Trial.otf`;
      console.log('[OG IMAGE] Attempting to load fonts from:', fontUrl, italicFontUrl);
      
      const [fontRes, italicFontRes] = await Promise.all([
        fetch(fontUrl),
        fetch(italicFontUrl)
      ]);
      
      if (fontRes.ok) {
        gtAlpinaFont = await fontRes.arrayBuffer();
        console.log('[OG IMAGE] Regular font loaded successfully, size:', gtAlpinaFont.byteLength);
      } else {
        console.log('[OG IMAGE] Regular font fetch failed with status:', fontRes.status);
      }
      
      if (italicFontRes.ok) {
        gtAlpinaItalicFont = await italicFontRes.arrayBuffer();
        console.log('[OG IMAGE] Italic font loaded successfully, size:', gtAlpinaItalicFont.byteLength);
      } else {
        console.log('[OG IMAGE] Italic font fetch failed with status:', italicFontRes.status);
      }
    } catch (e) {
      console.error('[OG IMAGE] Font loading error:', e);
    }

    const fontConfig = {
      fonts: [
        ...(gtAlpinaFont ? [{
          name: 'GT Alpina',
          data: gtAlpinaFont,
          style: 'normal' as const,
          weight: 600 as const,
        }] : []),
        ...(gtAlpinaItalicFont ? [{
          name: 'GT Alpina Italic',
          data: gtAlpinaItalicFont,
          style: 'normal' as const,
          weight: 400 as const,
        }] : []),
      ],
    };

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '1200px',
            height: '630px',
            backgroundImage: `url(${baseUrl}/og-bg.png)`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
            fontFamily: gtAlpinaFont ? 'GT Alpina, Georgia, serif' : 'Georgia, serif',
            overflow: 'hidden',
          },
        },
        [
          // Sol Age (largest, centered)
          React.createElement('div', {
            style: {
              fontSize: 120,
              fontWeight: 700,
              color: '#111',
              marginTop: 90,
              letterSpacing: '-2px',
              lineHeight: 1.1,
              textAlign: 'center',
            },
          }, `${solAge} days`),
          // Archetype row (centered, with Apple sun emoji images)
          React.createElement('div', {
            style: {
              fontSize: 64,
              fontWeight: 700,
              color: '#111',
              marginTop: 18,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 32,
              letterSpacing: '-2px',
            },
          }, [
            React.createElement('img', {
              src: `${baseUrl}/sun-face.png`,
              width: 64,
              height: 64,
              style: { display: 'block' },
            }),
            React.createElement('span', {}, archetype),
            React.createElement('img', {
              src: `${baseUrl}/sun-face.png`,
              width: 64,
              height: 64,
              style: { display: 'block' },
            }),
          ]),
          // Quote (two lines, italic, centered, with GT Alpina Italic font)
          React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: gtAlpinaItalicFont ? 'GT Alpina Italic, Georgia, serif' : 'serif',
              fontSize: 38,
              fontStyle: 'italic',
              color: '#222',
              marginTop: 30,
              marginBottom: 30,
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.2,
              letterSpacing: '-2px',
            },
          }, [
            React.createElement('div', {}, `"${quote.split(' ').slice(0, Math.ceil(quote.split(' ').length / 2)).join(' ')}`),
            React.createElement('div', {}, `${quote.split(' ').slice(Math.ceil(quote.split(' ').length / 2)).join(' ')}"`),
          ]),
          // Spacer to push SOLARA logo to bottom
          React.createElement('div', { style: { flex: 1 } }),
          // SOLARA logo image (bottom center)
          React.createElement('img', {
            src: `${baseUrl}/logo.png`,
            width: 300,
            style: {
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 40,
            },
          }),
        ]
      ),
      {
        width: 1200,
        height: 630,
        ...fontConfig,
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'CDN-Cache-Control': 'public, max-age=0, must-revalidate',
          'Vercel-CDN-Cache-Control': 'public, max-age=0, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('[OG IMAGE] Error generating solage image:', err);
    return new Response(`OG image error: ${err.message}`, { status: 500 });
  }
} 