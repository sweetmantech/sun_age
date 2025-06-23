import React, { useState } from "react";

// Pulsing Star Spinner
function PulsingStarSpinner() {
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

// SpinnerButton component
export function SpinnerButton({ onClick, children, isSubmitting, delay = 500, className = "", ...props }) {
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isSubmitting !== undefined) {
      setIsLoading(isSubmitting);
    }
  }, [isSubmitting]);

  const handleClick = async (e) => {
    if (isSubmitting === undefined) {
      setIsLoading(true);
    }
    await onClick?.(e);
    if (isSubmitting === undefined) {
      setTimeout(() => setIsLoading(false), delay);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={className + " flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"}
    >
      {isLoading && <PulsingStarSpinner />}
      {children}
    </button>
  );
} 