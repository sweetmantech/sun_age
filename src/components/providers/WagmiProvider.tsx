import { createConfig, http, injected, WagmiProvider as Provider } from "wagmi";
import { base, degen, mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { DaimoPayProvider, getDefaultConfig } from "@daimo/pay";
import { PROJECT_TITLE } from "~/lib/constants";

const queryClient = new QueryClient();

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const config = createConfig(
    getDefaultConfig({
      appName: PROJECT_TITLE,
      chains: [base, degen, mainnet, optimism],
      additionalConnectors: [farcasterFrame(), injected()],
    }),
  );

  return (
    <Provider config={config}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider>{children}</DaimoPayProvider>
      </QueryClientProvider>
    </Provider>
  );
}
