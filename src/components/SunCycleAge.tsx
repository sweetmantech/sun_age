"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import type { FrameContext } from "~/types/frame";
import Image from "next/image";
import Header from "./SunCycleAge/Header";
import SolarSystemGraphic from "./SunCycleAge/SolarSystemGraphic";
import ResultCard from "./SunCycleAge/ResultCard";
import FormSection from "./SunCycleAge/FormSection";
import MilestoneOrbit from "./SunCycleAge/MilestoneOrbit";
import { MILESTONE_STEP, getNextMilestone, getProgressToNextMilestone } from "~/lib/milestones";
import { Dialog } from "@headlessui/react";

function WarpcastEmbed({ url }: { url: string }) {
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/warpcast-oembed?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => setEmbedHtml(data.html));
  }, [url]);
  if (!embedHtml) return <div className="text-xs text-gray-400 font-mono text-center my-4">Loading cast…</div>;
  return (
    <div className="flex justify-center my-4" dangerouslySetInnerHTML={{ __html: embedHtml }} />
  );
}

export default function SunCycleAge() {
  const { 
    isSDKLoaded, 
    sdk, 
    pinFrame, 
    isFramePinned, 
    context, 
    notificationDetails,
    hasConsented,
    handleConsent
  } = useFrameSDK();
  const [birthDate, setBirthDate] = useState<string>("");
  const [days, setDays] = useState<number | null>(null);
  const [approxYears, setApproxYears] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Quotes for the result card
  const quotes = [
    "Sun cycle age measures your existence through rotations around our star. One day = one rotation.",
    "You are a child of the cosmos, a way for the universe to know itself.",
    "Every day is a new journey around the sun.",
    "The sun watches over all your rotations.",
    "Your orbit is uniquely yours—shine on."
  ];
  const [quote, setQuote] = useState(quotes[0]);

  // Header date (client only)
  const [formattedDate, setFormattedDate] = useState("");
  useEffect(() => {
    const today = new Date();
    setFormattedDate(
      today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\//g, ".")
    );
  }, []);

  // Solar milestone calculation (client only)
  const milestoneStep = 1000;
  const [nextMilestone, setNextMilestone] = useState<number | null>(null);
  const [daysToMilestone, setDaysToMilestone] = useState<number | null>(null);
  const [milestoneDate, setMilestoneDate] = useState<string | null>(null);
  const [lastMilestoneNotified, setLastMilestoneNotified] = useState<number | null>(null);

  useEffect(() => {
    if (days !== null) {
      // Randomize quote on result
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
      // Calculate next milestone using our new system
      const nextMilestone = getNextMilestone(days, new Date(birthDate));
      if (nextMilestone) {
        setNextMilestone(nextMilestone.cycles);
        const toNext = nextMilestone.cycles - days;
        setDaysToMilestone(toNext);
        const d = new Date();
        d.setDate(d.getDate() + toNext);
        setMilestoneDate(
          d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")
        );
      }

      // Check if we've reached a milestone and should send notification
      if (isFramePinned && context?.user?.fid && hasConsented && days % 1000 === 0 && days !== lastMilestoneNotified) {
        fetch('/api/milestone-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fid: context.user.fid,
            milestone: days,
            days: days,
          }),
        }).then(() => {
          setLastMilestoneNotified(days);
        }).catch(console.error);
      }
    } else {
      setNextMilestone(null);
      setDaysToMilestone(null);
      setMilestoneDate(null);
      setQuote(quotes[0]);
    }
  }, [days, quotes, isFramePinned, context?.user?.fid, lastMilestoneNotified, birthDate, hasConsented]);

  // Animation state: only animate after calculation
  const isAnimated = days !== null;

  // Save to phone (placeholder)
  const onSaveToPhone = () => {
    alert('Save to phone functionality coming soon!');
  };

  const calculateAge = () => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365.25);
    setDays(totalDays);
    setApproxYears(years);
  };

  const onShare = async () => {
    if (days === null) return;
    setIsSharing(true);
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const message = `Forget birthdays—I've completed ${days} rotations around the sun! Check your Sun Cycle Age: ${url} ☀️🌎`;
    try {
      await sdk.actions.composeCast({ text: message });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  // Progressive disclosure state
  const [showDetails, setShowDetails] = useState(false);

  // Example astronomy facts
  const facts = [
    "The Earth travels about 940 million kilometers in one orbit around the Sun.",
    "A year on Mercury is just 88 Earth days.",
    "The Sun makes up 99.8% of the mass in our solar system.",
    "It takes sunlight about 8 minutes and 20 seconds to reach Earth.",
    "The Earth's axis is tilted 23.5 degrees, giving us seasons."
  ];
  const randomFact = facts[Math.floor(days !== null ? days % facts.length : 0)];

  // Main content (header, orbits, form) container
  const showMain = days === null;

  // Add this before the component
  function SunSVG() {
    return (
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-2 drop-shadow-lg"
      >
        <circle
          cx="40"
          cy="40"
          r="16"
          fill="url(#sun-gradient)"
          stroke="#FFD700"
          strokeWidth="2"
          filter="url(#glow)"
        />
        {/* Rays */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = 40 + Math.cos(angle) * 22;
          const y1 = 40 + Math.sin(angle) * 22;
          const x2 = 40 + Math.cos(angle) * 32;
          const y2 = 40 + Math.sin(angle) * 32;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFD700"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        })}
        <defs>
          <radialGradient id="sun-gradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="100%" stopColor="#FFD700" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    );
  }

  useEffect(() => {
    setDays(null);
    setApproxYears(null);
  }, []);

  // Bookmark state
  const [bookmark, setBookmark] = useState<{
    days: number;
    approxYears: number;
    birthDate: string;
  } | null>(null);

  // Add a state to control showing the bookmark card or calculation page
  const [showBookmark, setShowBookmark] = useState(true);

  // Update useEffect to only show bookmark if it exists
  useEffect(() => {
    const saved = localStorage.getItem("sunCycleBookmark");
    if (saved) {
      try {
        setBookmark(JSON.parse(saved));
        setShowBookmark(true);
      } catch {}
    } else {
      setShowBookmark(false);
    }
  }, []);

  // Save bookmark
  const handleBookmark = () => {
    if (days !== null && approxYears !== null && birthDate) {
      const data = { days, approxYears, birthDate };
      localStorage.setItem("sunCycleBookmark", JSON.stringify(data));
      setBookmark(data);
    }
  };

  // Clear bookmark
  const handleClearBookmark = () => {
    localStorage.removeItem("sunCycleBookmark");
    setBookmark(null);
  };

  // Calculate milestone for bookmark
  let bookmarkMilestone: { nextMilestone: number; daysToMilestone: number; milestoneDate: string } | null = null;
  if (bookmark) {
    const bDays = bookmark.days;
    const bBirthDate = bookmark.birthDate;
    const next = Math.ceil((bDays + 1) / milestoneStep) * milestoneStep;
    const toNext = next - bDays;
    const d = new Date(bBirthDate);
    d.setDate(d.getDate() + bDays + toNext);
    const milestoneDate = d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".");
    bookmarkMilestone = {
      nextMilestone: next,
      daysToMilestone: toNext,
      milestoneDate,
    };
  }

  // Consent dialog state
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  // Show consent dialog when frame is pinned and notifications are enabled
  useEffect(() => {
    if (isFramePinned && notificationDetails && hasConsented === null) {
      setShowConsentDialog(true);
    }
  }, [isFramePinned, notificationDetails, hasConsented]);

  // Handle consent
  const handleConsentSubmit = async (consent: boolean) => {
    const success = await handleConsent(consent);
    if (success) {
      setShowConsentDialog(false);
    }
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between z-0">
      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs font-mono z-50">
          SDK: {isSDKLoaded ? '✓' : '✗'} | Frame: {isFramePinned ? '✓' : '✗'} | Context: {context ? '✓' : '✗'} | Notifications: {notificationDetails ? '✓' : '✗'} | Consent: {hasConsented ? '✓' : '✗'}
        </div>
      )}
      
      {/* Consent Dialog */}
      <Dialog
        open={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium mb-4">
              Enable Notifications & Data Storage
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              To provide you with milestone notifications and track your progress, we need your consent to store your data. This includes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your Farcaster ID (FID)</li>
                <li>Notification preferences</li>
                <li>Milestone progress</li>
              </ul>
            </Dialog.Description>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleConsentSubmit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                Decline
              </button>
              <button
                onClick={() => handleConsentSubmit(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Accept
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* Main Content: Header, Orbits, Form (fade out when result is shown) */}
      <div className={`z-10 transition-opacity duration-500 ${showMain ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
        {/* Show bookmark if exists and showBookmark is true */}
        {bookmark && showBookmark ? (
          <>
            {/* Box 1: Main Info */}
            <div className="mb-4 p-6 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 shadow-sm flex flex-col items-center max-w-lg mx-auto">
              <div className="mb-2 text-xs tracking-widest text-gray-500 dark:text-gray-300 font-mono uppercase">Welcome back!</div>
              <div className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-1">{bookmark.days} rotations</div>
              <div className="text-lg font-serif text-gray-700 dark:text-gray-200 mb-1">~ {bookmark.approxYears} years</div>
              <div className="text-xs font-mono text-gray-400 dark:text-gray-400 mb-4">Birth date: {bookmark.birthDate}</div>
              
              {/* Progress to next milestone */}
              {days !== null && (
                <div className="w-full mt-4">
                  <div className="flex justify-between text-xs font-mono text-gray-500 dark:text-gray-400 mb-2">
                    <span>Progress to next milestone</span>
                    <span>{Math.round(getProgressToNextMilestone(days, getNextMilestone(days, new Date(birthDate))))}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                      style={{ width: `${getProgressToNextMilestone(days, getNextMilestone(days, new Date(birthDate)))}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="text-center text-gray-600 dark:text-gray-300 font-sans mb-4 max-w-xs mt-4">
                This is your last saved Sun Cycle Age. You can recalculate or clear your bookmark below.
              </div>
              <div className="flex gap-4 mt-2">
                <button onClick={handleClearBookmark} className="text-gray-500 dark:text-blue-300 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-200 transition-all px-0 py-0 bg-transparent border-none shadow-none font-sans text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">Clear Bookmark</button>
                <button onClick={() => setShowBookmark(false)} className="text-gray-500 dark:text-blue-300 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-200 transition-all px-0 py-0 bg-transparent border-none shadow-none font-sans text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">Recalculate</button>
              </div>
            </div>
            {/* Box 2: Next Milestone */}
            {bookmarkMilestone && (
              <div className="mb-6 p-6 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto">
                <div className="flex-shrink-0 flex items-center justify-center min-w-[200px]">
                  <MilestoneOrbit />
                </div>
                <div className="flex flex-col items-center sm:items-start justify-center">
                  <div className="text-xs font-mono text-blue-700 dark:text-blue-300 mb-1">Next milestone</div>
                  <div className="text-xl font-serif font-bold text-blue-700 dark:text-blue-200 mb-1">{bookmarkMilestone.nextMilestone} rotations</div>
                  <div className="text-xs font-mono text-gray-500 dark:text-gray-300">in {bookmarkMilestone.daysToMilestone} days ({bookmarkMilestone.milestoneDate})</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Header formattedDate={formattedDate} />
            <div className="border-b border-gray-200 dark:border-gray-800 mt-4 mb-2" />

            <SolarSystemGraphic />

            <FormSection birthDate={birthDate} setBirthDate={setBirthDate} calculateAge={calculateAge} />
          </>
        )}
      </div>

      {/* Result Card (fade in, replaces main content) */}
      {days !== null && (
        <ResultCard
          days={days}
          approxYears={approxYears!}
          nextMilestone={nextMilestone}
          daysToMilestone={daysToMilestone}
          milestoneDate={milestoneDate}
          quote={quote}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          onShare={onShare}
          isSharing={isSharing}
          onSaveToPhone={onSaveToPhone}
          onRecalculate={() => {
            setBirthDate("");
            setDays(null);
            setApproxYears(null);
            setShowDetails(false);
          }}
          bookmark={bookmark}
          handleBookmark={handleBookmark}
        />
      )}

      {/* Footer */}
      <footer className="z-50 w-full text-center text-xs font-mono pb-4 border-t border-gray-200 dark:border-gray-800 bg-transparent text-gray-500 dark:text-gray-400" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
        Your data is not stored or shared.
      </footer>
    </div>
  );
}

