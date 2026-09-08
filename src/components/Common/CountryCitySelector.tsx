import React, { useState, useRef, useEffect } from 'react';
import { Globe, MapPin, ChevronDown, Check } from 'lucide-react';
import { COUNTRY_DIAL_CODES, COUNTRY_CITY_MAP, getCitiesForCountry } from '../../utils/countryDialCodes';

interface CountryCitySelectorProps {
  country: string;
  onCountryChange: (country: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  labelCountry?: string;
  labelCountryBn?: string;
  labelCity?: string;
  labelCityBn?: string;
  className?: string;
  darkMode?: boolean;
}

export const CountryCitySelector: React.FC<CountryCitySelectorProps> = ({
  country,
  onCountryChange,
  city,
  onCityChange,
  labelCountry = 'Country',
  labelCountryBn = 'দেশ',
  labelCity = 'City',
  labelCityBn = 'শহর',
  className = '',
  darkMode = true
}) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [customCityMode, setCustomCityMode] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setIsCountryOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find currently selected country info
  const selectedCountryInfo = COUNTRY_DIAL_CODES.find(
    c => c.name.toLowerCase() === country.trim().toLowerCase() || c.nameBn.toLowerCase() === country.trim().toLowerCase()
  );

  // Available cities for selected country
  const availableCities = getCitiesForCountry(country);

  const handleSelectCountry = (countryName: string) => {
    onCountryChange(countryName);
    setIsCountryOpen(false);
    // Auto-select first city of this country
    const cities = getCitiesForCountry(countryName);
    if (cities.length > 0) {
      onCityChange(cities[0]);
      setCustomCityMode(false);
    } else {
      onCityChange('');
      setCustomCityMode(true);
    }
  };

  const handleSelectCity = (cityName: string) => {
    if (cityName === '__OTHER__') {
      setCustomCityMode(true);
      onCityChange('');
    } else {
      setCustomCityMode(false);
      onCityChange(cityName);
    }
    setIsCityOpen(false);
  };

  return (
    <div className={`grid grid-cols-2 gap-2.5 ${className}`}>
      {/* Country Selector */}
      <div className="relative" ref={countryRef}>
        <label className="block text-slate-200 font-bold mb-1 text-xs sm:text-sm">
          {labelCountry} {labelCountryBn && <span className="text-slate-400 font-normal">/ {labelCountryBn}</span>}
        </label>
        
        <button
          type="button"
          onClick={() => {
            setIsCountryOpen(prev => !prev);
            setIsCityOpen(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0B1528] border border-amber-500/30 hover:border-amber-400 focus:border-amber-400 rounded-xl text-white text-left focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition group"
        >
          <div className="flex items-center space-x-2 min-w-0 pr-1">
            {selectedCountryInfo ? (
              <span className="text-lg leading-none shrink-0" role="img" aria-label={selectedCountryInfo.name}>
                {selectedCountryInfo.flag}
              </span>
            ) : (
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="truncate text-sm font-medium text-slate-100">
              {selectedCountryInfo ? selectedCountryInfo.name : country || 'Select Country'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isCountryOpen ? 'rotate-180 text-amber-400' : ''}`} />
        </button>

        {/* Country Dropdown Menu */}
        {isCountryOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-64 max-h-64 overflow-y-auto bg-[#0A1224] border border-amber-500/40 rounded-xl shadow-2xl z-50 py-1 divide-y divide-slate-800/60 backdrop-blur-md">
            <div className="px-3 py-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-[#070D1B]">
              Select Country / দেশ নির্বাচন করুন
            </div>
            {COUNTRY_DIAL_CODES.map(c => {
              const isSelected = selectedCountryInfo?.name === c.name || country.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-amber-500/10 transition ${
                    isSelected ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xl leading-none">{c.flag}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{c.nameBn}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* City Selector */}
      <div className="relative" ref={cityRef}>
        <label className="block text-slate-200 font-bold mb-1 text-xs sm:text-sm">
          {labelCity} {labelCityBn && <span className="text-slate-400 font-normal">/ {labelCityBn}</span>}
        </label>

        {customCityMode ? (
          <div className="relative">
            <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={city}
              onChange={e => onCityChange(e.target.value)}
              placeholder="Enter city name..."
              className="w-full pl-9 pr-8 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-sm transition"
            />
            {availableCities.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCustomCityMode(false);
                  setIsCityOpen(true);
                }}
                title="Choose from list"
                className="absolute right-2.5 top-3 text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
              >
                List
              </button>
            )}
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => {
                setIsCityOpen(prev => !prev);
                setIsCountryOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0B1528] border border-amber-500/30 hover:border-amber-400 focus:border-amber-400 rounded-xl text-white text-left focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition group"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate text-sm font-medium text-slate-100">
                  {city || (availableCities.length > 0 ? 'Select City' : 'Enter City')}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isCityOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            {/* City Dropdown Menu */}
            {isCityOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 max-h-64 overflow-y-auto bg-[#0A1224] border border-amber-500/40 rounded-xl shadow-2xl z-50 py-1 divide-y divide-slate-800/60 backdrop-blur-md">
                <div className="px-3 py-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-[#070D1B]">
                  {selectedCountryInfo?.name || country} Cities
                </div>
                {availableCities.map(cityName => {
                  const isSelected = city.toLowerCase() === cityName.toLowerCase();
                  return (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => handleSelectCity(cityName)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-amber-500/10 transition ${
                        isSelected ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-slate-200'
                      }`}
                    >
                      <span className="text-sm font-medium truncate">{cityName}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleSelectCity('__OTHER__')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-amber-500/10 text-amber-400/90 text-xs font-medium italic transition"
                >
                  <span>✏️ Other / অন্য শহর লিখুন...</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
