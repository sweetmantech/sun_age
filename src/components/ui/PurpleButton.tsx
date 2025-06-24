import React from "react";
import { PulsingStarSpinner } from "./PulsingStarSpinner";

interface PurpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function PurpleButton({ children, className = "", isLoading = false, ...props }: PurpleButtonProps) {
  return (
    <button
      className={`w-full max-w-xs mx-auto block bg-[#7C65C1] text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7C65C1] hover:bg-[#6952A3] ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <PulsingStarSpinner />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
}
