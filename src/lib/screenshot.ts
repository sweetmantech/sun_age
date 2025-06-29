import { useSocialTagToast } from '~/components/SocialTagToastProvider';

// Screenshot detection and messaging
export function setupScreenshotDetection() {
  // Use the global toast
  const { showSocialTagToast } = useSocialTagToast();

  // Detect screenshot events
  const handleScreenshot = () => {
    setTimeout(() => {
      showSocialTagToast();
    }, 200);
  };

  // Listen for various screenshot events
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

  // Add a manual trigger for testing
  (window as any).testScreenshotToast = handleScreenshot;
}

// Manual trigger function for specific moments
export function showScreenshotPrompt() {
  const { showSocialTagToast } = useSocialTagToast();
  setTimeout(() => {
    showSocialTagToast();
  }, 200);
} 