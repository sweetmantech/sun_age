import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  // Parse the ID as URL-encoded parameters
  try {
    const decodedId = decodeURIComponent(id);
    const params = new URLSearchParams(decodedId);
    
    const solAge = params.get('solAge');
    const archetype = params.get('archetype') || 'Solar Being';
    const quote = params.get('quote') || '';
    
    if (!solAge) {
      return {
        title: 'Sol Age - Solara',
        description: 'Discover your cosmic age and archetype on Solara',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.solara.fyi';
    const ogImageUrl = `${baseUrl}/api/og/solage/${id}`;
    
    // Create the fc:frame metadata for proper mini app embedding
    const frameData = {
      version: "next",
      imageUrl: ogImageUrl,
      button: {
        title: "🌞 Discover Your Sol Age",
        action: {
          type: "launch_frame",
          url: `${baseUrl}/solage/shared/${id}`,
          name: "Solara",
          splashImageUrl: `${baseUrl}/logo.png`,
          splashBackgroundColor: "#FDF8EC"
        }
      }
    };

    const title = `A ${archetype} with ${solAge} days around the sun - Solara`;
    const description = quote || `Discover your cosmic age and archetype on Solara. This ${archetype} is ${solAge} days old around the sun.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [ogImageUrl],
      },
      other: {
        'fc:frame': JSON.stringify(frameData),
      },
    };
  } catch (error) {
    return {
      title: 'Sol Age - Solara',
      description: 'Discover your cosmic age and archetype on Solara',
    };
  }
}

export default async function SharedSolAgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Parse the ID as URL-encoded parameters
  try {
    const decodedId = decodeURIComponent(id);
    const urlParams = new URLSearchParams(decodedId);
    
    const solAge = urlParams.get('solAge');
    const archetype = urlParams.get('archetype') || 'Solar Being';
    const quote = urlParams.get('quote') || '';
    
    if (!solAge) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-[#FDF8EC] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border border-gray-200 p-8">
          <div className="text-center">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#D4AF37] mb-4 tracking-wider">SOLARA</h1>
              <div className="flex items-center justify-center gap-4 text-2xl font-mono mb-2">
                <span>SOL {solAge}</span>
                <span className="text-gray-500 text-xl">
                  {Math.floor(parseInt(solAge) / 365.25)} years
                </span>
              </div>
            </div>

            {/* Archetype */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{archetype}</h2>
            </div>

            {/* Quote */}
            {quote && (
              <div className="mb-8">
                <blockquote className="text-xl italic text-gray-700 leading-relaxed">
                  &quot;{quote}&quot;
                </blockquote>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12">
              <a
                href="https://www.solara.fyi"
                className="inline-block bg-[#D4AF37] text-black font-mono px-8 py-3 border border-black hover:bg-[#E6C75A] transition-colors"
              >
                DISCOVER YOUR SOL AGE
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 