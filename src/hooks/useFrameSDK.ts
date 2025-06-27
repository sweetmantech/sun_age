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

        // Check frame context with retry mechanism
        let frameContext = await sdk.context;
        let retryCount = 0;
        
        // Retry up to 10 times if context is not immediately available
        while (!frameContext && retryCount < 10 && mounted) {
          console.log(`[useFrameSDK] Context not available, retrying... (${retryCount + 1}/10)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          frameContext = await sdk.context;
          retryCount++;
        }
        
        if (!mounted) return;
        
        console.log('[useFrameSDK] Frame context loaded:', {
          hasContext: !!frameContext,
          hasUser: !!frameContext?.user,
          fid: frameContext?.user?.fid,
          clientAdded: frameContext?.client?.added,
          retryCount,
          contextDetails: frameContext
        });
        
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
      
      console.log('[useFrameSDK] Wallet connection check:', {
        isSDKLoaded,
        isConnected,
        isInFrame,
        hasFarcasterConnector: !!farcasterConnector,
        connectorId: farcasterConnector?.id,
        connectorName: farcasterConnector?.name,
        availableConnectors: connectors.map(c => ({ id: c.id, name: c.name }))
      });
      
      if (!isSDKLoaded || isConnected || !isInFrame || !farcasterConnector) return;

      try {
        if (mounted) setLoading(true);
        if (mounted) setError(null);
        console.log('[useFrameSDK] Attempting to connect wallet...');
        await connect({ connector: farcasterConnector });
        console.log('[useFrameSDK] Wallet connected successfully');
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

  // Manual connection function
  const connectManually = useCallback(async () => {
    const farcasterConnector = connectors.find(
      (c) => c.id === "farcaster" || c.name.toLowerCase().includes("frame")
    );
    
    if (!farcasterConnector) {
      throw new Error('No Farcaster connector available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[useFrameSDK] Manual connection attempt...');
      await connect({ connector: farcasterConnector });
      console.log('[useFrameSDK] Manual connection successful');
    } catch (err) {
      console.error("Error in manual connection:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connect, connectors]);

  // Manual context refresh function
  const refreshContext = useCallback(async () => {
    try {
      console.log('[useFrameSDK] Manually refreshing context...');
      const frameContext = await sdk.context;
      console.log('[useFrameSDK] Refreshed context:', {
        hasContext: !!frameContext,
        hasUser: !!frameContext?.user,
        fid: frameContext?.user?.fid,
        contextDetails: frameContext
      });
      
      if (frameContext) {
        setContext(frameContext);
        setIsInFrame(true);
        setIsFramePinned(frameContext.client.added);
      }
      
      return frameContext;
    } catch (err) {
      console.error('[useFrameSDK] Error refreshing context:', err);
      throw err;
    }
  }, [sdk]);

  return {
    isSDKLoaded,
    isInFrame,
    isFramePinned,
    context,
    pinFrame,
    connectManually,
    refreshContext,
    loading,
    error,
    isConnected,
    address,
    sdk
  };
}
