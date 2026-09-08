export interface CountryDialInfo {
  name: string;
  nameBn: string;
  code: string;
  dialCode: string;
  flag: string;
  phoneLength: number; // expected digits after dialCode
  phoneMinLength?: number;
  phoneMaxLength?: number;
  placeholder: string;
  example: string;
}

// 200+ Countries list with dial codes, ISO codes, flags, Bengali names, and phone format patterns
export const COUNTRY_DIAL_CODES: CountryDialInfo[] = [
  // Middle East / GCC (Top Priority for PBC Club)
  { name: 'Saudi Arabia', nameBn: 'সৌদি আরব', code: 'SA', dialCode: '+966', flag: '🇸🇦', phoneLength: 9, placeholder: '50 123 4567', example: '+966 50 123 4567' },
  { name: 'Bangladesh', nameBn: 'বাংলাদেশ', code: 'BD', dialCode: '+880', flag: '🇧🇩', phoneLength: 10, placeholder: '17 1234 5678', example: '+880 17 1234 5678' },
  { name: 'United Arab Emirates', nameBn: 'সংযুক্ত আরব আমিরাত (UAE)', code: 'AE', dialCode: '+971', flag: '🇦🇪', phoneLength: 9, placeholder: '50 123 4567', example: '+971 50 123 4567' },
  { name: 'Qatar', nameBn: 'কাতার', code: 'QA', dialCode: '+974', flag: '🇶🇦', phoneLength: 8, placeholder: '3312 3456', example: '+974 3312 3456' },
  { name: 'Oman', nameBn: 'ওমান', code: 'OM', dialCode: '+968', flag: '🇴🇲', phoneLength: 8, placeholder: '9123 4567', example: '+968 9123 4567' },
  { name: 'Kuwait', nameBn: 'কুয়েত', code: 'KW', dialCode: '+965', flag: '🇰🇼', phoneLength: 8, placeholder: '9123 4567', example: '+965 9123 4567' },
  { name: 'Bahrain', nameBn: 'বাহরাইন', code: 'BH', dialCode: '+973', flag: '🇧🇭', phoneLength: 8, placeholder: '3612 3456', example: '+973 3612 3456' },

  // Asia & Southeast Asia
  { name: 'Malaysia', nameBn: 'মালয়েশিয়া', code: 'MY', dialCode: '+60', flag: '🇲🇾', phoneLength: 9, phoneMinLength: 9, phoneMaxLength: 10, placeholder: '12 345 6789', example: '+60 12 345 6789' },
  { name: 'Singapore', nameBn: 'সিঙ্গাপুর', code: 'SG', dialCode: '+65', flag: '🇸🇬', phoneLength: 8, placeholder: '8123 4567', example: '+65 8123 4567' },
  { name: 'India', nameBn: 'ভারত', code: 'IN', dialCode: '+91', flag: '🇮🇳', phoneLength: 10, placeholder: '98765 43210', example: '+91 98765 43210' },
  { name: 'Pakistan', nameBn: 'পাকিস্তান', code: 'PK', dialCode: '+92', flag: '🇵🇰', phoneLength: 10, placeholder: '300 1234567', example: '+92 300 1234567' },
  { name: 'Japan', nameBn: 'জাপান', code: 'JP', dialCode: '+81', flag: '🇯🇵', phoneLength: 10, placeholder: '90 1234 5678', example: '+81 90 1234 5678' },
  { name: 'South Korea', nameBn: 'দক্ষিণ কোরিয়া', code: 'KR', dialCode: '+82', flag: '🇰🇷', phoneLength: 10, placeholder: '10 1234 5678', example: '+82 10 1234 5678' },
  { name: 'China', nameBn: 'চীন', code: 'CN', dialCode: '+86', flag: '🇨🇳', phoneLength: 11, placeholder: '138 1234 5678', example: '+86 138 1234 5678' },
  { name: 'Hong Kong', nameBn: 'হংকং', code: 'HK', dialCode: '+852', flag: '🇭🇰', phoneLength: 8, placeholder: '9123 4567', example: '+852 9123 4567' },
  { name: 'Taiwan', nameBn: 'তাইওয়ান', code: 'TW', dialCode: '+886', flag: '🇹🇼', phoneLength: 9, placeholder: '912 345 678', example: '+886 912 345 678' },
  { name: 'Indonesia', nameBn: 'ইন্দোনেশিয়া', code: 'ID', dialCode: '+62', flag: '🇮🇩', phoneLength: 10, phoneMinLength: 9, phoneMaxLength: 12, placeholder: '812 3456 7890', example: '+62 812 3456 7890' },
  { name: 'Thailand', nameBn: 'থাইল্যান্ড', code: 'TH', dialCode: '+66', flag: '🇹🇭', phoneLength: 9, placeholder: '81 234 5678', example: '+66 81 234 5678' },
  { name: 'Philippines', nameBn: 'ফিলিপাইন', code: 'PH', dialCode: '+63', flag: '🇵🇭', phoneLength: 10, placeholder: '917 123 4567', example: '+63 917 123 4567' },
  { name: 'Vietnam', nameBn: 'ভিয়েতনাম', code: 'VN', dialCode: '+84', flag: '🇻🇳', phoneLength: 9, placeholder: '91 234 5678', example: '+84 91 234 5678' },
  { name: 'Sri Lanka', nameBn: 'শ্রীলঙ্কা', code: 'LK', dialCode: '+94', flag: '🇱🇰', phoneLength: 9, placeholder: '71 234 5678', example: '+94 71 234 5678' },
  { name: 'Nepal', nameBn: 'নেপাল', code: 'NP', dialCode: '+977', flag: '🇳🇵', phoneLength: 10, placeholder: '984 1234567', example: '+977 984 1234567' },
  { name: 'Maldives', nameBn: 'মালদ্বীপ', code: 'MV', dialCode: '+960', flag: '🇲🇻', phoneLength: 7, placeholder: '771 2345', example: '+960 771 2345' },
  { name: 'Bhutan', nameBn: 'ভুটান', code: 'BT', dialCode: '+975', flag: '🇧🇹', phoneLength: 8, placeholder: '1712 3456', example: '+975 1712 3456' },
  { name: 'Brunei', nameBn: 'ব্রুনাই', code: 'BN', dialCode: '+673', flag: '🇧🇳', phoneLength: 7, placeholder: '712 3456', example: '+673 712 3456' },
  { name: 'Cambodia', nameBn: 'কম্বোডিয়া', code: 'KH', dialCode: '+855', flag: '🇰🇭', phoneLength: 9, phoneMinLength: 8, phoneMaxLength: 9, placeholder: '12 345 678', example: '+855 12 345 678' },
  { name: 'Laos', nameBn: 'লাওস', code: 'LA', dialCode: '+856', flag: '🇱🇦', phoneLength: 10, placeholder: '20 2345 6789', example: '+856 20 2345 6789' },
  { name: 'Myanmar', nameBn: 'মিয়ানমার', code: 'MM', dialCode: '+95', flag: '🇲🇲', phoneLength: 9, phoneMinLength: 8, phoneMaxLength: 10, placeholder: '9 234 56789', example: '+95 9 234 56789' },
  { name: 'Macau', nameBn: 'ম্যাকাও', code: 'MO', dialCode: '+853', flag: '🇲🇴', phoneLength: 8, placeholder: '6612 3456', example: '+853 6612 3456' },
  { name: 'Mongolia', nameBn: 'মঙ্গোলিয়া', code: 'MN', dialCode: '+976', flag: '🇲🇳', phoneLength: 8, placeholder: '8812 3456', example: '+976 8812 3456' },
  { name: 'Kazakhstan', nameBn: 'কাজাখস্তান', code: 'KZ', dialCode: '+7', flag: '🇰🇿', phoneLength: 10, placeholder: '701 234 5678', example: '+7 701 234 5678' },
  { name: 'Uzbekistan', nameBn: 'উজবেকিস্তান', code: 'UZ', dialCode: '+998', flag: '🇺🇿', phoneLength: 9, placeholder: '90 123 4567', example: '+998 90 123 4567' },
  { name: 'Kyrgyzstan', nameBn: 'কিরগিজস্তান', code: 'KG', dialCode: '+996', flag: '🇰🇬', phoneLength: 9, placeholder: '700 123 456', example: '+996 700 123 456' },
  { name: 'Tajikistan', nameBn: 'তাজিকিস্তান', code: 'TJ', dialCode: '+992', flag: '🇹🇯', phoneLength: 9, placeholder: '90 123 4567', example: '+992 90 123 4567' },
  { name: 'Turkmenistan', nameBn: 'তুর্কমেনিস্তান', code: 'TM', dialCode: '+993', flag: '🇹🇲', phoneLength: 8, placeholder: '65 123456', example: '+993 65 123456' },
  { name: 'Azerbaijan', nameBn: 'আজারবাইজান', code: 'AZ', dialCode: '+994', flag: '🇦🇿', phoneLength: 9, placeholder: '50 123 4567', example: '+994 50 123 4567' },
  { name: 'Georgia', nameBn: 'জর্জিয়া', code: 'GE', dialCode: '+995', flag: '🇬🇪', phoneLength: 9, placeholder: '555 123 456', example: '+995 555 123 456' },
  { name: 'Armenia', nameBn: 'আর্মেনিয়া', code: 'AM', dialCode: '+374', flag: '🇦🇲', phoneLength: 8, placeholder: '91 123456', example: '+374 91 123456' },
  { name: 'Turkey', nameBn: 'তুরস্ক', code: 'TR', dialCode: '+90', flag: '🇹🇷', phoneLength: 10, placeholder: '532 123 4567', example: '+90 532 123 4567' },
  { name: 'Jordan', nameBn: 'জর্ডান', code: 'JO', dialCode: '+962', flag: '🇯🇴', phoneLength: 9, placeholder: '7 9123 4567', example: '+962 7 9123 4567' },
  { name: 'Lebanon', nameBn: 'লেবানন', code: 'LB', dialCode: '+961', flag: '🇱🇧', phoneLength: 8, placeholder: '70 123456', example: '+961 70 123456' },
  { name: 'Iraq', nameBn: 'ইরাক', code: 'IQ', dialCode: '+964', flag: '🇮🇶', phoneLength: 10, placeholder: '770 123 4567', example: '+964 770 123 4567' },
  { name: 'Yemen', nameBn: 'ইয়েমেন', code: 'YE', dialCode: '+967', flag: '🇾🇪', phoneLength: 9, placeholder: '71 234 5678', example: '+967 71 234 5678' },
  { name: 'Syria', nameBn: 'সিরিয়া', code: 'SY', dialCode: '+963', flag: '🇸🇾', phoneLength: 9, placeholder: '94 123 4567', example: '+963 94 123 4567' },
  { name: 'Iran', nameBn: 'ইরান', code: 'IR', dialCode: '+98', flag: '🇮🇷', phoneLength: 10, placeholder: '912 345 6789', example: '+98 912 345 6789' },
  { name: 'Afghanistan', nameBn: 'আফগানিস্তান', code: 'AF', dialCode: '+93', flag: '🇦🇫', phoneLength: 9, placeholder: '70 123 4567', example: '+93 70 123 4567' },
  { name: 'Cyprus', nameBn: 'সাইপ্রাস', code: 'CY', dialCode: '+357', flag: '🇨🇾', phoneLength: 8, placeholder: '96 123456', example: '+357 96 123456' },
  { name: 'Israel', nameBn: 'ইসরায়েল / ফিলিস্তিন', code: 'IL', dialCode: '+972', flag: '🇵🇸', phoneLength: 9, placeholder: '50 123 4567', example: '+972 50 123 4567' },

  // Europe (Western, Southern, Northern, Eastern)
  { name: 'United Kingdom', nameBn: 'যুক্তরাজ্য (UK)', code: 'GB', dialCode: '+44', flag: '🇬🇧', phoneLength: 10, placeholder: '7911 123456', example: '+44 7911 123456' },
  { name: 'Italy', nameBn: 'ইতালি', code: 'IT', dialCode: '+39', flag: '🇮🇹', phoneLength: 10, placeholder: '320 123 4567', example: '+39 320 123 4567' },
  { name: 'Germany', nameBn: 'জার্মানি', code: 'DE', dialCode: '+49', flag: '🇩🇪', phoneLength: 10, phoneMinLength: 10, phoneMaxLength: 11, placeholder: '151 23456789', example: '+49 151 23456789' },
  { name: 'France', nameBn: 'ফ্রান্স', code: 'FR', dialCode: '+33', flag: '🇫🇷', phoneLength: 9, placeholder: '6 12 34 56 78', example: '+33 6 12 34 56 78' },
  { name: 'Spain', nameBn: 'স্পেন', code: 'ES', dialCode: '+34', flag: '🇪🇸', phoneLength: 9, placeholder: '612 34 56 78', example: '+34 612 34 56 78' },
  { name: 'Portugal', nameBn: 'পর্তুগাল', code: 'PT', dialCode: '+351', flag: '🇵🇹', phoneLength: 9, placeholder: '912 345 678', example: '+351 912 345 678' },
  { name: 'Netherlands', nameBn: 'নেদারল্যান্ডস', code: 'NL', dialCode: '+31', flag: '🇳🇱', phoneLength: 9, placeholder: '6 12345678', example: '+31 6 12345678' },
  { name: 'Belgium', nameBn: 'বেলজিয়াম', code: 'BE', dialCode: '+32', flag: '🇧🇪', phoneLength: 9, placeholder: '470 12 34 56', example: '+32 470 12 34 56' },
  { name: 'Switzerland', nameBn: 'সুইজারল্যান্ড', code: 'CH', dialCode: '+41', flag: '🇨🇭', phoneLength: 9, placeholder: '78 123 45 67', example: '+41 78 123 45 67' },
  { name: 'Austria', nameBn: 'অস্ট্রিয়া', code: 'AT', dialCode: '+43', flag: '🇦🇹', phoneLength: 10, phoneMinLength: 9, phoneMaxLength: 11, placeholder: '664 1234567', example: '+43 664 1234567' },
  { name: 'Sweden', nameBn: 'সুইডেন', code: 'SE', dialCode: '+46', flag: '🇸🇪', phoneLength: 9, placeholder: '70 123 45 67', example: '+46 70 123 45 67' },
  { name: 'Norway', nameBn: 'নরওয়ে', code: 'NO', dialCode: '+47', flag: '🇳🇴', phoneLength: 8, placeholder: '412 34 567', example: '+47 412 34 567' },
  { name: 'Denmark', nameBn: 'ডেনমার্ক', code: 'DK', dialCode: '+45', flag: '🇩🇰', phoneLength: 8, placeholder: '20 12 34 56', example: '+45 20 12 34 56' },
  { name: 'Finland', nameBn: 'ফিনল্যান্ড', code: 'FI', dialCode: '+358', flag: '🇫🇮', phoneLength: 9, phoneMinLength: 8, phoneMaxLength: 10, placeholder: '40 1234567', example: '+358 40 1234567' },
  { name: 'Ireland', nameBn: 'আয়ারল্যান্ড', code: 'IE', dialCode: '+353', flag: '🇮🇪', phoneLength: 9, placeholder: '87 123 4567', example: '+353 87 123 4567' },
  { name: 'Poland', nameBn: 'পোল্যান্ড', code: 'PL', dialCode: '+48', flag: '🇵🇱', phoneLength: 9, placeholder: '512 345 678', example: '+48 512 345 678' },
  { name: 'Greece', nameBn: 'গ্রিস', code: 'GR', dialCode: '+30', flag: '🇬🇷', phoneLength: 10, placeholder: '691 234 5678', example: '+30 691 234 5678' },
  { name: 'Czech Republic', nameBn: 'চেক প্রজাতন্ত্র', code: 'CZ', dialCode: '+420', flag: '🇨🇿', phoneLength: 9, placeholder: '601 123 456', example: '+420 601 123 456' },
  { name: 'Hungary', nameBn: 'হাঙ্গেরি', code: 'HU', dialCode: '+36', flag: '🇭🇺', phoneLength: 9, placeholder: '20 123 4567', example: '+36 20 123 4567' },
  { name: 'Romania', nameBn: 'রোমানিয়া', code: 'RO', dialCode: '+40', flag: '🇷🇴', phoneLength: 9, placeholder: '712 345 678', example: '+40 712 345 678' },
  { name: 'Bulgaria', nameBn: 'বুলগেরিয়া', code: 'BG', dialCode: '+359', flag: '🇧🇬', phoneLength: 9, placeholder: '87 123 4567', example: '+359 87 123 4567' },
  { name: 'Croatia', nameBn: 'ক্রোয়েশিয়া', code: 'HR', dialCode: '+385', flag: '🇭🇷', phoneLength: 9, placeholder: '91 123 4567', example: '+385 91 123 4567' },
  { name: 'Slovakia', nameBn: 'স্লোভাকিয়া', code: 'SK', dialCode: '+421', flag: '🇸🇰', phoneLength: 9, placeholder: '912 123 456', example: '+421 912 123 456' },
  { name: 'Slovenia', nameBn: 'স্লোভেনিয়া', code: 'SI', dialCode: '+386', flag: '🇸🇮', phoneLength: 8, placeholder: '31 234 567', example: '+386 31 234 567' },
  { name: 'Lithuania', nameBn: 'লিথুয়ানিয়া', code: 'LT', dialCode: '+370', flag: '🇱🇹', phoneLength: 8, placeholder: '612 34567', example: '+370 612 34567' },
  { name: 'Latvia', nameBn: 'লাটভিয়া', code: 'LV', dialCode: '+371', flag: '🇱🇻', phoneLength: 8, placeholder: '2123 4567', example: '+371 2123 4567' },
  { name: 'Estonia', nameBn: 'এস্তোনিয়া', code: 'EE', dialCode: '+372', flag: '🇪🇪', phoneLength: 8, phoneMinLength: 7, phoneMaxLength: 8, placeholder: '5123 4567', example: '+372 5123 4567' },
  { name: 'Luxembourg', nameBn: 'লাক্সেমবার্গ', code: 'LU', dialCode: '+352', flag: '🇱🇺', phoneLength: 9, placeholder: '621 123 456', example: '+352 621 123 456' },
  { name: 'Malta', nameBn: 'মাল্টা', code: 'MT', dialCode: '+356', flag: '🇲🇹', phoneLength: 8, placeholder: '9912 3456', example: '+356 9912 3456' },
  { name: 'Iceland', nameBn: 'আইসল্যান্ড', code: 'IS', dialCode: '+354', flag: '🇮🇸', phoneLength: 7, placeholder: '612 3456', example: '+354 612 3456' },
  { name: 'Ukraine', nameBn: 'ইউক্রেন', code: 'UA', dialCode: '+380', flag: '🇺🇦', phoneLength: 9, placeholder: '50 123 4567', example: '+380 50 123 4567' },
  { name: 'Russia', nameBn: 'রাশিয়া', code: 'RU', dialCode: '+7', flag: '🇷🇺', phoneLength: 10, placeholder: '912 345-67-89', example: '+7 912 345-67-89' },
  { name: 'Belarus', nameBn: 'বেলারুশ', code: 'BY', dialCode: '+375', flag: '🇧🇾', phoneLength: 9, placeholder: '29 123 4567', example: '+375 29 123 4567' },
  { name: 'Serbia', nameBn: 'সার্বিয়া', code: 'RS', dialCode: '+381', flag: '🇷🇸', phoneLength: 9, placeholder: '60 123 4567', example: '+381 60 123 4567' },
  { name: 'Bosnia and Herzegovina', nameBn: 'বসনিয়া ও হার্জেগোভিনা', code: 'BA', dialCode: '+387', flag: '🇧🇦', phoneLength: 8, placeholder: '61 123 456', example: '+387 61 123 456' },
  { name: 'Albania', nameBn: 'আলবেনিয়া', code: 'AL', dialCode: '+355', flag: '🇦🇱', phoneLength: 9, placeholder: '67 123 4567', example: '+355 67 123 4567' },
  { name: 'North Macedonia', nameBn: 'উত্তর মেসিডোনিয়া', code: 'MK', dialCode: '+389', flag: '🇲🇰', phoneLength: 8, placeholder: '70 123 456', example: '+389 70 123 456' },
  { name: 'Montenegro', nameBn: 'মন্টিনিগ্রো', code: 'ME', dialCode: '+382', flag: '🇲🇪', phoneLength: 8, placeholder: '67 123 456', example: '+382 67 123 456' },
  { name: 'Moldova', nameBn: 'মলদোভা', code: 'MD', dialCode: '+373', flag: '🇲🇩', phoneLength: 8, placeholder: '60 123 456', example: '+373 60 123 456' },
  { name: 'Kosovo', nameBn: 'কসোভো', code: 'XK', dialCode: '+383', flag: '🇽🇰', phoneLength: 8, placeholder: '44 123 456', example: '+383 44 123 456' },
  { name: 'Monaco', nameBn: 'মোনাকো', code: 'MC', dialCode: '+377', flag: '🇲🇨', phoneLength: 8, placeholder: '6 12 34 56 78', example: '+377 6 12 34 56 78' },
  { name: 'Andorra', nameBn: 'অ্যান্ডোরা', code: 'AD', dialCode: '+376', flag: '🇦🇩', phoneLength: 6, placeholder: '312 345', example: '+376 312 345' },
  { name: 'Liechtenstein', nameBn: 'লিশটেনস্টাইন', code: 'LI', dialCode: '+423', flag: '🇱🇮', phoneLength: 7, placeholder: '660 1234', example: '+423 660 1234' },
  { name: 'San Marino', nameBn: 'সান মারিনো', code: 'SM', dialCode: '+378', flag: '🇸🇲', phoneLength: 10, placeholder: '66 123 456', example: '+378 66 123 456' },
  { name: 'Vatican City', nameBn: 'ভ্যাটিকান সিটি', code: 'VA', dialCode: '+39', flag: '🇻🇦', phoneLength: 10, placeholder: '06 698 12345', example: '+39 06 698 12345' },

  // Americas (North, Central, South & Caribbean)
  { name: 'United States', nameBn: 'যুক্তরাষ্ট্র (USA)', code: 'US', dialCode: '+1', flag: '🇺🇸', phoneLength: 10, placeholder: '202 555 0123', example: '+1 202 555 0123' },
  { name: 'Canada', nameBn: 'কানাডা', code: 'CA', dialCode: '+1', flag: '🇨🇦', phoneLength: 10, placeholder: '416 555 0123', example: '+1 416 555 0123' },
  { name: 'Mexico', nameBn: 'মেক্সিকো', code: 'MX', dialCode: '+52', flag: '🇲🇽', phoneLength: 10, placeholder: '55 1234 5678', example: '+52 55 1234 5678' },
  { name: 'Brazil', nameBn: 'ব্রাজিল', code: 'BR', dialCode: '+55', flag: '🇧🇷', phoneLength: 11, placeholder: '11 91234 5678', example: '+55 11 91234 5678' },
  { name: 'Argentina', nameBn: 'আর্জেন্টিনা', code: 'AR', dialCode: '+54', flag: '🇦🇷', phoneLength: 10, placeholder: '9 11 1234 5678', example: '+54 9 11 1234 5678' },
  { name: 'Colombia', nameBn: 'কলম্বিয়া', code: 'CO', dialCode: '+57', flag: '🇨🇴', phoneLength: 10, placeholder: '300 123 4567', example: '+57 300 123 4567' },
  { name: 'Chile', nameBn: 'চিলি', code: 'CL', dialCode: '+56', flag: '🇨🇱', phoneLength: 9, placeholder: '9 1234 5678', example: '+56 9 1234 5678' },
  { name: 'Peru', nameBn: 'পেরু', code: 'PE', dialCode: '+51', flag: '🇵🇪', phoneLength: 9, placeholder: '912 345 678', example: '+51 912 345 678' },
  { name: 'Venezuela', nameBn: 'ভেনেজুয়েলা', code: 'VE', dialCode: '+58', flag: '🇻🇪', phoneLength: 10, placeholder: '412 1234567', example: '+58 412 1234567' },
  { name: 'Ecuador', nameBn: 'ইকুয়েডর', code: 'EC', dialCode: '+593', flag: '🇪🇨', phoneLength: 9, placeholder: '99 123 4567', example: '+593 99 123 4567' },
  { name: 'Bolivia', nameBn: 'বলিভিয়া', code: 'BO', dialCode: '+591', flag: '🇧🇴', phoneLength: 8, placeholder: '7123 4567', example: '+591 7123 4567' },
  { name: 'Paraguay', nameBn: 'প্যারাগুয়ে', code: 'PY', dialCode: '+595', flag: '🇵🇾', phoneLength: 9, placeholder: '981 123 456', example: '+595 981 123 456' },
  { name: 'Uruguay', nameBn: 'উরুগুয়ে', code: 'UY', dialCode: '+598', flag: '🇺🇾', phoneLength: 8, placeholder: '99 123 456', example: '+598 99 123 456' },
  { name: 'Guyana', nameBn: 'গায়ানা', code: 'GY', dialCode: '+592', flag: '🇬🇾', phoneLength: 7, placeholder: '612 3456', example: '+592 612 3456' },
  { name: 'Suriname', nameBn: 'সুরিনাম', code: 'SR', dialCode: '+597', flag: '🇸🇷', phoneLength: 7, placeholder: '712 3456', example: '+597 712 3456' },
  { name: 'Panama', nameBn: 'পানামা', code: 'PA', dialCode: '+507', flag: '🇵🇦', phoneLength: 8, placeholder: '6123 4567', example: '+507 6123 4567' },
  { name: 'Costa Rica', nameBn: 'কোস্টারিকা', code: 'CR', dialCode: '+506', flag: '🇨🇷', phoneLength: 8, placeholder: '8312 3456', example: '+506 8312 3456' },
  { name: 'Guatemala', nameBn: 'গুয়াতেমালা', code: 'GT', dialCode: '+502', flag: '🇬🇹', phoneLength: 8, placeholder: '5123 4567', example: '+502 5123 4567' },
  { name: 'Honduras', nameBn: 'হন্ডুরাস', code: 'HN', dialCode: '+504', flag: '🇭🇳', phoneLength: 8, placeholder: '9123 4567', example: '+504 9123 4567' },
  { name: 'El Salvador', nameBn: 'এল সালভাদর', code: 'SV', dialCode: '+503', flag: '🇸🇻', phoneLength: 8, placeholder: '7123 4567', example: '+503 7123 4567' },
  { name: 'Nicaragua', nameBn: 'নিকারাগুয়া', code: 'NI', dialCode: '+505', flag: '🇳🇮', phoneLength: 8, placeholder: '8123 4567', example: '+505 8123 4567' },
  { name: 'Belize', nameBn: 'বেলিজ', code: 'BZ', dialCode: '+501', flag: '🇧🇿', phoneLength: 7, placeholder: '612 3456', example: '+501 612 3456' },
  { name: 'Cuba', nameBn: 'কিউবা', code: 'CU', dialCode: '+53', flag: '🇨🇺', phoneLength: 8, placeholder: '5 123 4567', example: '+53 5 123 4567' },
  { name: 'Dominican Republic', nameBn: 'ডোমিনিকান প্রজাতন্ত্র', code: 'DO', dialCode: '+1-809', flag: '🇩🇴', phoneLength: 10, placeholder: '809 234 5678', example: '+1-809 234 5678' },
  { name: 'Haiti', nameBn: 'হাইতি', code: 'HT', dialCode: '+509', flag: '🇭🇹', phoneLength: 8, placeholder: '34 12 3456', example: '+509 34 12 3456' },
  { name: 'Jamaica', nameBn: 'জ্যামাইকা', code: 'JM', dialCode: '+1-876', flag: '🇯🇲', phoneLength: 10, placeholder: '876 234 5678', example: '+1-876 234 5678' },
  { name: 'Trinidad and Tobago', nameBn: 'ত্রিনিদাদ ও টোবাগো', code: 'TT', dialCode: '+1-868', flag: '🇹🇹', phoneLength: 10, placeholder: '868 234 5678', example: '+1-868 234 5678' },
  { name: 'Bahamas', nameBn: 'বাহামা দ্বীপপুঞ্জ', code: 'BS', dialCode: '+1-242', flag: '🇧🇸', phoneLength: 10, placeholder: '242 345 6789', example: '+1-242 345 6789' },
  { name: 'Barbados', nameBn: 'বার্বাডোজ', code: 'BB', dialCode: '+1-246', flag: '🇧🇧', phoneLength: 10, placeholder: '246 234 5678', example: '+1-246 234 5678' },
  { name: 'Saint Lucia', nameBn: 'সেন্ট লুসিয়া', code: 'LC', dialCode: '+1-758', flag: '🇱🇨', phoneLength: 10, placeholder: '758 234 5678', example: '+1-758 234 5678' },
  { name: 'Grenada', nameBn: 'গ্রেনাডা', code: 'GD', dialCode: '+1-473', flag: '🇬🇩', phoneLength: 10, placeholder: '473 234 5678', example: '+1-473 234 5678' },
  { name: 'Antigua and Barbuda', nameBn: 'অ্যান্টিগুয়া ও বার্বুডা', code: 'AG', dialCode: '+1-268', flag: '🇦🇬', phoneLength: 10, placeholder: '268 234 5678', example: '+1-268 234 5678' },
  { name: 'Dominica', nameBn: 'ডোমিনিকা', code: 'DM', dialCode: '+1-767', flag: '🇩🇲', phoneLength: 10, placeholder: '767 234 5678', example: '+1-767 234 5678' },
  { name: 'Saint Kitts and Nevis', nameBn: 'সেন্ট কিটস ও নেভিস', code: 'KN', dialCode: '+1-869', flag: '🇰🇳', phoneLength: 10, placeholder: '869 234 5678', example: '+1-869 234 5678' },
  { name: 'Saint Vincent', nameBn: 'সেন্ট ভিনসেন্ট', code: 'VC', dialCode: '+1-784', flag: '🇻🇨', phoneLength: 10, placeholder: '784 234 5678', example: '+1-784 234 5678' },

  // Oceania
  { name: 'Australia', nameBn: 'অস্ট্রেলিয়া', code: 'AU', dialCode: '+61', flag: '🇦🇺', phoneLength: 9, placeholder: '412 345 678', example: '+61 412 345 678' },
  { name: 'New Zealand', nameBn: 'নিউজিল্যান্ড', code: 'NZ', dialCode: '+64', flag: '🇳🇿', phoneLength: 9, phoneMinLength: 8, phoneMaxLength: 10, placeholder: '21 123 4567', example: '+64 21 123 4567' },
  { name: 'Fiji', nameBn: 'ফিজি', code: 'FJ', dialCode: '+679', flag: '🇫🇯', phoneLength: 7, placeholder: '701 2345', example: '+679 701 2345' },
  { name: 'Papua New Guinea', nameBn: 'পাপুয়া নিউগিনি', code: 'PG', dialCode: '+675', flag: '🇵🇬', phoneLength: 8, placeholder: '7123 4567', example: '+675 7123 4567' },
  { name: 'Solomon Islands', nameBn: 'সলোমন দ্বীপপুঞ্জ', code: 'SB', dialCode: '+677', flag: '🇸🇧', phoneLength: 7, placeholder: '741 2345', example: '+677 741 2345' },
  { name: 'Vanuatu', nameBn: 'ভানুয়াতু', code: 'VU', dialCode: '+678', flag: '🇻🇺', phoneLength: 7, placeholder: '591 2345', example: '+678 591 2345' },
  { name: 'Samoa', nameBn: 'সামোয়া', code: 'WS', dialCode: '+685', flag: '🇼🇸', phoneLength: 7, placeholder: '721 2345', example: '+685 721 2345' },
  { name: 'Tonga', nameBn: 'টোঙ্গা', code: 'TO', dialCode: '+676', flag: '🇹🇴', phoneLength: 5, placeholder: '71234', example: '+676 71234' },

  // Africa
  { name: 'Egypt', nameBn: 'মিশর', code: 'EG', dialCode: '+20', flag: '🇪🇬', phoneLength: 10, placeholder: '10 1234 5678', example: '+20 10 1234 5678' },
  { name: 'South Africa', nameBn: 'দক্ষিণ আফ্রিকা', code: 'ZA', dialCode: '+27', flag: '🇿🇦', phoneLength: 9, placeholder: '71 123 4567', example: '+27 71 123 4567' },
  { name: 'Nigeria', nameBn: 'নাইজেরিয়া', code: 'NG', dialCode: '+234', flag: '🇳🇬', phoneLength: 10, placeholder: '802 123 4567', example: '+234 802 123 4567' },
  { name: 'Kenya', nameBn: 'কেনিয়া', code: 'KE', dialCode: '+254', flag: '🇰🇪', phoneLength: 9, placeholder: '712 345678', example: '+254 712 345678' },
  { name: 'Morocco', nameBn: 'মরক্কো', code: 'MA', dialCode: '+212', flag: '🇲🇦', phoneLength: 9, placeholder: '612 345678', example: '+212 612 345678' },
  { name: 'Algeria', nameBn: 'আলজেরিয়া', code: 'DZ', dialCode: '+213', flag: '🇩🇿', phoneLength: 9, placeholder: '551 234 567', example: '+213 551 234 567' },
  { name: 'Tunisia', nameBn: 'তিউনিসিয়া', code: 'TN', dialCode: '+216', flag: '🇹🇳', phoneLength: 8, placeholder: '20 123 456', example: '+216 20 123 456' },
  { name: 'Libya', nameBn: 'লিবিয়া', code: 'LY', dialCode: '+218', flag: '🇱🇾', phoneLength: 9, placeholder: '91 123 4567', example: '+218 91 123 4567' },
  { name: 'Sudan', nameBn: 'সুদান', code: 'SD', dialCode: '+249', flag: '🇸🇩', phoneLength: 9, placeholder: '91 123 4567', example: '+249 91 123 4567' },
  { name: 'South Sudan', nameBn: 'দক্ষিণ সুদান', code: 'SS', dialCode: '+211', flag: '🇸🇸', phoneLength: 9, placeholder: '92 123 4567', example: '+211 92 123 4567' },
  { name: 'Ethiopia', nameBn: 'ইথিওপিয়া', code: 'ET', dialCode: '+251', flag: '🇪🇹', phoneLength: 9, placeholder: '91 123 4567', example: '+251 91 123 4567' },
  { name: 'Ghana', nameBn: 'ঘানা', code: 'GH', dialCode: '+233', flag: '🇬🇭', phoneLength: 9, placeholder: '24 123 4567', example: '+233 24 123 4567' },
  { name: 'Uganda', nameBn: 'উগান্ডা', code: 'UG', dialCode: '+256', flag: '🇺🇬', phoneLength: 9, placeholder: '772 123456', example: '+256 772 123456' },
  { name: 'Tanzania', nameBn: 'তানজানিয়া', code: 'TZ', dialCode: '+255', flag: '🇹🇿', phoneLength: 9, placeholder: '712 345 678', example: '+255 712 345 678' },
  { name: 'Rwanda', nameBn: 'রুয়ান্ডা', code: 'RW', dialCode: '+250', flag: '🇷🇼', phoneLength: 9, placeholder: '788 123 456', example: '+250 788 123 456' },
  { name: 'Senegal', nameBn: 'সেনেগাল', code: 'SN', dialCode: '+221', flag: '🇸🇳', phoneLength: 9, placeholder: '77 123 45 67', example: '+221 77 123 45 67' },
  { name: 'Ivory Coast', nameBn: 'আইভরি কোস্ট', code: 'CI', dialCode: '+225', flag: '🇨🇮', phoneLength: 10, placeholder: '07 12 34 56 78', example: '+225 07 12 34 56 78' },
  { name: 'Cameroon', nameBn: 'ক্যামেরুন', code: 'CM', dialCode: '+237', flag: '🇨🇲', phoneLength: 9, placeholder: '6 71 23 45 67', example: '+237 6 71 23 45 67' },
  { name: 'Mauritius', nameBn: 'মরিশাস', code: 'MU', dialCode: '+230', flag: '🇲🇺', phoneLength: 8, placeholder: '5123 4567', example: '+230 5123 4567' },
  { name: 'Madagascar', nameBn: 'মাদাগাস্কার', code: 'MG', dialCode: '+261', flag: '🇲🇬', phoneLength: 9, placeholder: '32 12 345 67', example: '+261 32 12 345 67' },
  { name: 'Angola', nameBn: 'অ্যাঙ্গোলা', code: 'AO', dialCode: '+244', flag: '🇦🇴', phoneLength: 9, placeholder: '923 123 456', example: '+244 923 123 456' },
  { name: 'Zambia', nameBn: 'জাম্বিয়া', code: 'ZM', dialCode: '+260', flag: '🇿🇲', phoneLength: 9, placeholder: '97 1234567', example: '+260 97 1234567' },
  { name: 'Zimbabwe', nameBn: 'জিম্বাবুয়ে', code: 'ZW', dialCode: '+263', flag: '🇿🇼', phoneLength: 9, placeholder: '77 123 4567', example: '+263 77 123 4567' },
  { name: 'Botswana', nameBn: 'বতসোয়ানা', code: 'BW', dialCode: '+267', flag: '🇧🇼', phoneLength: 8, placeholder: '71 234 567', example: '+267 71 234 567' },
  { name: 'Namibia', nameBn: 'নামিবিয়া', code: 'NA', dialCode: '+264', flag: '🇳🇦', phoneLength: 8, placeholder: '81 123 4567', example: '+264 81 123 4567' },
  { name: 'Mozambique', nameBn: 'মোজাম্বিক', code: 'MZ', dialCode: '+258', flag: '🇲🇿', phoneLength: 9, placeholder: '84 123 4567', example: '+258 84 123 4567' },
  { name: 'Somalia', nameBn: 'সোমালিয়া', code: 'SO', dialCode: '+252', flag: '🇸🇴', phoneLength: 8, placeholder: '61 123 456', example: '+252 61 123 456' },
  { name: 'Djibouti', nameBn: 'জিবুতি', code: 'DJ', dialCode: '+253', flag: '🇩🇯', phoneLength: 8, placeholder: '77 12 34 56', example: '+253 77 12 34 56' },
  { name: 'Mauritania', nameBn: 'মৌরিতানিয়া', code: 'MR', dialCode: '+222', flag: '🇲🇷', phoneLength: 8, placeholder: '46 12 34 56', example: '+222 46 12 34 56' },
  { name: 'Mali', nameBn: 'মালি', code: 'ML', dialCode: '+223', flag: '🇲🇱', phoneLength: 8, placeholder: '65 12 34 56', example: '+223 65 12 34 56' },
  { name: 'Niger', nameBn: 'নাইজার', code: 'NE', dialCode: '+227', flag: '🇳🇪', phoneLength: 8, placeholder: '90 12 34 56', example: '+227 90 12 34 56' },
  { name: 'Chad', nameBn: 'চাদ', code: 'TD', dialCode: '+235', flag: '🇹🇩', phoneLength: 8, placeholder: '66 12 34 56', example: '+235 66 12 34 56' },
  { name: 'Burkina Faso', nameBn: 'বুর্কিনা ফাসো', code: 'BF', dialCode: '+226', flag: '🇧🇫', phoneLength: 8, placeholder: '70 12 34 56', example: '+226 70 12 34 56' },
  { name: 'Guinea', nameBn: 'গিনি', code: 'GN', dialCode: '+224', flag: '🇬🇳', phoneLength: 9, placeholder: '622 12 34 56', example: '+224 622 12 34 56' },
  { name: 'Benin', nameBn: 'বেনিন', code: 'BJ', dialCode: '+229', flag: '🇧🇯', phoneLength: 8, placeholder: '97 12 34 56', example: '+229 97 12 34 56' },
  { name: 'Togo', nameBn: 'টোগো', code: 'TG', dialCode: '+228', flag: '🇹🇬', phoneLength: 8, placeholder: '90 12 34 56', example: '+228 90 12 34 56' },
  { name: 'Sierra Leone', nameBn: 'সিয়েরা লিওন', code: 'SL', dialCode: '+232', flag: '🇸🇱', phoneLength: 8, placeholder: '76 123 456', example: '+232 76 123 456' },
  { name: 'Liberia', nameBn: 'লাইবেরিয়া', code: 'LR', dialCode: '+231', flag: '🇱🇷', phoneLength: 8, placeholder: '77 123 456', example: '+231 77 123 456' },
  { name: 'Gambia', nameBn: 'গাম্বিয়া', code: 'GM', dialCode: '+220', flag: '🇬🇲', phoneLength: 7, placeholder: '712 3456', example: '+220 712 3456' },
  { name: 'Congo (DRC)', nameBn: 'কঙ্গো (ডিআরসি)', code: 'CD', dialCode: '+243', flag: '🇨🇩', phoneLength: 9, placeholder: '81 123 4567', example: '+243 81 123 4567' },
  { name: 'Congo (Republic)', nameBn: 'কঙ্গো প্রজাতন্ত্র', code: 'CG', dialCode: '+242', flag: '🇨🇬', phoneLength: 9, placeholder: '06 123 4567', example: '+242 06 123 4567' },
  { name: 'Gabon', nameBn: 'গ্যাবন', code: 'GA', dialCode: '+241', flag: '🇬🇦', phoneLength: 8, placeholder: '06 12 34 56', example: '+241 06 12 34 56' },
  { name: 'Equatorial Guinea', nameBn: 'নিরক্ষীয় গিনি', code: 'GQ', dialCode: '+240', flag: '🇬🇶', phoneLength: 9, placeholder: '222 123 456', example: '+240 222 123 456' },
  { name: 'Central African Republic', nameBn: 'মধ্য আফ্রিকান প্রজাতন্ত্র', code: 'CF', dialCode: '+236', flag: '🇨🇫', phoneLength: 8, placeholder: '70 12 34 56', example: '+236 70 12 34 56' },
  { name: 'Eritrea', nameBn: 'ইরিত্রিয়া', code: 'ER', dialCode: '+291', flag: '🇪🇷', phoneLength: 7, placeholder: '7 123 456', example: '+291 7 123 456' },
  { name: 'Malawi', nameBn: 'মালাউই', code: 'MW', dialCode: '+265', flag: '🇲🇼', phoneLength: 9, placeholder: '99 123 4567', example: '+265 99 123 4567' },
  { name: 'Lesotho', nameBn: 'লেসোথো', code: 'LS', dialCode: '+266', flag: '🇱🇸', phoneLength: 8, placeholder: '5812 3456', example: '+266 5812 3456' },
  { name: 'Eswatini (Swaziland)', nameBn: 'এসওয়াতিনি (সোয়াজিল্যান্ড)', code: 'SZ', dialCode: '+268', flag: '🇸🇿', phoneLength: 8, placeholder: '7612 3456', example: '+268 7612 3456' },
  { name: 'Seychelles', nameBn: 'সিসেলস', code: 'SC', dialCode: '+248', flag: '🇸🇨', phoneLength: 7, placeholder: '251 2345', example: '+248 251 2345' },
  { name: 'Comoros', nameBn: 'কমোরোস', code: 'KM', dialCode: '+269', flag: '🇰🇲', phoneLength: 7, placeholder: '321 2345', example: '+269 321 2345' },
  { name: 'Cape Verde', nameBn: 'কেপ ভার্দে', code: 'CV', dialCode: '+238', flag: '🇨🇻', phoneLength: 7, placeholder: '991 2345', example: '+238 991 2345' },
  { name: 'Sao Tome and Principe', nameBn: 'সাও তোমে ও প্রিন্সিপে', code: 'ST', dialCode: '+239', flag: '🇸🇹', phoneLength: 7, placeholder: '991 2345', example: '+239 991 2345' }
];

export const COUNTRY_CITY_MAP: Record<string, string[]> = {
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Al Khobar', 'Jubail', 'Tabuk', 'Taif', 'Yanbu', 'Abha', 'Najran', 'Buraidah', 'Khamis Mushait', 'Al Hasa'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Noakhali', 'Brahmanbaria', 'Gazipur', 'Narayanganj', 'Cox\'s Bazar', 'Tangail', 'Faridpur', 'Bogra', 'Jessore', 'Feni', 'Pabna'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain', 'Fujairah', 'Umm Al Quwain'],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Mesaieed'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Seeb', 'Barka', 'Ibri'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Ahmadi', 'Jahra', 'Fahaheel'],
  'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'A\'ali', 'Isa Town'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Shah Alam', 'Petaling Jaya', 'Ipoh', 'Malacca', 'Kota Kinabalu', 'Kuching'],
  'Singapore': ['Singapore', 'Jurong', 'Tampines', 'Woodlands', 'Yishun', 'Bedok'],
  'India': ['New Delhi', 'Mumbai', 'Kolkata', 'Bangalore', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Pune', 'Kochi', 'Lucknow'],
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot'],
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Oldham', 'Leeds', 'Luton', 'Cardiff', 'Glasgow', 'Edinburgh', 'Liverpool', 'Newcastle'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Paterson', 'Dallas', 'Detroit', 'Philadelphia', 'Atlanta', 'San Francisco', 'Miami'],
  'Italy': ['Rome', 'Milan', 'Venice', 'Bologna', 'Naples', 'Florence', 'Turin', 'Palermo', 'Genoa', 'Verona'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City', 'Halifax'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast', 'Hobart'],
  'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dortmund'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma'],
  'Portugal': ['Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Coimbra', 'Funchal'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Mansoura'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'],
  'Japan': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kyoto', 'Kobe'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus'],
  'Ireland': ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Drogheda'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro'],
  'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'],
  'Finland': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne'],
  'Austria': ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt'],
  'Poland': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'],
  'Jordan': ['Amman', 'Zarqa', 'Irbid', 'Russeifa', 'Aqaba'],
  'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Nabatieh', 'Zahle'],
  'Iraq': ['Baghdad', 'Basra', 'Erbil', 'Najaf', 'Karbala', 'Sulaymaniyah', 'Mosul'],
  'Sri Lanka': ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Batticaloa'],
  'Nepal': ['Kathmandu', 'Pokhara', 'Lalitpur', 'Biratnagar', 'Bharatpur', 'Birgunj'],
  'Maldives': ['Malé', 'Hulhumalé', 'Fuvahmulah', 'Addu City'],
  'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bekasi', 'Semarang', 'Tangerang', 'Depok'],
  'Philippines': ['Manila', 'Quezon City', 'Davao City', 'Cebu City', 'Caloocan', 'Zamboanga City'],
  'Thailand': ['Bangkok', 'Nonthaburi', 'Chiang Mai', 'Phuket', 'Pattaya', 'Hat Yai'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho', 'Nha Trang']
};

export function getCitiesForCountry(countryName: string): string[] {
  if (!countryName) return [];
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
  if (!dialCode) return undefined;
  const clean = dialCode.trim();
  // Exact match
  const exact = COUNTRY_DIAL_CODES.find(c => c.dialCode === clean);
  if (exact) return exact;
  // Match prefix
  return COUNTRY_DIAL_CODES.find(c => clean.startsWith(c.dialCode));
}

export function findCountryByName(name: string): CountryDialInfo | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return COUNTRY_DIAL_CODES.find(
    c => c.name.toLowerCase() === clean || c.nameBn.toLowerCase() === clean || c.code.toLowerCase() === clean
  );
}

/**
 * Filter countries by search query (supports English, Bengali, Code or Dial Code)
 */
export function filterCountries(query: string): CountryDialInfo[] {
  if (!query || !query.trim()) {
    return COUNTRY_DIAL_CODES;
  }
  const q = query.trim().toLowerCase();
  return COUNTRY_DIAL_CODES.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.nameBn.toLowerCase().includes(q) ||
    c.dialCode.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q)
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
    // Generic validation: min 6, max 15 digits
    if (cleanDigits.length < 6 || cleanDigits.length > 15) {
      return {
        valid: false,
        message: 'Phone number must be between 6 and 15 digits',
        messageBn: 'ফোন নম্বর অবশ্যই ৬ থেকে ১৫ ডিজিটের হতে হবে'
      };
    }
  }

  return { valid: true };
}
