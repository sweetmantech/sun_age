'use client';

import { useEffect } from 'react';
import { setupScreenshotDetection } from '~/lib/screenshot';

export function ScreenshotDetector() {
  useEffect(() => {
    // Set up screenshot detection when component mounts
    setupScreenshotDetection();
  }, []);

  // This component doesn't render anything visible
  return null;
} 