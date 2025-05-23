import React from "react";
import { motion } from "framer-motion";

interface MilestoneCardProps {
  number?: string | number; // e.g., 12345 or "Winter Solstice"
  label: string; // e.g., "Palindrome Day", "Solar Return"
  emoji?: string; // e.g., "🌞", "🔢", "👼"
  description?: string; // e.g., "A rare sequential day count!"
  daysToMilestone?: number;
  milestoneDate?: string;
  highlight?: boolean; // for the next immediate milestone
  variant?: "bookmark" | "results";
}

const bgImages = {
  bookmark: "/milestoneCard_Bookmark.png",
  results: "/milestoneCard_Results.png",
};

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  number,
  label,
  emoji,
  description,
  daysToMilestone,
  milestoneDate,
  highlight = false,
  variant = "results",
}) => {
  // Custom styles for bookmark variant
  const isBookmark = variant === "bookmark";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden bg-white/80 dark:bg-neutral-900 border border-gray-400 dark:border-gray-600 ${isBookmark ? "px-2 py-6" : "px-4 py-6"} text-xs font-mono text-gray-800 dark:text-gray-100 rounded-none w-full text-center shadow ${highlight ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}`}
      style={{ marginBottom: '0.5rem', minHeight: isBookmark ? '140px' : '140px' }}
    >
      {/* Decorative background sun illustration */}
      {variant !== "bookmark" && (
        <>
          {/* Show image only in light mode */}
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            src={bgImages[variant]}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 dark:hidden ${isBookmark ? 'object-[center_60%]' : ''}`}
            draggable="false"
          />
        </>
      )}
      {/* Card content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={`relative z-10 flex flex-col items-center justify-center h-full ${isBookmark ? "leading-tight" : ""}`}
      >
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={
            isBookmark
              ? "flex items-center justify-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-center"
              : "flex items-center justify-center gap-2 mb-1 font-semibold uppercase tracking-widest text-xs"
          }
        >
          {emoji && <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
            className="text-lg" 
            role="img" 
            aria-label={label}
          >
            {emoji}
          </motion.span>}
          <span>{label}</span>
        </motion.div>
        {number && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
            className={
              isBookmark
                ? "text-3xl font-extrabold font-serif tracking-tight text-gray-900 dark:text-white mb-1 leading-none"
                : "text-3xl font-extrabold font-serif tracking-tight text-gray-900 dark:text-white mb-1"
            }
          >
            {number}
          </motion.div>
        )}
        {/* Days to milestone and date, styled as in the mockup */}
        {typeof daysToMilestone === 'number' && milestoneDate && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className={
              isBookmark
                ? "text-base font-mono text-gray-900 dark:text-white font-normal mb-1 text-center"
                : "text-base font-mono text-gray-900 dark:text-white font-bold mb-1"
            }
          >
            <span className="font-bold">{daysToMilestone} days</span> (<span className="font-normal">{milestoneDate}</span>)
          </motion.div>
        )}
        {description && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className={
              isBookmark
                ? "text-xs text-gray-700 dark:text-gray-400 italic mt-1 text-center"
                : "text-xs text-gray-700 dark:text-gray-400 italic mt-1"
            }
          >
            {description}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MilestoneCard; 