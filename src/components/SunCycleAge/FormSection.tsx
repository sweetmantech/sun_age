import React from "react";

interface FormSectionProps {
  birthDate: string;
  setBirthDate: (v: string) => void;
  calculateAge: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({ birthDate, setBirthDate, calculateAge }) => (
  <div className="flex flex-col items-center w-full px-4 pb-16">
    <form className="w-full max-w-md mx-auto">
      <label htmlFor="birth" className="block text-xs tracking-widest font-mono uppercase mb-2" style={{ color: '#6c6f7d' }}>
        ENTER BIRTH DATE
      </label>
      <input
        id="birth"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className="w-full bg-white dark:bg-black/40 border-b border-gray-300 dark:border-gray-700 text-lg py-2 px-0 mb-6 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-400 focus:border-gray-800 dark:focus:border-gray-200 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-black dark:text-white transition-colors"
        placeholder="mm/dd/yyyy"
        aria-describedby="birth-desc"
      />
      <span id="birth-desc" className="sr-only">Enter your birth date in mm/dd/yyyy format</span>
      <button
        type="button"
        onClick={calculateAge}
        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/40 uppercase tracking-widest font-mono py-3 px-8 text-base transition-colors hover:bg-gray-100 dark:hover:bg-black/60 text-black dark:text-white rounded-none mt-2"
      >
        CALCULATE
      </button>
    </form>
    <p className="text-xs font-mono text-gray-700 dark:text-gray-400 text-center mt-8 max-w-md">
      Sun cycle age measures your existence through rotations around our star. One day = one rotation.
    </p>
  </div>
);

export default FormSection; 