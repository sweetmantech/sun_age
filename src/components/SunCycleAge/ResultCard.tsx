import React, { useRef } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { toPng } from "html-to-image";
import ResultCardExport from "./ResultCardExport";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { createRoot } from "react-dom/client";
import Header from "./Header";

interface ResultCardProps {
  days: number;
  approxYears: number;
  nextMilestone: number | null;
  daysToMilestone: number | null;
  milestoneDate: string | null;
  quote: string;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  onShare: () => void;
  isSharing: boolean;
  onRecalculate: () => void;
  bookmark: any;
  handleBookmark: () => void;
  formattedDate: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  days,
  approxYears,
  nextMilestone,
  daysToMilestone,
  milestoneDate,
  quote,
  showDetails,
  setShowDetails,
  onShare,
  isSharing,
  onRecalculate,
  bookmark,
  handleBookmark,
  formattedDate,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { context } = useFrameSDK();
  const displayName = context?.user?.displayName;

  const handleSaveImage = async () => {
    // Create a container for the export card
    const exportContainer = document.createElement("div");
    exportContainer.style.position = "absolute";
    exportContainer.style.left = "-9999px";
    exportContainer.style.top = "0";
    document.body.appendChild(exportContainer);

    // Render the export card into the container
    const exportCard = (
      <ResultCardExport
        days={days}
        approxYears={approxYears}
        nextMilestone={nextMilestone}
        daysToMilestone={daysToMilestone}
        milestoneDate={milestoneDate}
        quote={quote}
        displayName={displayName}
      />
    );
    // Use ReactDOM to render
    const root = createRoot(exportContainer);
    root.render(exportCard);
    setTimeout(async () => {
      try {
        if (exportContainer.firstChild && exportContainer.firstChild instanceof HTMLElement) {
          const dataUrl = await toPng(exportContainer.firstChild, { cacheBust: true, backgroundColor: "#fffbe6" });
          const link = document.createElement("a");
          link.download = "sun-cycle-bookmark.png";
          link.href = dataUrl;
          link.click();
        }
      } finally {
        root.unmount();
        document.body.removeChild(exportContainer);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-2 sm:px-0">
      {/* Results Card Box */}
      <div ref={cardRef} className="bg-[rgba(255,252,242,0.3)] dark:bg-[rgba(24,24,28,0.3)] border border-gray-200 dark:border-gray-700 rounded-none shadow p-8 max-w-md w-full flex flex-col items-center space-y-6 relative mt-0">
        {/* Sun image */}
        <Image
          src="/sunsun.png"
          alt="Sun"
          width={72}
          height={72}
          className="w-20 h-20 object-contain mx-auto mb-2"
          style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
          priority
        />
        {/* Story intro */}
        <div className="text-xs font-mono tracking-widest text-gray-500 dark:text-gray-300 text-center uppercase mb-2">DEAR TRAVELER, YOU HAVE</div>
        <div className="text-5xl font-serif font-extrabold tracking-tight text-gray-800 dark:text-white text-center mb-1">{days}</div>
        <div className="text-sm font-mono text-gray-500 dark:text-gray-400 text-center mb-2">SOLAR ROTATIONS</div>
        <div className="text-lg font-serif text-gray-700 dark:text-gray-300 text-center mb-2">~ {approxYears} years old</div>
        {/* Milestone box */}
        {nextMilestone && daysToMilestone !== null && milestoneDate && (
          <div className="w-full flex justify-center mb-2">
            <div className="bg-white/80 dark:bg-neutral-900/80 border border-gray-400 dark:border-gray-700 px-4 py-3 text-center text-xs font-mono text-gray-800 dark:text-gray-100 rounded-none max-w-xs mx-auto">
              <span className="font-semibold">Solar Return <span role='img' aria-label='sun'>🌞</span></span><br />
              Your next milestone: <span className="font-bold">{nextMilestone}</span> rotations<br />
              in <span className="font-bold">{daysToMilestone}</span> days ({milestoneDate})
            </div>
          </div>
        )}
        {/* Randomized quote */}
        <div className="mt-2 text-xs font-sans text-gray-400 italic text-center">{quote}</div>
      </div>
      {/* Main CTA buttons outside the card */}
      <div className="flex w-full max-w-md gap-2 mt-6">
        <button
          onClick={onShare}
          disabled={isSharing}
          className="flex-1 border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-3 px-2 text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
        >
          {isSharing ? "SHARING..." : "SHARE SOL AGE"}
        </button>
        <button
          onClick={onRecalculate}
          className="flex-1 border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-3 px-2 text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
        >
          CALCULATE AGAIN
        </button>
      </div>
      {/* Bookmark button */}
      {!bookmark && (
        <button
          onClick={handleBookmark}
          className="w-full max-w-md bg-black dark:bg-white text-white dark:text-black uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-900 dark:hover:bg-gray-100 rounded-none mt-4"
        >
          BOOKMARK MY SOL AGE
        </button>
      )}
    </div>
  );
};

export default ResultCard; 