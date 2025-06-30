import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Helper to decode the [id] param
function decodeShareId(id: string) {
  try {
    const decoded = decodeURIComponent(id);
    const params = new URLSearchParams(decoded);
    const solAge = params.get('solAge');
    const archetype = params.get('archetype');
    const quote = params.get('quote');
    return { solAge, archetype, quote };
  } catch {
    return { solAge: undefined, archetype: undefined, quote: undefined };
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { solAge, archetype, quote } = decodeShareId(params.id);
  if (!solAge) {
    return {
      title: 'Solara - Discover Your Solar Identity',
      description: 'Calculate your Sol Age and discover your cosmic archetype',
    };
  }
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://www.solara.fyi';
  const ogImageUrl = `${appUrl}/api/og/solage?solAge=${encodeURIComponent(solAge)}` +
    (archetype ? `&archetype=${encodeURIComponent(archetype)}` : '') +
    (quote ? `&quote=${encodeURIComponent(quote)}` : '');
  const title = `${solAge} Days - ${archetype || 'Solar Being'} | Solara`;
  const description = quote || `I'm a ${archetype || 'Solar Being'} powered by ${solAge} days of pure sunlight ☀️`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/share/${encodeURIComponent(params.id)}`,
      siteName: 'Solara',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${solAge} Days - ${archetype || 'Solar Being'}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ShareDynamicPage({ params }: { params: { id: string } }) {
  const { solAge, archetype, quote } = decodeShareId(params.id);
  if (!solAge) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl font-serif font-bold text-black">
          {solAge} days
        </div>
        <div className="text-2xl font-mono text-gray-600 uppercase tracking-widest">
          {archetype || 'Solar Being'}
        </div>
        {quote && (
          <div className="text-lg font-serif italic text-gray-700 max-w-md mx-auto">
            &quot;{quote}&quot;
          </div>
        )}
        <div className="pt-8">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black hover:bg-[#e6c75a] transition-colors"
          >
            Calculate Your Sol Age
          </Link>
        </div>
      </div>
    </div>
  );
} 