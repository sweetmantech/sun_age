import React from "react";
import Image from "next/image";

interface SolarSystemGraphicProps {
  profilePhotoUrl?: string | null;
}

const SolarSystemGraphic: React.FC<SolarSystemGraphicProps> = ({ profilePhotoUrl }) => (
  <div className="flex flex-col items-center justify-center flex-1 mt-4">
    <div className="relative w-[90%] sm:w-[130%] md:w-[130%] aspect-square flex items-center justify-center">
      {/* Solar System SVG Background */}
      <Image
        src="/solar_system.svg"
        alt="Solar System"
        width={520}
        height={520}
        className="w-full h-full object-contain"
        priority
      />

      {/* Center - The Sun */}
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
      </div>

      {/* You - orbiting the sun */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: '100%',
          height: '100%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              transformOrigin: '0 0',
              animation: 'orbit 16s linear infinite',
            }}
          >
            <div
              className="flex flex-col items-center text-center"
              style={{
                transform: 'translateY(-224px)', // Outer edge of marker on the outermost ring
              }}
            >
              <div
                className="w-16 h-16 border-4 border-white rounded-full mx-auto flex items-center justify-center bg-white overflow-hidden"
              >
                {profilePhotoUrl ? (
                  <Image src={profilePhotoUrl} alt="Profile" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <Image src="/earth.png" alt="Earth" width={48} height={48} className="w-12 h-12 object-contain" style={{ animation: 'earth-spin 8s linear infinite' }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <style jsx>{`
      @keyframes orbit {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes earth-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default SolarSystemGraphic; 