import { Metadata } from "next";
import App from "./app";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
import { createClient } from '~/utils/supabase/server'
import { cookies } from 'next/headers'
import SunCycleAge from '~/components/SunCycleAge'

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
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  // Fetch user consent data
  const { data: userConsent } = await supabase
    .from('user_consent')
    .select('*')
    .order('consent_date', { ascending: false })
    .limit(10)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SunCycleAge initialConsentData={userConsent} />
    </main>
  )
}
