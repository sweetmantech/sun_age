import React from "react";

interface HeaderProps {
  formattedDate: string;
}

const Header: React.FC<HeaderProps> = ({ formattedDate }) => (
  <div className="pt-8 pb-2 px-4">
    <h1 className="text-3xl font-serif font-bold tracking-widest text-left">
      <span className="text-[#22223b] dark:text-gray-100">SUN </span>
      <span className="text-gray-600 font-light dark:text-gray-400">CYCLE AGE</span>
    </h1>
    <div className="text-xs font-mono mt-1" style={{ color: '#6c6f7d' }}>{formattedDate}</div>
  </div>
);

export default Header; 