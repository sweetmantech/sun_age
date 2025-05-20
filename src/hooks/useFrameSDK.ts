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
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);

  const sendWelcomeNotification = useCallback(async (fid: string) => {
    try {
      const response = await fetch('/api/milestone-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid,
          milestone: 0,
          days: 0,
          isWelcome: true,
        }),
      });
      if (!response.ok) {
        console.error('Failed to send welcome notification');
      }
    } catch (error) {
      console.error('Error sending welcome notification:', error);
    }
  }, []);

  // Check user consent when context changes
  useEffect(() => {
    const checkConsent = async () => {
      if (context?.user?.fid) {
        const consent = await getUserConsent(context.user.fid.toString());
        setHasConsented(consent?.hasConsented ?? false);
      }
    };
    checkConsent();
  }, [context?.user?.fid]);

  const handleConsent = useCallback(async (consent: boolean) => {
    if (!context?.user?.fid) return false;
    
    const success = await updateUserConsent(
      context.user.fid.toString(),
      consent,
      notificationDetails ? {
        token: notificationDetails.token,
        url: notificationDetails.url
      } : undefined
    );

    if (success) {
      setHasConsented(consent);
      // Send welcome notification when consent is granted
      if (consent && notificationDetails) {
        sendWelcomeNotification(context.user.fid.toString());
      }
    }

    return success;
  }, [context?.user?.fid, notificationDetails, sendWelcomeNotification]);

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

        setContext(frameContext);
        setIsFramePinned(frameContext.client.added);

        // Set up event listeners
        frameSDK.on("frameAdded", async ({ notificationDetails }) => {
          console.log("Frame added event received:", {
            hasNotificationDetails: !!notificationDetails,
            hasFid: !!frameContext.user?.fid,
            fid: frameContext.user?.fid
          });

          setLastEvent(
            `frameAdded${notificationDetails ? ", notifications enabled" : ""}`,
          );
          setIsFramePinned(true);
          
          if (notificationDetails && frameContext.user?.fid) {
            console.log("Storing FID and notification details in Supabase");
            setNotificationDetails(notificationDetails);
            
            try {
              // Automatically store FID and notification details in Supabase
              const success = await updateUserConsent(
                frameContext.user.fid.toString(),
                true,
                {
                  token: notificationDetails.token,
                  url: notificationDetails.url
                }
              );
              
              console.log("Supabase storage result:", success);
              
              if (success) {
                setHasConsented(true);
                // Send welcome notification
                await sendWelcomeNotification(frameContext.user.fid.toString());
              } else {
                console.error("Failed to store FID in Supabase");
              }
            } catch (error) {
              console.error("Error storing FID in Supabase:", error);
            }
          } else {
            console.log("Missing required data for Supabase storage:", {
              hasNotificationDetails: !!notificationDetails,
              hasFid: !!frameContext.user?.fid
            });
          }
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
            setHasConsented(false);
          }
        });

        frameSDK.on("notificationsEnabled", ({ notificationDetails }) => {
          setLastEvent("notificationsEnabled");
          setNotificationDetails(notificationDetails);
          // Only send welcome notification if user has consented
          if (frameContext.user?.fid && hasConsented) {
            sendWelcomeNotification(frameContext.user.fid.toString());
          }
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
  }, [isSDKLoaded, sendWelcomeNotification, hasConsented]);

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
    hasConsented,
    handleConsent,
  };
}
