import { Member, Deposit, RealEstateProject, ClubStats, NotificationItem } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'PBC-1001',
    fullName: 'Fokrul Islam Mir',
    fullNameBn: 'ফকরুল ইসলাম মীর',
    email: 'fokrulislammir9897@gmail.com',
    phone: '+880 1711-000000',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    joinDate: '2022-01-15',
    status: 'active',
    photoUrl: '',
    totalDeposit: 0,
    qrCodeData: 'PBC-1001-QR',
    role: 'super_admin'
  }
];

export const INITIAL_DEPOSITS: Deposit[] = [];

export const INITIAL_PROJECTS: RealEstateProject[] = [];

export const INITIAL_STATS: ClubStats = {
  totalMembers: 1,
  totalDeposits: 0,
  totalFund: 0,
  totalInvestment: 0,
  availableBalance: 0,
  totalProfit: 0,
  profitPercentage: 0
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];


