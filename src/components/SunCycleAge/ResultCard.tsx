import React, { useRef } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { toPng } from "html-to-image";
import ResultCardExport from "./ResultCardExport";
import { useFrameSDK } from "~/hooks/useFrameSDK";

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
  onSaveToPhone: () => void;
  onRecalculate: () => void;
  bookmark: any;
  handleBookmark: () => void;
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
  onSaveToPhone,
  onRecalculate,
  bookmark,
  handleBookmark,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { frameContext } = useFrameSDK();
  const displayName = frameContext?.user?.displayName;

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
    // @ts-ignore
    import("react-dom").then(ReactDOM => {
      ReactDOM.render(exportCard, exportContainer);
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
          ReactDOM.unmountComponentAtNode(exportContainer);
          document.body.removeChild(exportContainer);
        }
      }, 100);
    });
  };

  return (
    <div aria-live="polite" className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 transition-opacity duration-500 opacity-100">
      <div ref={cardRef} className="bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center space-y-6 relative bookmark-ui">
        {/* Sun image illustration */}
        {/* Next.js 13+ Image supports className and style. Linter errors here may be a false positive. */}
        <Image
          src="/sunsun.png"
          alt="Sun"
          width={96}
          height={96}
          className="w-24 h-24 object-contain"
          style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
          priority
        />
        <div className="text-5xl font-serif font-extrabold tracking-tight text-gray-800 dark:text-white drop-shadow-lg">{days}</div>
        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">solar rotations</div>
        <div className="text-lg font-serif text-gray-700 dark:text-gray-300">~ {approxYears} years</div>
        {nextMilestone && daysToMilestone !== null && milestoneDate && (
          <div className="mt-2 text-xs font-mono text-blue-700 dark:text-blue-300 text-center">
            Your next milestone: <span className="font-semibold">{nextMilestone}</span> rotations<br />
            in <span className="font-semibold">{daysToMilestone}</span> days ({milestoneDate})
          </div>
        )}
        <div className="mt-4 text-xs font-sans text-gray-400 italic text-center">{quote}</div>

        {/* Learn More Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-xs font-mono text-blue-300 underline underline-offset-2 focus:outline-none hover:text-blue-500"
        >
          {showDetails ? 'Hide Details' : 'Learn More'}
        </button>
        <div
          className={`transition-all duration-500 overflow-hidden w-full ${showDetails ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-gray-900/80 rounded-md p-4 text-xs text-gray-300 space-y-2 font-mono">
            <div>
              <span className="font-semibold text-white">How is this calculated?</span><br />
              <span>Days = Today - Your Birthday<br />Years = Days / 365.25</span>
            </div>
            <div>
              <span className="font-semibold text-white">Astronomy Fact:</span><br />
              <span>{quote}</span>
            </div>
            <div>
              <span className="font-semibold text-white">More Stats:</span><br />
              <span>Total rotations: {days}</span><br />
              <span>Next milestone: {nextMilestone} ({daysToMilestone} days left)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-2 mt-6">
          <button
            onClick={onShare}
            disabled={isSharing}
            className="w-full border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
          >
            {isSharing ? "SHARING..." : "SHARE"}
          </button>
          <button
            onClick={handleSaveImage}
            className="w-full border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
          >
            SAVE TO PHONE
          </button>
          <button
            onClick={onRecalculate}
            className="w-full border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none mt-2"
          >
            CALCULATE AGAIN
          </button>
        </div>

        {/* Bookmark button */}
        {!bookmark && (
          <button
            onClick={handleBookmark}
            className="w-full bg-black dark:bg-white text-white dark:text-black uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-900 dark:hover:bg-gray-100 rounded-none mt-2"
          >
            Bookmark My Sun Age
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultCard; 