"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirector() {
  const router = useRouter();

  useEffect(() => {
    // Check for bookmark in localStorage
    const bookmark = typeof window !== 'undefined' && localStorage.getItem("sunCycleBookmark");
    if (bookmark) {
      try {
        const parsed = JSON.parse(bookmark);
        if (parsed.days && parsed.approxYears && parsed.birthDate) {
          router.replace(`/interstitial?days=${parsed.days}&approxYears=${parsed.approxYears}&birthDate=${parsed.birthDate}`);
        }
      } catch {}
    }
  }, [router]);

  return null;
} 