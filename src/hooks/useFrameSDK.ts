import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import type { FrameContext } from "@farcaster/frame-core/src/context";
// import { updateUserConsent } from "~/lib/consent";

export function useFrameSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isFramePinned, setIsFramePinned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (typeof window === "undefined") return;
      
      try {
        // First check if we're in a Farcaster frame
        const frameContext = await sdk.context;
        if (frameContext) {
          console.log("Found Farcaster frame context:", {
            hasUser: !!frameContext.user,
            fid: frameContext.user?.fid,
            username: frameContext.user?.username,
            added: frameContext.client.added
          });
          setIsInFrame(true);
          setContext(frameContext);
          setIsFramePinned(frameContext.client.added);
        }

        // Then initialize the SDK
        await sdk.actions.ready({ disableNativeGestures: true });
        setIsSDKLoaded(true);

        // Check for frameSDK in window
        const frameSDK = (window as any).frameSDK;
        if (frameSDK) {
          console.log("Found frameSDK in window");
          setIsInFrame(true);
          
          // Set up event listeners
          frameSDK.on("frameAdded", async () => {
            console.log("Frame added");
            setIsFramePinned(true);
          });

          frameSDK.on("frameRemoved", () => {
            console.log("Frame removed");
            setIsFramePinned(false);
          });
        } else {
          console.log("No frameSDK found in window");
        }
      } catch (error) {
        console.error("Error setting up SDK:", error);
        setIsSDKLoaded(false);
      }
    };

    if (!isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded]);

  const pinFrame = useCallback(async () => {
    try {
      setLoading(true);
      const result = await sdk.actions.addFrame();
      console.log("Frame pin result:", result);
      setIsFramePinned(true);

      // Send welcome notification after 90 seconds
      if (context?.user?.fid) {
        setTimeout(() => {
          fetch('/api/milestone-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: context.user.fid,
              type: 'welcome',
              message: `Welcome to Solara! You'll now receive milestone notifications as you journey around the sun.`,
              timestamp: new Date().toISOString()
            }),
          }).catch(console.error);
        }, 90000); // 90,000 ms = 1.5 minutes
      }
    } catch (error) {
      console.error("Error pinning frame:", error);
    } finally {
      setLoading(false);
    }
  }, [context]);

  return {
    context,
    pinFrame,
    isFramePinned,
    sdk,
    isSDKLoaded,
    isInFrame,
    loading
  };
}
