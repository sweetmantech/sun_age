"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { useFrameSDK } from "~/hooks/useFrameSDK";

export default function ForwardPage() {
  const searchParams = useSearchParams();
  const { sdk } = useFrameSDK();

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
    if (!url) return;
    if (sdk) {
      Promise.resolve(sdk.actions.openUrl(url)).catch(err => {
        console.error("SDK redirect error:", err);
      });
    } else {
      try {
        window.location.replace(url);
      } catch (err) {
        console.error("Window redirect error:", err);
      }
    }
  }, [url, sdk]);

  if (!url) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-500">No URL to forward</p>
      </div>
    );
  }

  return (
    <div className="container flex flex-col mx-auto p-6 max-w-lg gap-4">
      <p className="text-center ">Redirecting to {url}</p>
      <Button
        className="text-2xl font-bold"
        size="lg"
        onClick={() => window.location.replace(url)}
      >
        Continue
      </Button>
    </div>
  );
}
