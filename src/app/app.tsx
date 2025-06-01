"use client";

import dynamic from "next/dynamic";

// @ts-expect-error Next.js dynamic import expects no extension, but TS wants .js with node16
const MiniApp = dynamic(() => import("../components/MiniApp"), {
  ssr: false,
});

export default function App() {
  return <MiniApp />;
}
