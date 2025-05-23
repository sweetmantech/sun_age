import React, { useRef } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { toPng } from "html-to-image";
import ResultCardExport from "./ResultCardExport";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { createRoot } from "react-dom/client";
import Header from "./Header";
import { motion, AnimatePresence } from "framer-motion";

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
  milestoneCard?: React.ReactNode;
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
  milestoneCard,
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] w-full px-2 sm:px-0 mb-24"
    >
      {/* Results Card Box */}
      <motion.div 
        ref={cardRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[rgba(255,252,242,0.3)] dark:bg-[rgba(24,24,28,0.3)] border border-gray-200 dark:border-gray-700 rounded-none shadow p-8 max-w-md w-full flex flex-col items-center space-y-6 relative mt-0"
      >
        {/* Sun image with animation */}
        <motion.div
          initial={{ scale: 0.8, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image
            src="/sunsun.png"
            alt="Sun"
            width={72}
            height={72}
            className="w-20 h-20 object-contain mx-auto mb-2"
            style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
            priority
          />
        </motion.div>
        
        {/* Story intro */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-xs font-mono tracking-widest text-gray-500 dark:text-gray-300 text-center uppercase mb-2"
        >
          DEAR TRAVELER, YOU HAVE
        </motion.div>

        {/* Days count with animation */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 100 }}
          className="text-5xl font-serif font-extrabold tracking-tight text-gray-800 dark:text-white text-center mb-1"
        >
          {days}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="text-sm font-mono text-gray-500 dark:text-gray-400 text-center mb-2"
        >
          SOLAR ROTATIONS
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="text-lg font-serif text-gray-700 dark:text-gray-300 text-center mb-2"
        >
          ~ {approxYears} years old
        </motion.div>

        {/* Milestone card with animation */}
        <AnimatePresence>
          {milestoneCard && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="w-full flex justify-center mb-2"
            >
              {milestoneCard}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quote with animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
          className="mt-2 text-xs font-sans text-gray-400 italic text-center"
        >
          {quote}
        </motion.div>
      </motion.div>

      {/* Main CTA buttons with animation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.6 }}
        className="flex w-full max-w-md gap-2 mt-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShare}
          disabled={isSharing}
          className="flex-1 border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-3 px-2 text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
        >
          {isSharing ? "SHARING..." : "SHARE SOL AGE"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRecalculate}
          className="flex-1 border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-3 px-2 text-base transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
        >
          CALCULATE AGAIN
        </motion.button>
      </motion.div>

      {/* Bookmark button with animation */}
      <AnimatePresence>
        {!bookmark && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBookmark}
            transition={{ duration: 0.4, delay: 1.8 }}
            className="w-full max-w-md bg-black dark:bg-white text-white dark:text-black uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-900 dark:hover:bg-gray-100 rounded-none mt-4"
          >
            BOOKMARK MY SOL AGE
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultCard; 