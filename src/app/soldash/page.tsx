"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCard } from "../../components/SunCycleAge";
import { getNextMilestone, getNextNumericalMilestones, getNextMilestoneByType } from "../../lib/milestones";
import MilestoneCard from "../../components/SunCycleAge/MilestoneCard";
import { Dialog as RadixDialog, DialogContent, DialogTitle, DialogClose, DialogOverlay } from "../../components/ui/dialog";

// Bookmark type
interface Bookmark {
  days: number;
  approxYears: number;
  birthDate: string;
  lastVisitDays?: number;
  lastVisitDate?: string;
}

export default function SolDashPage() {
  const router = useRouter();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sunCycleBookmark");
    if (saved) {
      try {
        setBookmark(JSON.parse(saved));
      } catch {}
    }
  }, []);

  if (!bookmark) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No bookmark found. Calculate your Sol Age first!</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Calculator
          </button>
        </div>
      </div>
    );
  }

  // Calculate milestones and other props
  const milestone = getNextMilestone(bookmark.days, new Date(bookmark.birthDate));
  const daysToMilestone = milestone ? milestone.daysToMilestone : 0;
  const milestoneDate = milestone ? milestone.milestoneDate : "";
  const nextNumericalMilestones = getNextNumericalMilestones(bookmark.days, new Date(bookmark.birthDate), 10);

  // Construct the milestoneCard element for the next milestone
  const milestoneCard = milestone ? (
    <MilestoneCard
      number={milestone.cycles}
      label={milestone.label}
      emoji={milestone.emoji}
      description={milestone.description}
      daysToMilestone={milestone.daysToMilestone}
      milestoneDate={milestone.milestoneDate}
      variant="bookmark"
    />
  ) : null;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white relative">
      <div className="w-full flex flex-col items-center justify-center" style={{ background: 'rgba(255,252,242,0.5)', borderTop: '1px solid #9CA3AF', borderBottom: '1px solid #9CA3AF' }}>
        <div className="max-w-md mx-auto w-full px-6 pt-8 pb-8 min-h-[60vh]">
          <BookmarkCard
            bookmark={bookmark}
            milestone={milestone?.cycles}
            milestoneDate={milestoneDate}
            daysToMilestone={daysToMilestone}
            onRecalculate={() => router.push("/")}
            onClear={() => {
              localStorage.removeItem("sunCycleBookmark");
              setBookmark(null);
            }}
            isRecalculating={isRecalculating}
            sinceLastVisit={bookmark.lastVisitDays ? bookmark.days - bookmark.lastVisitDays : 0}
            milestoneCard={milestoneCard}
            showMilestoneModal={showMilestoneModal}
            setShowMilestoneModal={setShowMilestoneModal}
            nextNumericalMilestones={nextNumericalMilestones}
            onShare={() => {
              setIsSharing(true);
              const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
              const message = `Forget birthdays—I've completed ${bookmark.days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}`;
              window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`;
              setTimeout(() => setIsSharing(false), 1000);
            }}
            isSharing={isSharing}
            initialTab={"sol-age"}
          />
        </div>
      </div>
      {/* Actions Section - outside main container, full width */}
      <div className="w-full flex flex-col items-center mt-6 mb-2 px-0">
        <div className="max-w-md w-full px-6">
          <div className="flex w-full gap-2">
            <button
              onClick={() => {
                setIsSharing(true);
                const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
                const message = `Forget birthdays—I've completed ${bookmark.days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}`;
                window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`;
                setTimeout(() => setIsSharing(false), 1000);
              }}
              disabled={isSharing}
              className="flex-1 border border-black bg-transparent text-black uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-gray-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? "SHARING..." : "SHARE SOL AGE"}
            </button>
            <button
              onClick={() => router.push("/")}
              disabled={isRecalculating}
              className="flex-1 border border-black bg-transparent text-black uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-gray-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecalculating ? "RECALCULATING..." : "RECALCULATE"}
            </button>
          </div>
          <button
            onClick={() => setShowConfirmClear(true)}
            className="w-full border border-red-800 bg-red-600 text-white uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-red-700 rounded-none mt-4 mb-6"
          >
            CLEAR BOOKMARK
          </button>
        </div>
      </div>
      {/* Footer - same as main page */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-12">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">sirsu</a>
          </div>
        </div>
      </footer>

      {/* Confirm Clear Modal */}
      <RadixDialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
        <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
        <DialogContent className="max-w-xs w-full p-6 bg-white border border-gray-300 rounded-none shadow-lg flex flex-col items-center">
          <DialogTitle className="text-lg font-bold mb-4 text-center">Are you sure you want to clear your bookmark?</DialogTitle>
          <div className="flex gap-4 w-full mt-2">
            <button
              className="flex-1 border border-gray-400 bg-white text-black font-mono uppercase tracking-widest py-2 px-2 text-sm hover:bg-gray-100 rounded-none"
              onClick={() => setShowConfirmClear(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 border border-red-800 bg-red-600 text-white font-mono uppercase tracking-widest py-2 px-2 text-sm hover:bg-red-700 rounded-none"
              onClick={() => {
                localStorage.removeItem("sunCycleBookmark");
                setBookmark(null);
                setShowConfirmClear(false);
                router.push("/");
              }}
            >
              Clear
            </button>
          </div>
        </DialogContent>
      </RadixDialog>
    </div>
  );
} 