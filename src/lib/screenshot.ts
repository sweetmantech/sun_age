// Screenshot detection and messaging (no React hooks here)

// Manual trigger function for specific moments
export function showScreenshotPrompt() {
  // Dispatch a custom event that ScreenshotDetector will listen for
  window.dispatchEvent(new CustomEvent('show-social-tag-toast'));
} 