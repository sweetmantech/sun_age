'use client';
import { useEffect, useState } from "react";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { Pin, PinOff } from "lucide-react";

export function PinMiniAppButton() {
  const { isSDKLoaded, pinFrame, isFramePinned } = useFrameSDK();
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSDKLoaded && typeof isFramePinned === "boolean") {
      setPinned(isFramePinned);
    }
  }, [isSDKLoaded, isFramePinned]);

  const handlePin = async () => {
    if (!isSDKLoaded || pinned) return;
    setLoading(true);
    try {
      await pinFrame();
      setPinned(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={pinned ? "Mini App pinned on Farcaster" : "Pin Mini App on Farcaster"}
      onClick={handlePin}
      disabled={!isSDKLoaded || loading || pinned}
      className={`rounded-full p-2 border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 shadow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:focus-visible:outline-blue-300 ${pinned ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'} disabled:opacity-50`}
      title={isSDKLoaded ? (pinned ? "Already pinned on Farcaster" : "Pin on Farcaster") : "Connect to Farcaster to pin"}
    >
      {pinned ? <Pin className="w-5 h-5" /> : <PinOff className="w-5 h-5" />}
    </button>
  );
} 