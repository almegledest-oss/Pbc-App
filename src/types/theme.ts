export interface AppTheme {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  isDefault?: boolean;
  mode: 'dark' | 'light';
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    border: string;
  };
  cssVariables: {
    '--theme-bg-main': string;
    '--theme-card-bg': string;
    '--theme-accent-gold': string;
    '--theme-accent-hover': string;
    '--theme-accent-glow': string;
    '--theme-surface-dark': string;
    '--theme-nav-active': string;
    '--theme-border': string;
  };
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'pbc-royal-gold',
    name: 'PBC Royal Navy & Gold',
    nameBn: 'রয়েল নেভি ও গোল্ড (ডিফল্ট মূল ডার্ক থিম)',
    description: 'Official PBC Club default colorway with deep navy canvas and luxury golden accents.',
    isDefault: true,
    mode: 'dark',
    previewColors: {
      bg: '#070D1B',
      card: '#0B1528',
      accent: '#D4AF37',
      border: 'rgba(212, 175, 55, 0.4)'
    },
    cssVariables: {
      '--theme-bg-main': '#070D1B',
      '--theme-card-bg': '#0B1528',
      '--theme-accent-gold': '#D4AF37',
      '--theme-accent-hover': '#F59E0B',
      '--theme-accent-glow': 'rgba(212, 175, 55, 0.25)',
      '--theme-surface-dark': '#070D1B',
      '--theme-nav-active': '#112244',
      '--theme-border': 'rgba(212, 175, 55, 0.3)'
    }
  },
  {
    id: 'pearl-white-gold',
    name: 'PBC Ivory White & Royal Gold',
    nameBn: 'আইভরি হোয়াইট ও রয়েল গোল্ড (হোয়াইট-গোল্ডেন লাক্সারি থিম)',
    description: 'Official luxury light mode with crisp snow-white cards, golden framed borders, dark navy typography, and emerald/blue/gold indicators.',
    isDefault: false,
    mode: 'light',
    previewColors: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#D97706',
      border: 'rgba(217, 119, 6, 0.5)'
    },
    cssVariables: {
      '--theme-bg-main': '#F8FAFC',
      '--theme-card-bg': '#FFFFFF',
      '--theme-accent-gold': '#D97706',
      '--theme-accent-hover': '#B45309',
      '--theme-accent-glow': 'rgba(217, 119, 6, 0.2)',
      '--theme-surface-dark': '#F1F5F9',
      '--theme-nav-active': '#FEF3C7',
      '--theme-border': 'rgba(217, 119, 6, 0.45)'
    }
  },
  {
    id: 'ivory-executive',
    name: 'Pure Ivory & Classic Navy',
    nameBn: 'আইভরি হোয়াইট ও ক্লাসিক নেভি (লাইট থিম)',
    description: 'Premium light executive theme with crisp snow-white cards, royal blue accents and dark contrast.',
    isDefault: false,
    mode: 'light',
    previewColors: {
      bg: '#EEF2F6',
      card: '#FFFFFF',
      accent: '#2563EB',
      border: 'rgba(37, 99, 235, 0.3)'
    },
    cssVariables: {
      '--theme-bg-main': '#EEF2F6',
      '--theme-card-bg': '#FFFFFF',
      '--theme-accent-gold': '#2563EB',
      '--theme-accent-hover': '#1D4ED8',
      '--theme-accent-glow': 'rgba(37, 99, 235, 0.2)',
      '--theme-surface-dark': '#E2E8F0',
      '--theme-nav-active': '#DBEAFE',
      '--theme-border': 'rgba(37, 99, 235, 0.3)'
    }
  },
  {
    id: 'emerald-prestige',
    name: 'Emerald Prestige',
    nameBn: 'প্রেস্টিজ এমারেল্ড গ্রিন (ডার্ক থিম)',
    description: 'Rich dark emerald green canvas with bright jade & gold highlights for wealth & growth.',
    mode: 'dark',
    previewColors: {
      bg: '#041410',
      card: '#08231C',
      accent: '#10B981',
      border: 'rgba(16, 185, 129, 0.4)'
    },
    cssVariables: {
      '--theme-bg-main': '#041410',
      '--theme-card-bg': '#08231C',
      '--theme-accent-gold': '#10B981',
      '--theme-accent-hover': '#34D399',
      '--theme-accent-glow': 'rgba(16, 185, 129, 0.25)',
      '--theme-surface-dark': '#041410',
      '--theme-nav-active': '#0E362B',
      '--theme-border': 'rgba(16, 185, 129, 0.35)'
    }
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    nameBn: 'মিডনাইট টাইটানিয়াম ও অবসিডিয়ান (ডার্ক থিম)',
    description: 'Ultra sleek black obsidian base paired with platinum sky blue indicators.',
    mode: 'dark',
    previewColors: {
      bg: '#0A0D12',
      card: '#121720',
      accent: '#38BDF8',
      border: 'rgba(56, 189, 248, 0.4)'
    },
    cssVariables: {
      '--theme-bg-main': '#0A0D12',
      '--theme-card-bg': '#121720',
      '--theme-accent-gold': '#38BDF8',
      '--theme-accent-hover': '#60A5FA',
      '--theme-accent-glow': 'rgba(56, 189, 248, 0.25)',
      '--theme-surface-dark': '#0A0D12',
      '--theme-nav-active': '#1E293B',
      '--theme-border': 'rgba(56, 189, 248, 0.3)'
    }
  },
  {
    id: 'executive-ruby',
    name: 'Executive Ruby',
    nameBn: 'এক্সিকিউটিভ রুবি মেরুন (ডার্ক থিম)',
    description: 'Deep royal maroon background with warm ruby and champagne accents.',
    mode: 'dark',
    previewColors: {
      bg: '#16080C',
      card: '#230D13',
      accent: '#F43F5E',
      border: 'rgba(244, 63, 94, 0.4)'
    },
    cssVariables: {
      '--theme-bg-main': '#16080C',
      '--theme-card-bg': '#230D13',
      '--theme-accent-gold': '#F43F5E',
      '--theme-accent-hover': '#FB7185',
      '--theme-accent-glow': 'rgba(244, 63, 94, 0.25)',
      '--theme-surface-dark': '#16080C',
      '--theme-nav-active': '#34131C',
      '--theme-border': 'rgba(244, 63, 94, 0.35)'
    }
  },
  {
    id: 'deep-sapphire',
    name: 'Deep Sapphire',
    nameBn: 'ক্লাসিক স্যাফায়ার ব্লু (ডার্ক থিম)',
    description: 'High-contrast sapphire blue theme with luminous azure indicators.',
    mode: 'dark',
    previewColors: {
      bg: '#060E1E',
      card: '#0C1B38',
      accent: '#60A5FA',
      border: 'rgba(96, 165, 250, 0.4)'
    },
    cssVariables: {
      '--theme-bg-main': '#060E1E',
      '--theme-card-bg': '#0C1B38',
      '--theme-accent-gold': '#60A5FA',
      '--theme-accent-hover': '#93C5FD',
      '--theme-accent-glow': 'rgba(96, 165, 250, 0.25)',
      '--theme-surface-dark': '#060E1E',
      '--theme-nav-active': '#132850',
      '--theme-border': 'rgba(96, 165, 250, 0.35)'
    }
  }
];

export const DEFAULT_THEME_ID = 'pbc-royal-gold';
