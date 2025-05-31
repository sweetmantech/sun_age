import React from "react";

interface MilestoneOrbitProps {
  centerX?: number;
  centerY?: number;
  radius?: number;
}

const MilestoneOrbit: React.FC<MilestoneOrbitProps> = ({ centerX = 100, centerY = 70, radius = 42 }) => (
  <svg
    width="200"
    height="140"
    viewBox="0 0 200 140"
    fill="none"
    aria-label="Animated orbit showing your path to the next milestone"
    className="mx-auto"
  >
    {/* Orbit path */}
    <circle cx={centerX} cy={centerY} r={radius} stroke="currentColor" strokeWidth="2" className="text-gray-400" />
    {/* Milestone (center) as sun image with glow */}
    <defs>
      <filter id="sun-glow-light" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
        <feFlood floodColor="#ffe066" floodOpacity="0.7" result="glowColor" />
        <feComposite in="glowColor" in2="coloredBlur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <image
      href="/sunsun.png"
      x={centerX - 20}
      y={centerY - 20}
      width="40"
      height="40"
      aria-label="Sun illustration"
      filter="url(#sun-glow-light)"
      className="block"
    />
    {/* Orbiting dot (You) */}
    <g style={{ transformOrigin: `${centerX}px ${centerY}px`, animation: 'orbit 4s linear infinite' }}>
      <circle
        r="6"
        fill="currentColor"
        className="text-gray-500"
        cx={centerX + radius}
        cy={centerY}
      />
      {/* You label below the orbiting dot */}
      <text x={centerX + radius} y={centerY + 24} textAnchor="middle" fontSize="14" className="fill-gray-500 font-mono">You</text>
    </g>
    <style>{`
      @keyframes orbit {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </svg>
);

export default MilestoneOrbit; 