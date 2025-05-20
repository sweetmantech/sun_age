import React from "react";
import Image from "next/image";

const SolarSystemGraphic: React.FC = () => (
  <div className="flex flex-col items-center justify-center flex-1 mt-16">
    <div className="relative w-96 h-96 flex items-center justify-center pt-24">
      {/* Concentric circles */}
      <div className="absolute inset-0 border rounded-full" style={{ borderColor: '#d1d1d1', opacity: 0.7 }}></div>
      <div className="absolute inset-6 border rounded-full" style={{ borderColor: '#d1d1d1', opacity: 0.5 }}></div>
      <div className="absolute inset-12 border rounded-full" style={{ borderColor: '#d1d1d1', opacity: 0.3 }}></div>
      <div className="absolute inset-20 border rounded-full" style={{ borderColor: '#d1d1d1', opacity: 0.15 }}></div>

      {/* Radial lines (8 lines, every 45deg) - contained within the circle */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 bg-gray-400/40"
          style={{
            width: '100%',
            height: '1px',
            transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
            transformOrigin: '50% 50%'
          }}
        ></div>
      ))}

      {/* Center - The Sun (replace with image and glow) */}
      <div className="absolute top-1/2 left-1/2 w-24 h-24 flex flex-col items-center justify-center" style={{transform: 'translate(-50%, -50%)'}}>
        <Image
          src="/sunsun.png"
          alt="Sun"
          width={96}
          height={96}
          className="w-24 h-24 object-contain"
          style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
          priority
        />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .sun-center-img { filter: drop-shadow(0 0 32px #a5b4fc88) drop-shadow(0 0 8px #fff4); }
          }
        `}</style>
      </div>

      {/* You - at top of outermost orbit */}
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="block text-base uppercase tracking-widest text-gray-800 dark:text-white mb-1">Birth</span>
        <div className="w-16 h-16 border border-gray-400 dark:border-white rounded-full mx-auto flex items-center justify-center">
          <span className="text-base uppercase tracking-widest text-gray-800 dark:text-white">You</span>
        </div>
      </div>
    </div>
  </div>
);

export default SolarSystemGraphic; 