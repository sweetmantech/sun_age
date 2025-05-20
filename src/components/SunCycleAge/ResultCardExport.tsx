import React from "react";
import Image from "next/image";

interface ResultCardExportProps {
  days: number;
  approxYears: number;
  nextMilestone: number | null;
  daysToMilestone: number | null;
  milestoneDate: string | null;
  quote: string;
  displayName?: string;
}

const ResultCardExport: React.FC<ResultCardExportProps> = ({
  days,
  approxYears,
  nextMilestone,
  daysToMilestone,
  milestoneDate,
  quote,
  displayName,
}) => (
  <div className="bg-white border border-yellow-200 rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center space-y-6 bookmark-ui" style={{ fontFamily: 'serif', background: 'linear-gradient(135deg, #fffbe6 0%, #fffde4 100%)' }}>
    <Image
      src="/sunsun.png"
      alt="Sun"
      width={96}
      height={96}
      className="w-24 h-24 object-contain"
      style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
      priority
    />
    {displayName ? (
      <div className="text-lg font-serif text-gray-800 text-center">
        <span className="font-bold">{displayName}</span>, you have <span className="font-bold">{days}</span> solar rotations
      </div>
    ) : (
      <>
        <div className="text-5xl font-serif font-extrabold tracking-tight text-gray-800 drop-shadow-lg">{days}</div>
        <div className="text-sm font-mono text-gray-500">solar rotations</div>
      </>
    )}
    <div className="text-lg font-serif text-gray-700">which makes you ~{approxYears} years old</div>
    {nextMilestone && daysToMilestone !== null && milestoneDate && (
      <div className="mt-2 text-xs font-mono text-blue-700 text-center">
        Your next milestone: <span className="font-semibold">{nextMilestone}</span> rotations<br />
        in <span className="font-semibold">{daysToMilestone}</span> days ({milestoneDate})
      </div>
    )}
    <div className="mt-4 text-xs font-sans text-gray-400 italic text-center">{quote}</div>
  </div>
);

export default ResultCardExport; 