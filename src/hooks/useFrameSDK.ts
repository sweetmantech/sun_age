import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { FrameNotificationDetails } from "@farcaster/frame-node";
import type { FrameContext } from "@farcaster/frame-core/src/context";
import { getUserConsent, updateUserConsent, revokeUserConsent } from "~/lib/consent";

interface AddFrameResult {
  added: boolean;
  notificationDetails?: FrameNotificationDetails;
}

export function useFrameSDK() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isFramePinned, setIsFramePinned] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<FrameNotificationDetails | null>(null);
  const [lastEvent, setLastEvent] = useState("");
  const [pinFrameResponse, setPinFrameResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (typeof window === "undefined") return;
      
      try {
        // First, call ready() to ensure SDK is initialized
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

        console.log("=== Frame Context Initialized ===");
        console.log("Frame Context:", {
          hasUser: !!frameContext.user,
          fid: frameContext.user?.fid,
          username: frameContext.user?.username,
          added: frameContext.client.added
        });
        console.log("=== End Frame Context ===");

        setContext(frameContext);
        setIsFramePinned(frameContext.client.added);

        // Set up event listeners
        frameSDK.on("frameAdded", async ({ notificationDetails }) => {
          console.log("=== Frame Added Event ===");
          console.log("Frame Context:", {
            hasUser: !!frameContext.user,
            fid: frameContext.user?.fid,
            username: frameContext.user?.username,
            added: frameContext.client.added
          });
          console.log("Notification Details:", notificationDetails);

          setLastEvent(
            `frameAdded${notificationDetails ? ", notifications enabled" : ""}`,
          );
          setIsFramePinned(true);
          
          if (frameContext.user?.fid) {
            console.log("Attempting to store FID...");
            
            try {
              // Make a direct API call to store the FID
              const response = await fetch('/api/milestone-notification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fid: frameContext.user.fid.toString(),
                  type: 'welcome',
                  message: 'Welcome to Sun Cycle Age! Track your journey around the sun.',
                  timestamp: new Date().toISOString()
                }),
              });

              if (!response.ok) {
                console.error("Failed to store FID:", await response.text());
              } else {
                console.log("Successfully stored FID");
                if (notificationDetails) {
                  setNotificationDetails(notificationDetails);
                }
              }
            } catch (error) {
              console.error("Error storing FID:", error);
            }
          } else {
            console.log("❌ No FID available in frame context");
          }
          console.log("=== End Frame Added Event ===");
        });

        frameSDK.on("frameAddRejected", ({ reason }) => {
          setLastEvent(`frameAddRejected, reason ${reason}`);
        });

        frameSDK.on("frameRemoved", () => {
          setLastEvent("frameRemoved");
          setIsFramePinned(false);
          setNotificationDetails(null);
          // Revoke consent when frame is removed
          if (frameContext.user?.fid) {
            revokeUserConsent(frameContext.user.fid.toString());
          }
        });

        frameSDK.on("notificationsEnabled", ({ notificationDetails }) => {
          setLastEvent("notificationsEnabled");
          setNotificationDetails(notificationDetails);
        });

        frameSDK.on("notificationsDisabled", () => {
          setLastEvent("notificationsDisabled");
          setNotificationDetails(null);
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
      setNotificationDetails(null);
      setLoading(true);

      const result = await sdk.actions.addFrame() as AddFrameResult;
      console.log("addFrame result", result);
      
      if (result.added) {
        setIsFramePinned(true);
        if (result.notificationDetails) {
          setNotificationDetails(result.notificationDetails);
        }
        setPinFrameResponse(
          result.notificationDetails
            ? `Added, got notification token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
            : "Added, got no notification details",
        );
      } else {
        setPinFrameResponse("Failed to add frame");
      }
    } catch (error) {
      console.error("Error pinning frame:", error);
      setPinFrameResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    context,
    pinFrame,
    pinFrameResponse,
    isFramePinned,
    notificationDetails,
    lastEvent,
    sdk,
    isSDKLoaded,
    isAuthDialogOpen,
    setIsAuthDialogOpen,
    isInFrame,
  };
}
