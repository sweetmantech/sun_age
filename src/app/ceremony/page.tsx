"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSolarPledge } from "../../hooks/useSolarPledge";
import { useAccount, useConnect, useReadContract } from "wagmi";
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { SOLAR_PLEDGE_ADDRESS, SolarPledgeABI } from '../../lib/contracts';

const steps = ["prepare", "inscribe", "empower", "sealed"];

const OFFWHITE = '#FFFCF2';

export default function CeremonyStepper() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { context } = useFrameSDK();
  const { address } = useAccount();
  const { approveUSDC, createPledge, isApproved, isLoading, error, hasPledged } = useSolarPledge();

  // Try to get solar age and birthDate from URL params
  const urlDays = searchParams?.get('days');
  const urlBirthDate = searchParams?.get('birthDate');

  // Try to get from bookmark/localStorage
  let bookmark: any = null;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sunCycleBookmark');
    if (saved) {
      try { bookmark = JSON.parse(saved); } catch {}
    }
  }

  // Determine solar age and birthDate
  const solAge = urlDays ? Number(urlDays) : bookmark?.days;
  const birthDate = urlBirthDate || bookmark?.birthDate;

  // Fallback: if not available, prompt user to recalculate
  useEffect(() => {
    if (!solAge || !birthDate) {
      alert('No calculation data found. Please calculate your Sol Age first.');
      router.push('/');
    }
  }, [solAge, birthDate, router]);

  // Today's date
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, ".");

  // Dynamic FID from Farcaster context
  const fid = context?.user?.fid;

  // Dynamic signature message
  const signatureMsg = `I inscribe this Solar Vow into eternity: FID ${fid ?? '...'} has completed ${solAge?.toLocaleString() ?? '...'} rotations around our star, sealed by cosmic signature on ${today}`;

  // Placeholder data (replace with real data/props)
  const [pledge, setPledge] = useState(5);
  const [customPledge, setCustomPledge] = useState("");
  const [commitment, setCommitment] = useState("");
  const [farcasterHandle, setFarcasterHandle] = useState("");

  // Calculate sponsoredCount and multiplier for step 2
  const overage = Math.max(0, pledge - 1);
  const sponsoredCount = Math.floor(overage * 0.5);
  const multiplier = Math.min(5, (1 + (pledge - 1) * 0.1)).toFixed(1);

  // Step navigation
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const cancel = () => {
    if (solAge && birthDate) {
      const approxYears = Math.floor(solAge / 365.25);
      router.push(`/results?days=${solAge}&birthDate=${birthDate}&approxYears=${approxYears}`);
    } else {
      router.push('/');
    }
  };

  // Handler for returning to results with fallback logic
  const handleReturnToResults = () => {
    // Try in-memory data first
    if (solAge && birthDate) {
      const approxYears = Math.floor(solAge / 365.25);
      router.push(`/results?days=${solAge}&birthDate=${birthDate}&approxYears=${approxYears}`);
      return;
    }
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const bookmark = JSON.parse(saved);
          if (bookmark.days && bookmark.birthDate && bookmark.approxYears) {
            router.push(`/results?days=${bookmark.days}&birthDate=${bookmark.birthDate}&approxYears=${bookmark.approxYears}`);
            return;
          }
        } catch {}
      }
    }
    // Final fallback
    router.push('/');
  };

  // Handle pledge creation
  const handlePledge = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      if (!isApproved(pledge)) {
        // First step: Approve USDC
        await approveUSDC(BigInt(pledge * 1_000_000));
      } else {
        // Second step: Create the pledge
        await createPledge(commitment, farcasterHandle, pledge);
        next(); // Move to next step on success
      }
    } catch (err) {
      console.error("Failed to process pledge:", err);
      alert("Failed to process pledge. Please try again.");
    }
  };

  // SunGlow component for glowing effect behind the sun
  function SunGlow() {
    return (
      <Image
        src="/sunsun.png"
        alt="Sun"
        width={96}
        height={96}
        className="mb-4"
        style={{ filter: 'drop-shadow(0 0 50px #FFD700cc) drop-shadow(0 0 20px #FFB30099)' }}
        priority
      />
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white relative">
      {/* Fixed Progress Bar below global header */}
      <div style={{ position: 'fixed', top: 98, left: 0, width: '100%', zIndex: 50 }}>
        <div className="w-full h-2 flex" style={{ background: '#F6F5E6' }}>
          {(() => {
            let width = '33%';
            let color = '#D6AD30';
            if (step === 1) width = '66%';
            if (step === 2) width = '100%';
            if (step === 3) {
              width = '100%';
              color = '#22C55E'; // green-500
            }
            return <div className="h-2 transition-all duration-300" style={{ width, background: color }} />;
          })()}
          <div className="flex-1" />
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full flex flex-col items-center justify-center" style={{ background: OFFWHITE }}>
        <div className="max-w-md mx-auto w-full px-6 pt-32 pb-8 min-h-[60vh]">
          {step === 0 && (
            <>
              <div className="flex flex-col items-center mb-0">
                <div className="pt-8" />
                <SunGlow />
                <div className="text-2xl font-serif font-bold mb-2">Prepare Your Solar Vow</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">The beginning to your brightest self</div>
                {/* Cosmic Journey Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90 text-center">
                  <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Your Cosmic Journey Thus Far</div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">⭐</span>
                    <span className="text-3xl font-serif font-bold">{solAge ? solAge.toLocaleString() : ""}</span>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="text-xs font-mono text-gray-500 mb-2">Solar rotations since {birthDate}</div>
                </div>
                {/* Commitment Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-0">
                  <div className="text-xs font-mono text-gray-700 mb-2 uppercase tracking-widest font-bold">The Commitment</div>
                  <div className="text-sm font-mono text-gray-700">A Solar Vow is a sacred commitment to your cosmic journey, inscribed permanently in the celestial record.<br /><br />At <span className="font-bold">{solAge?.toLocaleString()}</span> rotations around our star, you&apos;re ready to make your mark on the universe.</div>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col items-start mb-0">
                <div className="pt-8" />
                <Image src="/pinky_promise.png" alt="Fist" width={200} height={200} className="mb-6 self-center" style={{ filter: 'drop-shadow(0 0 50px #FFD700cc) drop-shadow(0 0 20px #FFB30099)' }} />
                <div className="text-2xl font-serif font-normal mb-1 w-full text-center leading-tighter">Inscribe Your Solar Vow</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest w-full text-center">Sign your cosmic journey</div>
                {/* Message to Sign Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90 text-left">
                  <div className="text-xs font-mono text-gray-500 mb-4 uppercase tracking-widest">Message to Sign</div>
                  <div className="text-sm font-mono text-gray-700 whitespace-pre-wrap">{signatureMsg}</div>
                </div>
                <button
                  onClick={next}
                  className="w-full bg-black text-white py-3 px-4 rounded-none font-mono text-sm hover:bg-gray-800 transition-colors"
                >
                  Continue to Empower
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col items-start mb-0">
                <div className="pt-8" />
                <Image src="/pinky_promise.png" alt="Fist" width={200} height={200} className="mb-6 self-center" style={{ filter: 'drop-shadow(0 0 50px #FFD700cc) drop-shadow(0 0 20px #FFB30099)' }} />
                <div className="text-2xl font-serif font-normal mb-1 w-full text-center leading-tighter">Empower Your Journey</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest w-full text-center">Record your vow on-chain</div>

                {/* Commitment Input */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90">
                  <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Your Commitment</div>
                  <textarea
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    placeholder="Write your commitment..."
                    className="w-full h-24 p-2 border border-gray-300 rounded-none font-mono text-sm"
                  />
                </div>

                {/* Farcaster Handle Input */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90">
                  <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Farcaster Handle</div>
                  <input
                    type="text"
                    value={farcasterHandle}
                    onChange={(e) => setFarcasterHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full p-2 border border-gray-300 rounded-none font-mono text-sm"
                  />
                </div>

                {/* Pledge Amount Selection */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90">
                  <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Pledge Amount (USDC)</div>
                  <div className="flex gap-2 mb-2">
                    {[1, 5, 10, 25].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setPledge(amount)}
                        className={`flex-1 py-2 border ${
                          pledge === amount
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-black"
                        } rounded-none font-mono text-sm transition-colors`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customPledge}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomPledge(val);
                        if (val) setPledge(Number(val));
                      }}
                      placeholder="Custom amount"
                      className="flex-1 p-2 border border-gray-300 rounded-none font-mono text-sm"
                    />
                    <button
                      onClick={() => {
                        if (customPledge) {
                          setPledge(Number(customPledge));
                          setCustomPledge("");
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-none font-mono text-sm hover:border-black transition-colors"
                    >
                      Set
                    </button>
                  </div>
                </div>

                {/* Multiplier and Sponsored Info */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90">
                  <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Your Impact</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono">Multiplier</span>
                    <span className="text-sm font-mono font-bold">{multiplier}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono">Sponsored Rotations</span>
                    <span className="text-sm font-mono font-bold">{sponsoredCount}</span>
                  </div>
                </div>

                <button
                  onClick={handlePledge}
                  disabled={isLoading || !commitment || !farcasterHandle}
                  className="w-full bg-black text-white py-3 px-4 rounded-none font-mono text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? "Processing..." : isApproved(pledge) ? `SEAL VOW WITH ${pledge} SOLAR ENERGY` : "APPROVE USDC"}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col items-center mb-0">
                <div className="pt-8" />
                <SunGlow />
                <div className="text-2xl font-serif font-bold mb-2">Vow Sealed</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">Your journey is now eternal</div>
                {/* Success Message */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90 text-center">
                  <div className="text-sm font-mono text-gray-700 mb-4">
                    Your Solar Vow has been recorded on-chain, forever marking your {solAge?.toLocaleString()} rotations around our star.
                  </div>
                  <div className="text-xs font-mono text-gray-500">
                    Transaction Hash: {hasPledged ? "0x..." : "Pending..."}
                  </div>
                </div>
                <button
                  onClick={handleReturnToResults}
                  className="w-full bg-black text-white py-3 px-4 rounded-none font-mono text-sm hover:bg-gray-800 transition-colors"
                >
                  Return to Results
                </button>
              </div>
            </>
          )}
        </div>
        {/* Divider between main content and buttons */}
        <div className="w-full h-px bg-gray-300 mb-6" />
      </div>
      {/* Main CTA and Secondary CTAs outside main content container */}
      {(step === 0 || step === 1 || step === 2 || step === 3) && (
        <div className="w-full flex flex-col items-center mt-0 mb-2 px-0 bg-white">
          <div className="max-w-md w-full px-6">
            {step === 0 && (
              <>
                <button
                  className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
                  onClick={next}
                >
                  BEGIN SOLAR VOW CEREMONY
                </button>
                <div className="flex w-full items-center justify-center gap-0 mt-0 mb-6">
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={handleReturnToResults}
                  >
                    RETURN TO RESULTS
                  </button>
                  <span className="w-px h-6 bg-gray-300 mx-2" />
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={() => router.push('/soldash')}
                  >
                    BOOKMARK INSTEAD
                  </button>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <button
                  className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
                  onClick={next}
                >
                  SIGN TO INSCRIBE VOW
                </button>
                <div className="flex w-full items-center justify-center gap-0 mt-0 mb-6">
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={handleReturnToResults}
                  >
                    RETURN TO RESULTS
                  </button>
                  <span className="w-px h-8 bg-black mx-6" style={{ minWidth: '1px' }} />
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={prev}
                  >
                    CANCEL COMMITMENT
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <button
                  className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
                  onClick={next}
                >
                  SEAL VOW WITH ${pledge} SOLAR ENERGY
                </button>
                <div className="flex w-full items-center justify-between gap-0 mt-0 mb-6">
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-left"
                    onClick={() => setStep(2)}
                  >
                    ADJUST PLEDGE
                  </button>
                  <span className="w-px h-8 bg-black mx-6" style={{ minWidth: '1px' }} />
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-right"
                    onClick={handleReturnToResults}
                  >
                    CANCEL COMMITMENT
                  </button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <button className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors" onClick={() => router.push('/soldash?tab=sol%20vows')}>VIEW MY SOL DASHBOARD</button>
                <button className="w-full py-4 mb-8 bg-white text-black font-mono text-base tracking-widest uppercase border border-gray-400 rounded-none hover:bg-gray-50 transition-colors" onClick={() => alert('TODO: Share to Farcaster')}>SHARE MY VOW</button>
                <div className="flex w-full items-center justify-center gap-0 mt-0 mb-6">
                  <button className="flex-1 font-mono text-base uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-left" onClick={() => router.push('/')}>CALCULATE AGAIN</button>
                  <span className="w-px h-8 bg-gray-400 mx-6" style={{ minWidth: '1px' }} />
                  <button className="flex-1 font-mono text-base uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-right" onClick={() => router.push('/about')}>LEARN MORE</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Footer - same as main page */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-12 mt-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">&quot;occulture&quot;</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">&quot;sirsu&quot;</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 