import { QuoteItem } from '../types';

export const INITIAL_QUOTES: QuoteItem[] = [
  {
    id: 'QUOTE-101',
    quote: 'আপনি যত বেশি ঘাম ঝরাবেন, শরীর তত ক্লান্ত হবে কিন্তু টাকা যদি সঠিক জায়গায় কাজে লাগান, সে আপনাকে ক্লান্ত না করে আয় এনে দিবে।',
    quoteBn: 'আপনি যত বেশি ঘাম ঝরাবেন, শরীর তত ক্লান্ত হবে কিন্তু টাকা যদি সঠিক জায়গায় কাজে লাগান, সে আপনাকে ক্লান্ত না করে আয় এনে দিবে।',
    author: 'Shakil Rana',
    authorDesignation: 'Director & Investor, PBC',
    category: 'Investment',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'QUOTE-102',
    quote: 'প্রবাসী হিসেবে অর্জিত প্রতিটা টাকার সঠিক বিনিয়োগই আপনার ভবিষ্যৎ ও পরিবারের আসল আর্থিক নিরাপত্তা।',
    quoteBn: 'প্রবাসী হিসেবে অর্জিত প্রতিটা টাকার সঠিক বিনিয়োগই আপনার ভবিষ্যৎ ও পরিবারের আসল আর্থিক নিরাপত্তা।',
    author: 'Probashi Business Club',
    authorDesignation: 'Executive Council',
    category: 'Motivation',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'QUOTE-103',
    quote: 'একক প্রচেষ্টায় যা কঠিন, সমমনা প্রবাসীদের যৌথ মূলধনী ব্যবসায় তা অনেক সহজ ও টেকসই লাভজনক।',
    quoteBn: 'একক প্রচেষ্টায় যা কঠিন, সমমনা প্রবাসীদের যৌথ মূলধনী ব্যবসায় তা অনেক সহজ ও টেকসই লাভজনক।',
    author: 'PBC Investment Advisory',
    authorDesignation: 'Business Development',
    category: 'Business',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString()
  }
];
