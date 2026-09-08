export interface CountryDialInfo {
  name: string;
  nameBn: string;
  code: string;
  dialCode: string;
  flag: string;
  phoneLength: number; // exact or expected digits after dialCode
  phoneMinLength?: number;
  phoneMaxLength?: number;
  placeholder: string;
  example: string;
}

export const COUNTRY_DIAL_CODES: CountryDialInfo[] = [
  {
    name: 'Saudi Arabia',
    nameBn: 'সৌদি আরব',
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦',
    phoneLength: 9, // e.g. 50 123 4567 (9 digits after +966)
    placeholder: '50 123 4567',
    example: '+966 50 123 4567'
  },
  {
    name: 'Bangladesh',
    nameBn: 'বাংলাদেশ',
    code: 'BD',
    dialCode: '+880',
    flag: '🇧🇩',
    phoneLength: 10, // e.g. 17 1234 5678 (10 digits after +880)
    placeholder: '17 1234 5678',
    example: '+880 17 1234 5678'
  },
  {
    name: 'United Arab Emirates',
    nameBn: 'সংযুক্ত আরব আমিরাত',
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪',
    phoneLength: 9, // e.g. 50 123 4567
    placeholder: '50 123 4567',
    example: '+971 50 123 4567'
  },
  {
    name: 'Qatar',
    nameBn: 'কাতার',
    code: 'QA',
    dialCode: '+974',
    flag: '🇶🇦',
    phoneLength: 8, // e.g. 3312 3456
    placeholder: '3312 3456',
    example: '+974 3312 3456'
  },
  {
    name: 'Oman',
    nameBn: 'ওমান',
    code: 'OM',
    dialCode: '+968',
    flag: '🇴🇲',
    phoneLength: 8, // e.g. 9123 4567
    placeholder: '9123 4567',
    example: '+968 9123 4567'
  },
  {
    name: 'Kuwait',
    nameBn: 'কুয়েত',
    code: 'KW',
    dialCode: '+965',
    flag: '🇰🇼',
    phoneLength: 8, // e.g. 9123 4567
    placeholder: '9123 4567',
    example: '+965 9123 4567'
  },
  {
    name: 'Bahrain',
    nameBn: 'বাহরাইন',
    code: 'BH',
    dialCode: '+973',
    flag: '🇧🇭',
    phoneLength: 8, // e.g. 3612 3456
    placeholder: '3612 3456',
    example: '+973 3612 3456'
  },
  {
    name: 'Malaysia',
    nameBn: 'মালয়েশিয়া',
    code: 'MY',
    dialCode: '+60',
    flag: '🇲🇾',
    phoneLength: 9,
    phoneMinLength: 9,
    phoneMaxLength: 10,
    placeholder: '12 345 6789',
    example: '+60 12 345 6789'
  },
  {
    name: 'Singapore',
    nameBn: 'সিঙ্গাপুর',
    code: 'SG',
    dialCode: '+65',
    flag: '🇸🇬',
    phoneLength: 8,
    placeholder: '8123 4567',
    example: '+65 8123 4567'
  },
  {
    name: 'United Kingdom',
    nameBn: 'যুক্তরাজ্য (UK)',
    code: 'GB',
    dialCode: '+44',
    flag: '🇬🇧',
    phoneLength: 10,
    placeholder: '7911 123456',
    example: '+44 7911 123456'
  },
  {
    name: 'United States',
    nameBn: 'যুক্তরাষ্ট্র (USA)',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    phoneLength: 10,
    placeholder: '202 555 0123',
    example: '+1 202 555 0123'
  },
  {
    name: 'Italy',
    nameBn: 'ইতালি',
    code: 'IT',
    dialCode: '+39',
    flag: '🇮🇹',
    phoneLength: 10,
    placeholder: '320 123 4567',
    example: '+39 320 123 4567'
  },
  {
    name: 'Canada',
    nameBn: 'কানাডা',
    code: 'CA',
    dialCode: '+1',
    flag: '🇨🇦',
    phoneLength: 10,
    placeholder: '416 555 0123',
    example: '+1 416 555 0123'
  },
  {
    name: 'Australia',
    nameBn: 'অস্ট্রেলিয়া',
    code: 'AU',
    dialCode: '+61',
    flag: '🇦🇺',
    phoneLength: 9,
    placeholder: '412 345 678',
    example: '+61 412 345 678'
  }
];

export const COUNTRY_CITY_MAP: Record<string, string[]> = {
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Al Khobar', 'Jubail', 'Tabuk', 'Taif', 'Yanbu', 'Abha'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Noakhali', 'Brahmanbaria', 'Gazipur', 'Narayanganj', 'Cox\'s Bazar'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain', 'Fujairah', 'Umm Al Quwain'],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Seeb'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Ahmadi', 'Jahra'],
  'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Shah Alam', 'Petaling Jaya', 'Ipoh'],
  'Singapore': ['Singapore'],
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Oldham', 'Leeds', 'Luton', 'Cardiff'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Paterson', 'Dallas', 'Detroit'],
  'Italy': ['Rome', 'Milan', 'Venice', 'Bologna', 'Naples', 'Florence'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']
};

export function getCitiesForCountry(countryName: string): string[] {
  const clean = countryName.trim().toLowerCase();
  const matchedKey = Object.keys(COUNTRY_CITY_MAP).find(c => c.toLowerCase() === clean);
  if (matchedKey) {
    return COUNTRY_CITY_MAP[matchedKey];
  }
  // Check if matched by Bengali name
  const matchedCountry = COUNTRY_DIAL_CODES.find(c => c.nameBn.toLowerCase() === clean);
  if (matchedCountry && COUNTRY_CITY_MAP[matchedCountry.name]) {
    return COUNTRY_CITY_MAP[matchedCountry.name];
  }
  return [];
}

export function findCountryByDialCode(dialCode: string): CountryDialInfo | undefined {
  return COUNTRY_DIAL_CODES.find(c => c.dialCode === dialCode);
}

export function findCountryByName(name: string): CountryDialInfo | undefined {
  const clean = name.trim().toLowerCase();
  return COUNTRY_DIAL_CODES.find(
    c => c.name.toLowerCase() === clean || c.nameBn.toLowerCase() === clean
  );
}

/**
 * Validate phone number digits given a dial code
 */
export function validatePhoneDigits(
  dialCode: string,
  digits: string
): { valid: boolean; message?: string; messageBn?: string } {
  const country = findCountryByDialCode(dialCode);
  const cleanDigits = digits.replace(/\D/g, '');

  if (!cleanDigits) {
    return {
      valid: false,
      message: 'Please enter phone number digits',
      messageBn: 'অনুগ্রহ করে ফোন নম্বর দিন'
    };
  }

  if (country) {
    const min = country.phoneMinLength || country.phoneLength;
    const max = country.phoneMaxLength || country.phoneLength;

    if (cleanDigits.length < min) {
      return {
        valid: false,
        message: `${country.name} phone number requires ${min} digits (currently ${cleanDigits.length})`,
        messageBn: `${country.nameBn} ফোন নম্বরে কমপক্ষে ${min} ডিজিট দিতে হবে (আপনি দিয়েছেন ${cleanDigits.length} ডিজিট)`
      };
    }
    if (cleanDigits.length > max) {
      return {
        valid: false,
        message: `${country.name} phone number cannot exceed ${max} digits (currently ${cleanDigits.length})`,
        messageBn: `${country.nameBn} ফোন নম্বরে সর্বোচ্চ ${max} ডিজিট হতে পারবে (আপনি দিয়েছেন ${cleanDigits.length} ডিজিট)`
      };
    }
  } else {
    // Generic validation: min 7, max 15 digits
    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      return {
        valid: false,
        message: 'Phone number must be between 7 and 15 digits',
        messageBn: 'ফোন নম্বর অবশ্যই ৭ থেকে ১৫ ডিজিটের হতে হবে'
      };
    }
  }

  return { valid: true };
}
