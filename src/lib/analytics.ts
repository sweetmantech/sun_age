import posthog from "posthog-js";

export const ANALYTICS_EVENTS = {
  // Frame events
  FRAME_ADDED: "frame_added",
  FRAME_REMOVED: "frame_removed",
  NOTIFICATIONS_ENABLED: "notifications_enabled",
  NOTIFICATIONS_DISABLED: "notifications_disabled",

  // User actions
  CALCULATE_AGE: "calculate_age",
  SHARE_RESULT: "share_result",
  SAVE_BOOKMARK: "save_bookmark",
  CLEAR_BOOKMARK: "clear_bookmark",
  RECALCULATE: "recalculate",
  VIEW_DETAILS: "view_details",
  SAVE_TO_PHONE: "save_to_phone",

  // Milestone events
  MILESTONE_REACHED: "milestone_reached",
  MILESTONE_NOTIFICATION_SENT: "milestone_notification_sent",
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export const trackEvent = (event: AnalyticsEvent, properties?: Record<string, any>) => {
  if (typeof window !== "undefined") {
    posthog.capture(event, properties);
  }
};

export const identifyUser = (
  fid: string,
  username?: string,
  displayName?: string
) => {
  if (typeof window !== "undefined") {
    posthog.identify(fid, {
      username,
      displayName,
    });
  }
}; 