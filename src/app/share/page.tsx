import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Safely extract string values from searchParams
function getStringParam(param: string | string[] | undefined): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0];
  return undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const solAge = getStringParam(resolvedSearchParams.solAge);
  const archetype = getStringParam(resolvedSearchParams.archetype);
  const quote = getStringParam(resolvedSearchParams.quote);

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

  // Create the fc:frame metadata for proper mini app embedding
  const frameData = {
    version: "1",
    imageUrl: ogImageUrl,
    button: {
      title: "🌞 Calculate Your Sol Age",
      action: {
        type: "launch_frame",
        url: `${appUrl}/`,
        name: "Solara",
        splashImageUrl: `${appUrl}/logo.png`,
        splashBackgroundColor: "#FDF8EC"
      }
    }
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/share?solAge=${encodeURIComponent(solAge)}&archetype=${encodeURIComponent(archetype || '')}&quote=${encodeURIComponent(quote || '')}`,
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
    other: {
      'fc:frame': JSON.stringify(frameData),
    },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const solAge = getStringParam(resolvedSearchParams.solAge);
  const archetype = getStringParam(resolvedSearchParams.archetype);
  const quote = getStringParam(resolvedSearchParams.quote);

  if (!solAge) {
    redirect('/');
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