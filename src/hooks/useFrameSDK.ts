import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import type { FrameContext } from "@farcaster/frame-core/context";
import { useAccount, useConnect } from 'wagmi';
// import { updateUserConsent } from "~/lib/consent";

export function useFrameSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isFramePinned, setIsFramePinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  // Initialize SDK and check frame context
  useEffect(() => {
    let mounted = true;

    const initSDK = async () => {
      if (typeof window === "undefined") return;

      try {
        // Initialize SDK
        await sdk.actions.ready({ disableNativeGestures: true });
        if (!mounted) return;
        setIsSDKLoaded(true);

        // Check frame context
        const frameContext = await sdk.context;
        if (!mounted) return;
        
        if (frameContext) {
          setIsInFrame(true);
          setContext(frameContext);
          setIsFramePinned(frameContext.client.added);
        }

        // Set up frameSDK event listeners
        const frameSDK = (window as any).frameSDK;
        if (frameSDK) {
          frameSDK.on("frameAdded", () => {
            if (mounted) setIsFramePinned(true);
          });
          frameSDK.on("frameRemoved", () => {
            if (mounted) setIsFramePinned(false);
          });
        }
      } catch (err) {
        console.error("Error initializing SDK:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    initSDK();

    return () => {
      mounted = false;
    };
  }, []);

  // Separate effect for wallet connection
  useEffect(() => {
    let mounted = true;

    const connectWallet = async () => {
      // Only auto-connect if we're in a frame and have a Farcaster connector
      const farcasterConnector = connectors.find(
        (c) => c.id === "farcaster" || c.name.toLowerCase().includes("frame")
      );
      
      if (!isSDKLoaded || isConnected || !isInFrame || !farcasterConnector) return;

      try {
        if (mounted) setLoading(true);
        if (mounted) setError(null);
        await connect({ connector: farcasterConnector });
      } catch (err) {
        console.error("Error connecting wallet:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    connectWallet();

    return () => {
      mounted = false;
    };
  }, [isSDKLoaded, isConnected, isInFrame, connect, connectors]);

  // Pin frame function
  const pinFrame = useCallback(async () => {
    if (!isSDKLoaded) return;

    try {
      setLoading(true);
      setError(null);

      await sdk.actions.addMiniApp();
      setIsFramePinned(true);

      if (context?.user?.fid) {
        try {
          await fetch('/api/milestone-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: context.user.fid,
              type: 'welcome',
              message: `Welcome to Solara! You'll now receive milestone notifications as you journey around the sun.`,
              timestamp: new Date().toISOString()
            }),
          });
        } catch (err) {
          console.error("Error sending welcome notification:", err);
        }
      }
    } catch (err) {
      console.error("Error pinning frame:", err);
      if (err instanceof Error) {
        if (err.message.includes('RejectedByUser')) {
          setError(new Error('You declined to add Solara to your apps.'));
        } else if (err.message.includes('InvalidDomainManifestJson')) {
          setError(new Error('Unable to add Solara: Invalid app configuration.'));
        } else {
          setError(err);
        }
      } else {
        setError(new Error('Failed to add Solara to your apps.'));
      }
    } finally {
      setLoading(false);
    }
  }, [isSDKLoaded, context]);

  return {
    isSDKLoaded,
    isInFrame,
    isFramePinned,
    context,
    pinFrame,
    loading,
    error,
    isConnected,
    address,
    sdk
  };
}
