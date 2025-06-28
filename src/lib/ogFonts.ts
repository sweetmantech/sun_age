// Font data for OG images - GT Alpina font embedded as base64
// This avoids runtime font fetching which fails in production

export const GT_ALPINA_FONT_BASE64 = `
[Base64 encoded font data would go here - we'll need to convert the TTF file]
`;

// For now, let's use a simpler approach with system fonts
// but we can enhance this later with proper font embedding

// Font utilities for OG images
import { readFileSync } from 'fs';
import { join } from 'path';

// Function to load GT Alpina font for OG images
export async function loadGTAlpinaFont(): Promise<ArrayBuffer | null> {
  try {
    // In production, we'll need to handle this differently
    // For now, return null to use system fonts
    return null;
  } catch (error) {
    console.error('Failed to load GT Alpina font:', error);
    return null;
  }
}

// Font configuration for OG images
export const OG_FONTS = {
  primary: 'Georgia, serif',
  mono: 'monospace',
  fallback: 'serif'
} as const;

// Helper to get font configuration
export function getOGFontConfig() {
  return {
    fonts: OG_FONTS,
    // We can add font loading logic here later
  };
} 