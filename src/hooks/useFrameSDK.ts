import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { FrameNotificationDetails } from "@farcaster/frame-node";
import type { FrameContext } from "@farcaster/frame-core/src/context";

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
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);
  const [lastEvent, setLastEvent] = useState("");
  const [pinFrameResponse, setPinFrameResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      console.log("LOAD", sdk.context);
      const frameContext = await sdk.context;

      if (!frameContext) {
        // has no frameContext from Farcaster
        return;
      }

      setContext(frameContext as unknown as FrameContext);
      setIsFramePinned(frameContext.client.added);

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setLastEvent(
          `frameAdded${notificationDetails ? ", notifications enabled" : ""}`,
        );
        setIsFramePinned(true);
        if (notificationDetails) setNotificationDetails(notificationDetails);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        setLastEvent(`frameAddRejected, reason ${reason}`);
      });

      sdk.on("frameRemoved", () => {
        setLastEvent("frameRemoved");
        setIsFramePinned(false);
        setNotificationDetails(null);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        setLastEvent("notificationsEnabled");
        setNotificationDetails(notificationDetails);
      });

      sdk.on("notificationsDisabled", () => {
        setLastEvent("notificationsDisabled");
        setNotificationDetails(null);
      });

      sdk.actions.ready({ disableNativeGestures: true });
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
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
