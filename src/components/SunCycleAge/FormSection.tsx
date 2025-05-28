import React from "react";

interface FormSectionProps {
  birthDate: string;
  setBirthDate: (v: string) => void;
  calculateAge: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({ birthDate, setBirthDate, calculateAge }) => (
  <div className="flex flex-col items-center w-full px-2 sm:px-4 pb-2 mb-4">
    <form className="w-full max-w-md mx-auto flex flex-col items-center">
      <label htmlFor="birth" className="block text-base tracking-[0.14em] font-mono uppercase mb-4 text-center" style={{ color: '#8C8C99', fontWeight: 400, letterSpacing: '0.14em' }}>
        ENTER BIRTH DATE
      </label>
      <input
        id="birth"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className="w-full max-w-[390px] mx-auto bg-white border-0 border-b border-[#222] text-xl py-2 px-0 mb-1 focus:outline-none focus:border-black placeholder-[#C0C0C8] font-mono text-black text-center transition-colors uppercase font-normal"
        aria-describedby="birth-desc"
        autoComplete="off"
        style={{ fontSize: '1.25rem', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#000' }}
      />
      <span id="birth-desc" className="sr-only">Enter your birth date in MM/DD/YYYY format</span>
      <button
        type="button"
        onClick={calculateAge}
        className="w-full max-w-[390px] mx-auto bg-[#D6AD30] border border-[#AE8C25] text-black font-mono py-3 px-8 text-lg rounded-none mt-1 mb-2 tracking-[0.11em] uppercase transition-colors hover:bg-[#B08E29] active:bg-[#B08E29] focus:bg-[#B08E29]"
        style={{ fontWeight: 400, letterSpacing: '0.11em' }}
      >
        CALCULATE
      </button>
    </form>
  </div>
);

export default FormSection; 