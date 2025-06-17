"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirector() {
  const router = useRouter();

  useEffect(() => {
    // Check for bookmark in localStorage
    const bookmark = typeof window !== 'undefined' && localStorage.getItem("sunCycleBookmark");
    // Optionally, you could also check for a ceremony or other localStorage keys
    if (bookmark) {
      router.replace("/soldash");
    }
    // If you want to check for on-chain pledge, you could enhance this with a context/hook
  }, [router]);

  return null;
} 