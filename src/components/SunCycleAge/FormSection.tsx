import React from "react";

interface FormSectionProps {
  birthDate: string;
  setBirthDate: (v: string) => void;
  calculateAge: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({ birthDate, setBirthDate, calculateAge }) => (
  <div className="flex flex-col items-center w-full px-2 sm:px-4 pb-16">
    <form className="w-full max-w-md mx-auto flex flex-col items-center">
      <label htmlFor="birth" className="block text-xs tracking-widest font-mono uppercase mb-2 text-center" style={{ color: '#6c6f7d' }}>
        ENTER BIRTH DATE
      </label>
      <input
        id="birth"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className="w-56 mx-auto bg-white dark:bg-black/40 border-b border-gray-300 dark:border-gray-700 text-lg py-2 px-0 mb-6 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-400 focus:border-gray-800 dark:focus:border-gray-200 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-black dark:text-white text-center transition-colors"
        aria-describedby="birth-desc"
        autoComplete="off"
      />
      <span id="birth-desc" className="sr-only">Enter your birth date in MM/DD/YYYY format</span>
      <button
        type="button"
        onClick={calculateAge}
        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/40 uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-100 dark:hover:bg-black/60 text-black dark:text-white rounded-none mt-2"
      >
        CALCULATE
      </button>
    </form>
  </div>
);

export default FormSection; 