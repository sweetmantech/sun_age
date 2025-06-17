const PROJECT_TITLE = "Solara—a cosmic age calculator";
const PROJECT_DESCRIPTION = "Solara is a Farcaster app that allows you to track your sun cycle age and receive milestone notifications.";

export async function GET() {
  const appUrl = "https://solara.fyi";

  const config = {
      "accountAssociation": {
      "header": "eyJmaWQiOjU1NDMsInR5ZSI6ImN1c3RvZHkiLCJrZXkiOiIweDdBQ2M2MGE1NWQwODFGOGFEYTA4NTQ3MDAyNjdBM2M2MGFlMUVOMUMxIn0",
      "payload": "eyJkb21haW4iOiJzb2xhcmEuZnlpIn0",
      "signature": "MHg2OTQ3M2YwZjE2YTU2OWU0NjY3NzdlZWViYmVlNmNiYWQ3YjBlZjYxMTIwZWQ2NWFlNzI2ZTgwMWQ0NGNlNTY3NmJkMjFiMTVjOTE2MmJlNGNkZjY0Yzg5ZDI4Njk4NGZjYjhjYzE2ODNkZjhmMDZlNmU1M2I5ZmMwMjRmNjI0ZjFi"
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      subtitle: "Track yourself in sun cycles",
      description: PROJECT_DESCRIPTION,
      tagline: "Discover your inner Sol",
      primaryCategory: "productivity",
      tags: ["milestones", "vow", "pledge", "solar", "calendar"],
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/suncycles_og.png`,
      ogImageUrl: `${appUrl}/suncycles_og.png`,
      heroImageUrl: `${appUrl}/suncycles_og.png`,
      noindex: true,
      screenshotUrls: [
        `${appUrl}/results_page.png`,
        `${appUrl}/pledge_page.png`,
        `${appUrl}/splash_page.png`
      ],
      buttonTitle: "Check your Sun Age!",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      ogTitle: "Solara — Measure your Sol Age",
      ogDescription: "Calculate your age in sun cycles, discover cosmic milestones, and inscribe your Solar Vow.",
      requiredChains: ["eip155:8453"],
      webhookUrl: "https://api.neynar.com/f/app/846d59ed-e2ad-4464-ae2e-35237dfa7b07/event",
      castShareUrl: `${appUrl}/share`,
    },
  };

  return Response.json(config);
}
