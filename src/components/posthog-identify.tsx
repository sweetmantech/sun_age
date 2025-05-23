"use client";

import { useEffect } from "react";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import posthog from "posthog-js";

export function PostHogIdentify() {
  const { context } = useFrameSDK();

  useEffect(() => {
    if (!context?.user?.fid || !posthog?.isFeatureEnabled) return;

    const fidId = `fc_${context?.user?.fid}`;
    const currentId = posthog.get_distinct_id();

    // Skip if already identified with this FID
    if (currentId === fidId) return;

    // Create alias from session ID → FID
    posthog.alias(fidId, currentId);

    // Identify future events with FID
    posthog.identify(fidId, {
      farcaster_username: context.user?.username,
      farcaster_display_name: context.user?.displayName,
      farcaster_fid: context.user?.fid,
    });
  }, [context?.user]);

  return null;
} 