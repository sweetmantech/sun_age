import { Metadata } from "next";
import App from "./app";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
import { createClient } from '~/utils/supabase/server'
import { cookies } from 'next/headers'
import SunCycleAge from '~/components/SunCycleAge'
import HomeRedirector from './HomeRedirector'
import Head from 'next/head';

const appUrl =
  process.env.NEXT_PUBLIC_URL ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/suncycles_og.png`,
  button: {
    title: "Check your Sun Age",
    action: {
      type: "launch_frame",
      name: PROJECT_TITLE,
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: PROJECT_TITLE,
    metadataBase: new URL(appUrl),
    openGraph: {
      title: PROJECT_TITLE,
      description: PROJECT_DESCRIPTION,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function Page() {
  console.log("=== Server-side Page Component ===");
  console.log("Creating Supabase client...");
  const supabase = await createClient();

  // Fetch user consent data
  console.log("Fetching user consent data...");
  const { data: userConsent, error } = await supabase
    .from('user_notification_details')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching user consent:", error);
  } else {
    console.log("User consent data:", userConsent);
  }

  return (
    <>
      <Head>
        {/* Static OG and Twitter meta tags for homepage */}
        <meta property="og:title" content="Solara – Cosmic Age Calculator" />
        <meta property="og:description" content="Discover your cosmic age and join the Solara journey." />
        <meta property="og:image" content="https://yourdomain.com/suncycles_og.png" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Solara – Cosmic Age Calculator" />
        <meta name="twitter:description" content="Discover your cosmic age and join the Solara journey." />
        <meta name="twitter:image" content="https://yourdomain.com/suncycles_og.png" />
      </Head>
      <HomeRedirector />
      <SunCycleAge />
    </>
  );
}
