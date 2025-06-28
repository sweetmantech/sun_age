import { ImageResponse } from '@vercel/og';
import React from 'react';
import { createServiceRoleClient } from '~/utils/supabase/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  // Extract shareId from the URL path
  const { pathname } = new URL(req.url);
  const match = pathname.match(/\/api\/og\/journal\/([^/]+)/);
  const shareId = match ? match[1] : null;
  console.log('[OG IMAGE] shareId:', shareId);
  if (!shareId) {
    console.log('[OG IMAGE] Missing shareId');
    return new Response('Missing shareId', { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Fetch share, entry, and author info
  const { data: share, error: shareError } = await supabase
    .from('journal_shares')
    .select('*, journal_entries(*), user_fid')
    .eq('id', shareId)
    .single();
  console.log('[OG IMAGE] Supabase share:', share, 'error:', shareError);

  // Placeholder data if not found
  const entry = share?.journal_entries || {
    content: 'A cosmic reflection goes here...',
    sol_day: 0,
    created_at: new Date().toISOString(),
  };
  const authorFid = share?.user_fid || 0;
  const authorName = share?.author_name || 'Solara User';
  const authorHandle = share?.author_handle || '@SOLARA';

  // Format date and sol number
  const solNumber = entry.sol_day ? `SOL ${entry.sol_day}` : 'SOL';
  const date = entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';

  // Truncate entry content for preview
  const maxLength = 260;
  let preview = entry.content;
  if (preview.length > maxLength) {
    preview = preview.slice(0, maxLength - 3) + '...';
  }

  // Asset URLs
  const baseUrl = req.headers.get('host') ? `https://${req.headers.get('host')}` : 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logo.svg`;
  const fontUrl = `${baseUrl}/fonts/GT%20Alpina.ttf`;

  let gtAlpinaFont;
  try {
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error('Font fetch failed');
    gtAlpinaFont = await fontRes.arrayBuffer();
    console.log('[OG IMAGE] Font fetch succeeded');
  } catch (e) {
    console.error('[OG IMAGE] Font fetch error:', e);
    // Return a fallback image if font fails
    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '1200px',
            height: '630px',
            background: '#FDF8EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: '#D4AF37',
            fontFamily: 'Garamond, Georgia, Times, serif',
          },
        },
        'Solara Reflection'
      ),
      { width: 1200, height: 630 }
    );
  }

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
          fontFamily: 'GT Alpina, serif',
        },
      },
      [
        // Header
        React.createElement(
          'div',
          {
            style: {
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '48px 60px 0 60px',
            },
          },
          [
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 32,
                  color: '#222',
                  letterSpacing: 2,
                },
              },
              [
                solNumber,
                React.createElement('br'),
                React.createElement(
                  'span',
                  {
                    style: { fontSize: 22, color: '#888', letterSpacing: 2 },
                  },
                  date
                ),
              ]
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontFamily: 'GT Alpina',
                  fontSize: 72,
                  color: '#D4AF37',
                  fontWeight: 600,
                  letterSpacing: 2,
                  textAlign: 'center',
                },
              },
              'SOLARA'
            ),
            React.createElement(
              'div',
              {
                style: {
                  textAlign: 'right',
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 28,
                  color: '#222',
                },
              },
              [
                authorName,
                React.createElement(
                  'span',
                  { style: { fontSize: 28 } },
                  ' 🌞'
                ),
                React.createElement('br'),
                React.createElement(
                  'span',
                  { style: { fontSize: 22, color: '#888' } },
                  authorHandle
                ),
              ]
            ),
          ]
        ),
        // Entry Preview
        React.createElement(
          'div',
          {
            style: {
              margin: '60px 0 0 0',
              fontFamily: 'GT Alpina',
              fontSize: 44,
              color: '#222',
              textAlign: 'center',
              fontWeight: 400,
              maxWidth: 900,
              lineHeight: 1.2,
            },
          },
          preview
        ),
        // CTA
        React.createElement(
          'div',
          { style: { marginTop: 60 } },
          React.createElement(
            'div',
            {
              style: {
                background: '#fff',
                border: '1.5px solid #D4AF37',
                borderRadius: 0,
                padding: '22px 60px',
                fontFamily: 'Geist Mono, monospace',
                fontSize: 32,
                color: '#444',
                letterSpacing: 2,
                fontWeight: 500,
                textAlign: 'center',
                margin: '0 auto',
              },
            },
            'READ FULL REFLECTION ON SOLARA →'
          )
        ),
        // Logo (faint, background)
        React.createElement('img', {
          src: logoUrl,
          alt: 'Solara',
          width: 400,
          height: 100,
          style: {
            position: 'absolute',
            left: '50%',
            bottom: 20,
            transform: 'translateX(-50%)',
            opacity: 0.10,
          },
        }),
      ]
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'GT Alpina',
          data: gtAlpinaFont,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
} 