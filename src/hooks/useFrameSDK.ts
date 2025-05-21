import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import type { FrameContext } from "@farcaster/frame-core/src/context";
import { updateUserConsent } from "~/lib/consent";

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
        await sdk.actions.ready({ disableNativeGestures: true });
        setIsSDKLoaded(true);

        const frameSDK = (window as any).frameSDK;
        if (!frameSDK) {
          console.log("No frameSDK found in window");
          return;
        }

        setIsInFrame(true);
        
        const frameContext = await frameSDK.context;
        if (!frameContext) {
          console.log("No frameContext from Farcaster");
          return;
        }

        console.log("Frame Context:", {
          hasUser: !!frameContext.user,
          fid: frameContext.user?.fid,
          username: frameContext.user?.username,
          added: frameContext.client.added
        });

        setContext(frameContext);
        setIsFramePinned(frameContext.client.added);

        // Set up event listeners
        frameSDK.on("frameAdded", async () => {
          console.log("Frame added");
          setIsFramePinned(true);
          
          if (frameContext.user?.fid) {
            console.log("Storing FID:", frameContext.user.fid);
            try {
              await updateUserConsent(
                frameContext.user.fid.toString(),
                true,
                undefined
              );
              console.log("Successfully stored FID");
            } catch (error) {
              console.error("Error storing FID:", error);
            }
          }
        });

        frameSDK.on("frameRemoved", () => {
          console.log("Frame removed");
          setIsFramePinned(false);
        });
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
    } catch (error) {
      console.error("Error pinning frame:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
