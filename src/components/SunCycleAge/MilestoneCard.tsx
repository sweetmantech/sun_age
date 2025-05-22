import React from "react";

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
    <div
      className={`relative overflow-hidden bg-white/80 dark:bg-neutral-900/80 border border-gray-400 dark:border-gray-700 ${isBookmark ? "px-2 py-6" : "px-4 py-6"} text-xs font-mono text-gray-800 dark:text-gray-100 rounded-none w-full text-center shadow ${highlight ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}`}
      style={{ marginBottom: '0.5rem', minHeight: isBookmark ? '140px' : '140px' }}
    >
      {/* Decorative background sun illustration */}
      <img
        src={bgImages[variant]}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none select-none z-0 ${isBookmark ? 'object-[center_60%]' : ''}`}
        draggable="false"
      />
      {/* Card content */}
      <div className={`relative z-10 flex flex-col items-center justify-center h-full ${isBookmark ? "leading-tight" : ""}`}>
        <div
          className={
            isBookmark
              ? "flex items-center justify-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-center"
              : "flex items-center justify-center gap-2 mb-1 font-semibold uppercase tracking-widest text-xs"
          }
        >
          {emoji && <span className="text-lg" role="img" aria-label={label}>{emoji}</span>}
          <span>{label}</span>
        </div>
        {number && (
          <div
            className={
              isBookmark
                ? "text-3xl font-extrabold font-serif tracking-tight text-gray-900 dark:text-white mb-1 leading-none"
                : "text-3xl font-extrabold font-serif tracking-tight text-gray-900 dark:text-white mb-1"
            }
          >
            {number}
          </div>
        )}
        {/* Days to milestone and date, styled as in the mockup */}
        {typeof daysToMilestone === 'number' && milestoneDate && (
          <div
            className={
              isBookmark
                ? "text-base font-mono text-gray-900 dark:text-white font-normal mb-1 text-center"
                : "text-base font-mono text-gray-900 dark:text-white font-bold mb-1"
            }
          >
            <span className="font-bold">{daysToMilestone} days</span> (<span className="font-normal">{milestoneDate}</span>)
          </div>
        )}
        {description && (
          <div
            className={
              isBookmark
                ? "text-xs text-gray-700 dark:text-gray-400 italic mt-1 text-center"
                : "text-xs text-gray-700 dark:text-gray-400 italic mt-1"
            }
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard; 