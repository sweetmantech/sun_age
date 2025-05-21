import React from "react";
import Image from "next/image";

interface HeaderProps {
  formattedDate: string;
}

const Header: React.FC<HeaderProps> = ({ formattedDate }) => (
  <div className="pt-0 pb-0 px-4 flex flex-col items-center justify-center">
    {/* Solara Logo */}
    <Image
      src="/logo.svg"
      alt="Solara Logo"
      width={180}
      height={45}
      className="mx-auto select-none logo-solara dark:invert dark:brightness-200 dark:opacity-90"
      priority
      style={{ marginBottom: '0.25rem' }}
    />
    {/* Date */}
    <div className="text-base font-mono font-normal text-gray-600 dark:text-gray-200 mt-0 tracking-wider text-center">
      {formattedDate}
    </div>
  </div>
);

export default Header; 