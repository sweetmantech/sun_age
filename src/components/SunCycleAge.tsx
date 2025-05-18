"use client";

import { useState } from "react";
import { useFrameSDK } from "~/hooks/useFrameSDK";

export default function SunCycleAge() {
  const { isSDKLoaded, sdk, pinFrame, isFramePinned } = useFrameSDK();
  const [birthDate, setBirthDate] = useState<string>("");
  const [days, setDays] = useState<number | null>(null);
  const [approxYears, setApproxYears] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

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
    const message = `Forget birthdays—I’ve completed ${days} rotations around the sun! Check your Sun Cycle Age: ${url} ☀️🌎`;
    try {
      await sdk.actions.composeCast({ text: message });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      {!isFramePinned && (
        <button
          onClick={pinFrame}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Pin this Mini App
        </button>
      )}
      {isFramePinned && (
        <p className="text-green-600">App pinned! Notifications enabled.</p>
      )}
      {!days && (
        <div className="space-y-2">
          <label htmlFor="birth" className="block text-sm font-medium text-gray-700">
            Select your birthday
          </label>
          <input
            id="birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={calculateAge}
            className="w-full px-4 py-2 bg-yellow-400 text-black rounded-md animate-pulse"
          >
            Calculate Age
          </button>
        </div>
      )}
      {days !== null && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-40 h-40 flex items-center justify-center bg-yellow-400 rounded-full animate-pulse">
            <span className="text-2xl font-bold">{days}</span>
          </div>
          <p className="text-sm text-gray-600">
            That&apos;s how many times you&apos;ve rotated around the sun!
          </p>
          {approxYears !== null && (
            <p className="text-xs text-gray-500">
              For comparison, your conventional age is approximately {approxYears} years (which is{" "}
              {Math.floor(approxYears * 365.25)} days)
            </p>
          )}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => {
                setBirthDate("");
                setDays(null);
                setApproxYears(null);
              }}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Calculate again
            </button>
            <button
              onClick={onShare}
              disabled={isSharing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              {isSharing ? "Sharing..." : "Share your age"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
