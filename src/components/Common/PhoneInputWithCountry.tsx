import React, { useState, useRef, useEffect } from 'react';
import { Phone, ChevronDown, Search, X, Check } from 'lucide-react';
import {
  COUNTRY_DIAL_CODES,
  findCountryByDialCode,
  filterCountries,
  validatePhoneDigits,
  CountryDialInfo
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = findCountryByDialCode(dialCode) || COUNTRY_DIAL_CODES[0];
  const cleanDigits = phoneDigits.replace(/\D/g, '');
  const validation = validatePhoneDigits(dialCode, cleanDigits);

  const min = selectedCountry.phoneMinLength || selectedCountry.phoneLength;
  const max = selectedCountry.phoneMaxLength || selectedCountry.phoneLength;

  const filteredCountries = filterCountries(searchQuery);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelectCountry = (country: CountryDialInfo) => {
    onDialCodeChange(country.dialCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-slate-200 font-bold text-xs">
          {label} / {labelBn} {required && <span className="text-amber-400">*</span>}
        </label>
        <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          {min === max ? `${min} Digits` : `${min}-${max} Digits`}
        </span>
      </div>

      <div className="flex items-stretch rounded-xl overflow-visible border border-amber-500/30 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition bg-[#0B1528]">
        {/* Country Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(prev => !prev)}
          className="relative flex items-center bg-[#070E1C] border-r border-amber-500/30 shrink-0 hover:bg-[#0E1B38] transition cursor-pointer px-3 py-2.5 rounded-l-xl focus:outline-none"
          title="Search & Select Country Dial Code"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-lg leading-none select-none">{selectedCountry.flag}</span>
            <span className="text-amber-400 font-mono font-bold text-xs">{selectedCountry.dialCode}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
          </div>
        </button>

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
              let digits = e.target.value.replace(/\D/g, '');
              // If user pastes leading 0 in local number format, strip it
              if (digits.startsWith('0') && digits.length > 1) {
                digits = digits.replace(/^0+/, '');
              }
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

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 max-h-80 bg-[#0A1224] border border-amber-500/40 rounded-xl shadow-2xl z-50 flex flex-col backdrop-blur-md overflow-hidden">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-800 bg-[#070D1B]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search country, dial code or name..."
                className="w-full pl-8 pr-7 py-1.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between px-1">
              <span>২০০+ দেশ রয়েছে</span>
              <span>{filteredCountries.length} countries found</span>
            </div>
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                কোনো দেশ পাওয়া যায়নি (&quot;{searchQuery}&quot;)
              </div>
            ) : (
              filteredCountries.map(c => {
                const isSelected = selectedCountry.dialCode === c.dialCode && selectedCountry.code === c.code;
                return (
                  <button
                    key={c.code + c.dialCode}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-amber-500/10 transition text-xs ${
                      isSelected ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="text-xl leading-none shrink-0">{c.flag}</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{c.nameBn}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="font-mono text-amber-400 font-bold bg-[#070D1B] px-1.5 py-0.5 rounded border border-amber-500/20 text-[11px]">
                        {c.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 ml-1" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

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
