'use client';

import { useEffect } from 'react';
import { useSocialTagToast } from './SocialTagToastProvider';

export function ScreenshotDetector() {
  const { showSocialTagToast } = useSocialTagToast();

  useEffect(() => {
    // Detect screenshot events
    const handleScreenshot = () => {
      setTimeout(() => {
        showSocialTagToast();
      }, 200);
    };

    const events = [
      'keydown', // Cmd+Shift+3, Cmd+Shift+4, etc.
      'keyup',
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
    ];

    events.forEach(eventType => {
      document.addEventListener(eventType, (e: any) => {
        // Detect common screenshot shortcuts
        if (e.type === 'keydown' || e.type === 'keyup') {
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0;

          // Mac screenshot shortcuts
          if (isMac && e.metaKey && (e.shiftKey || e.ctrlKey) &&
            (e.key === '3' || e.key === '4' || e.key === '5')) {
            setTimeout(handleScreenshot, 100);
          }

          // Windows screenshot shortcuts
          if (isWindows && e.key === 'PrintScreen') {
            setTimeout(handleScreenshot, 100);
          }

          // Windows + Shift + S (snipping tool)
          if (isWindows && e.key === 'S' && e.shiftKey && e.metaKey) {
            setTimeout(handleScreenshot, 100);
          }
        }

        // Detect potential screenshot gestures (touch + volume buttons on mobile)
        if (e.type === 'touchstart' || e.type === 'touchend') {
          // This is a simplified detection - mobile screenshot detection is limited
          // We'll show the toast on any significant touch interaction
          if (e.touches && e.touches.length >= 2) {
            setTimeout(() => {
              showSocialTagToast();
            }, 500);
          }
        }
      });
    });

    // Also detect when user might be taking a screenshot via clipboard
    let lastClipboardCheck = 0;
    document.addEventListener('paste', async (e) => {
      const now = Date.now();
      if (now - lastClipboardCheck < 1000) return; // Debounce
      lastClipboardCheck = now;

      try {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              setTimeout(handleScreenshot, 100);
              break;
            }
          }
        }
      } catch (error) {
        // Ignore clipboard errors
      }
    });

    // Listen for custom event to show the toast
    const handleCustomEvent = () => showSocialTagToast();
    window.addEventListener('show-social-tag-toast', handleCustomEvent);

    // Add a manual trigger for testing
    (window as any).testScreenshotToast = handleScreenshot;

    // Cleanup listeners on unmount
    return () => {
      events.forEach(eventType => {
        // Remove all listeners of this type
        document.removeEventListener(eventType, handleScreenshot as any);
      });
      document.removeEventListener('paste', handleScreenshot as any);
      window.removeEventListener('show-social-tag-toast', handleCustomEvent);
    };
  }, [showSocialTagToast]);

  // This component doesn't render anything visible
  return null;
} 