"use client";

interface SharedEntry {
  id: string;
  content: string;
  sol_day: number;
  created_at: string;
  user_fid: number;
}

interface SharedEntryViewerProps {
  entry: SharedEntry;
  authorFid: number;
}

export function SharedEntryViewer({ entry, authorFid }: SharedEntryViewerProps) {
  const date = entry?.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  console.log('SharedEntryViewer rendering with:', { entry, authorFid });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <div className="mb-4">
            <h1 className="text-white text-xl font-bold">
              Sol Day {entry.sol_day} Journal Entry
            </h1>
            <p className="text-gray-300 text-sm">
              Shared by @{authorFid} • {date}
            </p>
          </div>
          <div className="mb-6">
            <p className="text-white leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
          <div className="pt-6 border-t border-white/20">
            <button 
              onClick={() => window.history.back()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 