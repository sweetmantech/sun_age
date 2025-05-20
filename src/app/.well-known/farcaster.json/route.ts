import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl = "https://sun-age.vercel.app";

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjEzNTk2LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4ODE3MzE4RDZmRkY2NkExOGQ4M0ExMzc2QTc2RjZlMzBCNDNjODg4OSJ9",
      payload:
        "eyJkb21haW4iOiJmYXJjYXN0ZXItbWluaWFwcC10ZW1wbGF0ZS52ZXJjZWwuYXBwIn0",
      signature:
        "MHg5ZjkyZTdkNjRmZTNhNTE4YTEzOTBmZTdlYzAwOWQzODUzZWM2N2RmOTZiYjg1MzAwOGRlZDExNjVmOGE5OGVlNDQyYmI0MDU3OTI0ZmEzOGE3N2NlYWRiYThiMTRiN2IzMTY5N2ZjYWVlZGM3MTE1YWNiMTFmYjc2Y2EzYTc0YzFj",
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
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
