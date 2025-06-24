import React from "react";

// Pulsing Star Spinner
export function PulsingStarSpinner() {
  const frames = ["⋅", "˖", "+", "⟡", "✧", "⟡", "+", "˖"];
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 120);
    return () => clearInterval(interval);
  }, [frames.length]);
  return <span style={{ fontSize: '1.2em', marginRight: 6 }}>{frames[frame]}</span>;
} 