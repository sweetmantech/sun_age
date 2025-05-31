"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCard } from "../../components/SunCycleAge";
import { getNextMilestone, getNextNumericalMilestones, getNextMilestoneByType } from "../../lib/milestones";
import MilestoneCard from "../../components/SunCycleAge/MilestoneCard";
import { Dialog as RadixDialog, DialogContent, DialogTitle, DialogClose, DialogOverlay } from "../../components/ui/dialog";
import { useSolarPledge } from "../../hooks/useSolarPledge";

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
  const { hasPledged: onChainHasPledged } = useSolarPledge();
  const [ceremony, setCeremony] = useState({ hasPledged: false, vow: "" });

  useEffect(() => {
    const saved = localStorage.getItem("sunCycleBookmark");
    if (saved) {
      try {
        setBookmark(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sunCycleCeremony");
    if (saved) {
      try {
        setCeremony(JSON.parse(saved));
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

  const hasPledged = ceremony.hasPledged || onChainHasPledged;
  const vow = ceremony.vow;

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
            initialTab={"sol age"}
            hasPledged={hasPledged}
            vow={vow}
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
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Sunrise gradient overlay */}
          <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
          {/* Modal with blur effect */}
          <div className="relative z-10 w-full">
            <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>Clear Bookmark</div>
                <button onClick={() => setShowConfirmClear(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
              </div>
              <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest uppercase">Are you sure you want to clear your bookmark?</div>
              <div className="flex justify-between gap-4 mt-6">
                <button
                  className="flex-1 px-6 py-3 border border-gray-400 bg-gray-100 text-gray-700 rounded-none uppercase tracking-widest font-mono text-base hover:bg-gray-200 transition-colors"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 border border-red-500 bg-red-100 text-red-700 rounded-none uppercase tracking-widest font-mono text-base hover:bg-red-200 transition-colors"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 