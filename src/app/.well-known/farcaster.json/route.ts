const PROJECT_TITLE = "Solara—a cosmic age calculator";
const PROJECT_DESCRIPTION = "Solara is a Farcaster app that allows you to track your sun cycle age and receive milestone notifications.";

export async function GET() {
  const appUrl = "https://www.solara.fyi";

  const config = {
      "accountAssociation": {
      "header": "eyJmaWQiOjU1NDMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhjMjIxOWQ2RjI4ODk5RkY0RGE1M0ZBOTM5MTRhY0UzMDY5YWIxNUVlIn0",
      "payload": "eyJkb21haW4iOiJzb2xhcmEuZnlpIn0",
      "signature": "yJnTqVvbpqmrEg4t3YWKlzeqJrwv0DKOYbtEEhkDQ4I6+pBM35C3E7adVvXj8IVK174YrYTlj2BNjH8X7CuJYhw="
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
