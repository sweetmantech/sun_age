/* eslint-disable @typescript-eslint/no-unused-vars */
import "~/app/globals.css";
import type { Metadata } from "next";
import { ThemeProviderClient } from "~/components/providers/theme-provider-client";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { CosmicBackground } from "~/components/ui/cosmic-background";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
import { Providers } from "~/app/providers";
import { NavActions } from "~/components/nav-actions";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { PinMiniAppButton } from "~/components/ui/pin-mini-app-button";
import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "~/components/ui/tooltip";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const appUrl =
  process.env.NEXT_PUBLIC_URL ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const metadata: Metadata = {
  title: PROJECT_TITLE,
  description: PROJECT_DESCRIPTION,
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#ffd700",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Sun Age",
    siteName: "Sun Age",
    images: [
      {
        url: "https://sun-age.vercel.app/suncycles_og.png",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://sun-age.vercel.app/suncycles_og.png"],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffd700" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Skip to content link */}
        <a href="#main-content" className="skip-link absolute left-2 top-2 z-50 bg-white text-gray-800 px-4 py-2 rounded focus:block focus:outline-none focus:ring-2 focus:ring-blue-400 sr-only focus:not-sr-only">Skip to content</a>
        <ThemeProviderClient>
          <Providers>
            {/* Light mode: solid background. Dark mode: gradient. */}
            <div className="pointer-events-none fixed inset-0 z-0 dark:hidden" style={{ background: '#ffffff' }} />
            {/* Light mode: noise texture overlay */}
            <div className="pointer-events-none fixed inset-0 z-10 opacity-20 mix-blend-soft-light dark:hidden" aria-hidden="true" style={{ backgroundImage: "url('/noise.png')" }} />
            <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block" style={{ background: "linear-gradient(180deg, #23232a 0%, #18181c 100%)" }} />
            <CosmicBackground />
            {/* Floating Theme Toggle and Pin in top-right */}
            <div className="fixed top-4 left-4 z-50 flex gap-2 items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="About Solara"
                    className="p-2 border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 shadow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:focus-visible:outline-blue-300 text-gray-500 dark:text-gray-400 rounded-none"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full border border-gray-400 bg-[rgba(255,252,242,0.3)] dark:bg-[rgba(24,24,28,0.3)] p-6 rounded-none shadow-md backdrop-blur-sm" style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}>
                  <DialogTitle className="sr-only">About Solara</DialogTitle>
                  <div className="text-4xl font-serif font-light text-gray-700 dark:text-gray-100 uppercase tracking-[0.18em] mb-1 leading-tight text-center">Solara</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-300 mb-4 leading-tight text-center" style={{ letterSpacing: '0.18em' }}>
                    Measure your solar self
                  </div>
                  <div className="text-base text-gray-800 dark:text-gray-200 font-sans leading-normal mb-4 text-left">
                    Solara measures your existence through rotations around our star SOL. One day = one rotation.<br /><br />
                    Enter your birth date to see how many solar rotations (days) you have completed. Bookmark your current rotation and track when your next solar milestone appears. More features coming soon.<br /><br />
                    Embrace your inner warmth and let SOL in. <span role="img" aria-label="sun">🌞</span>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
              <ThemeToggle />
              <PinMiniAppButton />
            </div>
            {/* App header */}
            <header className="sr-only">Sun Cycle Age App</header>
            {/* Main content and footer, flex column, sticky footer */}
            <div className="min-h-screen flex flex-col bg-white dark:bg-black/60">
              <main className="flex-1 flex flex-col justify-between min-h-screen">{children}</main>
            </div>
            {/* Footer is handled in SunCycleAge.tsx */}
          </Providers>
        </ThemeProviderClient>
      </body>
    </html>
  );
}
