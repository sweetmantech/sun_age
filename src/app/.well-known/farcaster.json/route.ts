import { PROJECT_TITLE } from "~/lib/constants.ts";

export async function GET() {
  const appUrl = "https://sun-age.vercel.app";

  const config = {
      "accountAssociation": {
        "header": "eyJmaWQiOjU1NDMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg3QUNjNjBhNTVkMDgxRjhhRGEwODU0NzAwMjY3QTNjNjBhZTFFOUMxIn0",
        "payload": "eyJkb21haW4iOiJzdW4tYWdlLnZlcmNlbC5hcHAifQ",
        "signature": "MHhkZjQ4Yjg2YTJkNzkxYzJjNDZjMTdmMGNlMTJhNWE4NTlmODcxZmEzZDQ1Y2E3ZTcyMGYyNTQ0MzBlMzQyOWY4NTlkNGIwNGUwMDM3NzQ5Y2JkYjBmODRmYzQ3NDMxNGRhMTRjNTAwNzYwOWNkN2U1M2IzZGY0MTk5MWRjYmYwMzFi"
      },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/suncycles_og.png`,
      ogImageUrl: `${appUrl}/suncycles_og.png`,
      buttonTitle: "Check your Sun Age!",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: "https://api.neynar.com/f/app/846d59ed-e2ad-4464-ae2e-35237dfa7b07/event",
    },
  };

  return Response.json(config);
}
