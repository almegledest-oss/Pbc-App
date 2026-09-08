import React from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import {
  COUNTRY_DIAL_CODES,
  findCountryByDialCode,
  validatePhoneDigits
} from '../../utils/countryDialCodes';

interface PhoneInputWithCountryProps {
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  phoneDigits: string;
  onPhoneDigitsChange: (digits: string) => void;
  label?: string;
  labelBn?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  dialCode,
  onDialCodeChange,
  phoneDigits,
  onPhoneDigitsChange,
  label = 'Mobile / Phone',
  labelBn = 'ফোন নম্বর',
  required = true,
  disabled = false,
  error
}) => {
  const selectedCountry = findCountryByDialCode(dialCode) || COUNTRY_DIAL_CODES[0];
  const cleanDigits = phoneDigits.replace(/\D/g, '');
  const validation = validatePhoneDigits(dialCode, cleanDigits);

  const min = selectedCountry.phoneMinLength || selectedCountry.phoneLength;
  const max = selectedCountry.phoneMaxLength || selectedCountry.phoneLength;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-slate-200 font-bold text-xs">
          {label} / {labelBn} {required && <span className="text-amber-400">*</span>}
        </label>
        <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          {min === max ? `${min} Digits` : `${min}-${max} Digits`}
        </span>
      </div>

      <div className="flex items-stretch rounded-xl overflow-hidden border border-amber-500/30 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition bg-[#0B1528]">
        {/* Country Selector Dropdown */}
        <div className="relative flex items-center bg-[#070E1C] border-r border-amber-500/30 shrink-0 hover:bg-[#0E1B38] transition cursor-pointer">
          <div className="flex items-center gap-1.5 px-3 py-2.5">
            <span className="text-lg leading-none select-none">{selectedCountry.flag}</span>
            <span className="text-amber-400 font-mono font-bold text-xs">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <select
            value={dialCode}
            disabled={disabled}
            onChange={e => onDialCodeChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer bg-slate-900 text-white"
            title="Select Country Dial Code"
          >
            {COUNTRY_DIAL_CODES.map(c => (
              <option key={c.dialCode + c.code} value={c.dialCode} className="bg-slate-900 text-white py-1">
                {c.flag} {c.dialCode} ({c.name})
              </option>
            ))}
          </select>
        </div>

        {/* Digits Input */}
        <div className="relative flex-1 flex items-center">
          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="tel"
            inputMode="numeric"
            disabled={disabled}
            required={required}
            maxLength={max + 2}
            value={phoneDigits}
            onChange={e => {
              // Strip all non-digit characters
              let digits = e.target.value.replace(/\D/g, '');
              // If user pastes leading 0 in local number format (e.g. 050 -> 50 in KSA or 017 -> 17 in BD), strip leading 0
              if (digits.startsWith('0') && digits.length > 1) {
                digits = digits.replace(/^0+/, '');
              }
              // Prevent typing beyond max digits
              if (digits.length > max) {
                digits = digits.slice(0, max);
              }
              onPhoneDigitsChange(digits);
            }}
            placeholder={selectedCountry.placeholder}
            className="w-full pl-9 pr-3 py-2.5 bg-transparent text-white font-mono placeholder-slate-500 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Real-time Validation / Status Feedback */}
      <div className="mt-1 flex items-center justify-between text-[10px]">
        {error ? (
          <span className="text-rose-400 font-medium">{error}</span>
        ) : cleanDigits.length > 0 && !validation.valid ? (
          <span className="text-amber-400 font-medium">
            ⚠️ {validation.messageBn}
          </span>
        ) : cleanDigits.length > 0 && validation.valid ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            ✓ সঠিক নম্বর: <span className="font-mono text-white">{selectedCountry.dialCode} {cleanDigits}</span>
          </span>
        ) : (
          <span className="text-slate-400">
            উদাহরণ: <span className="font-mono text-slate-300">{selectedCountry.example}</span>
          </span>
        )}

        <span className="text-slate-400 font-mono ml-auto">
          {cleanDigits.length}/{max}
        </span>
      </div>
    </div>
  );
};
