"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useEffect, Suspense } from "react";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { SpinnerButton } from "~/components/ui/SpinnerButton";

function ForwardContent() {
  const searchParams = useSearchParams();
  const { isSDKLoaded, sdk } = useFrameSDK();

  const url = useMemo(() => {
    if (!searchParams) return null;
    let url = searchParams.get("url");
    if (!url) return null;

    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }
    return url;
  }, [searchParams]);

  useEffect(() => {
    if (!url || !isSDKLoaded) return;
    Promise.resolve(sdk.actions.openUrl(url)).catch(err => {
      console.error("SDK redirect error:", err);
      try {
        window.location.replace(url);
      } catch (err) {
        console.error("Window redirect error:", err);
      }
    });
  }, [url, isSDKLoaded, sdk]);

  if (!url) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-500">No URL to forward</p>
      </div>
    );
  }

  return (
    <div className="container flex flex-col mx-auto p-6 max-w-lg gap-4">
      <p className="text-center">Redirecting to {url}</p>
      <SpinnerButton
        className="text-2xl font-bold"
        size="lg"
        onClick={() => window.location.replace(url)}
      >
        Continue
      </SpinnerButton>
    </div>
  );
}

export default function ForwardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    }>
      <ForwardContent />
    </Suspense>
  );
}
