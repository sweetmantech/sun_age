"use client";
import { useEffect } from "react";

export function EntryBackButton({ onBack, isMiniApp }: { onBack: () => void, isMiniApp: boolean }) {
  useEffect(() => {
    if (isMiniApp && typeof window !== 'undefined' && (window as any).sdk && (window as any).sdk.back) {
      (window as any).sdk.back.enableWebNavigation();
    }
  }, [isMiniApp]);

  if (isMiniApp) {
    return null;
  }
  return (
    <button
      className="absolute top-6 left-6 z-20 font-mono text-xs text-gray-700 hover:text-black underline underline-offset-2 bg-transparent border-none p-0 m-0"
      onClick={onBack}
      type="button"
    >
      {"< BACK TO PREVIEW"}
    </button>
  );
} 