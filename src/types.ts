export type UserRole = 'super_admin' | 'admin' | 'member';

export type Language = 'en' | 'bn';

export type StatusType = 'active' | 'pending' | 'suspended' | 'rejected';

export interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  clubName: string;
  currencySymbol: string;
  minDepositAmount: number;
  allowNewRegistrations: boolean;
  registrationOpen?: boolean;
  requireAdminApproval?: boolean;
  noticeBoardText?: string;
  customLogoUrl?: string;
  customCardLogoUrl?: string;
  defaultFrameOverlayUrl?: string;
  trashBoxAccessAdmins?: string[];
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  activeThemeId?: string;
}

export interface TrashedItem {
  id: string;
  itemType: 'Deposit' | 'Member' | 'Director' | 'Project' | 'Report';
  title: string;
  originalId: string;
  originalCollection: 'deposits' | 'members' | 'board_directors' | 'projects' | 'reports';
  itemData: any;
  deletedByEmail: string;
  deletedByName: string;
  deletedByRole: string;
  reason: string;
  deletedAt: string;
}

export interface ActiveSession {
  id: string;
  uid: string;
  email: string;
  memberName: string;
  memberId?: string;
  role: UserRole;
  photoUrl?: string;
  lastActive: string;
  loginTime: string;
  deviceInfo?: string;
  activeTab?: string;
  isOnline: boolean;
}

export type PropertyType = 'Residential' | 'Commercial' | 'Land' | 'Hotel/Resort' | 'High-Rise';

export type InvestmentCategory =
  | 'Real Estate'
  | 'Land'
  | 'Building'
  | 'Restaurant'
  | 'Hospital'
  | 'Hotel'
  | 'Factory'
  | 'Agriculture'
  | 'Warehouse'
  | 'Transport'
  | 'Other';

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  'Real Estate',
  'Land',
  'Building',
  'Restaurant',
  'Hospital',
  'Hotel',
  'Factory',
  'Agriculture',
  'Warehouse',
  'Transport',
  'Other'
];

export function resolveProjectCategory(p?: Partial<RealEstateProject> | string | null): InvestmentCategory {
  if (!p) return 'Land';
  const rawCat = (typeof p === 'string' ? p : (p.category || p.propertyType || '')).toString().trim();
  const name = typeof p === 'object' && p ? (p.projectName || p.projectNameBn || '') : '';
  const desc = typeof p === 'object' && p ? (p.description || '') : '';
  const text = `${rawCat} ${name} ${desc}`.toLowerCase();

  if (/land|plot|জমি|জায়গা|প্লট|মাটি|cumilla|কুমিল্লা/i.test(text)) return 'Land';
  if (/building|tower|plaza|ভবন|টাওয়ার|প্লাজা|apartment|flat/i.test(text)) return 'Building';
  if (/hotel|resort|হোটেল|রিসোর্ট/i.test(text)) return 'Hotel';
  if (/restaurant|cafe|food|খাবার|রেস্তোরাঁ|রেস্টুরেন্ট/i.test(text)) return 'Restaurant';
  if (/hospital|clinic|medical|ডাক্তার|হাসপাতাল/i.test(text)) return 'Hospital';
  if (/factory|industry|কারখানা|শিল্প/i.test(text)) return 'Factory';
  if (/agri|farm|agriculture|কৃষি|খামার/i.test(text)) return 'Agriculture';
  if (/warehouse|godown|গুদাম|স্টোরেজ/i.test(text)) return 'Warehouse';
  if (/transport|vehicle|গাড়ি|পরিবহন/i.test(text)) return 'Transport';
  if (/real|estate|property|রিয়েল|এস্টেট/i.test(text)) return 'Real Estate';

  const exactMatch = INVESTMENT_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase());
  if (exactMatch) return exactMatch;

  return 'Land';
}

export type ProjectStatus = 'Approved' | 'Pending' | 'Archived' | 'Planning' | 'Acquired' | 'Under Construction' | 'Generating Yield' | 'Sold';

export interface ProjectDocument {
  name: string;
  url: string;
}

export interface Member {
  id: string; // e.g., PBC-1001
  fullName: string;
  fullNameBn?: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  joinDate: string;
  status: StatusType;
  photoUrl: string;
  idCardPhotoUrl?: string;
  totalDeposit: number; // in BDT (৳)
  totalFundRaisingDeposit?: number;
  totalRealEstateDeposit?: number;
  qrCodeData: string;
  barcodeData?: string;
  passportNumber?: string;
  emergencyContact?: string;
  role: UserRole;
  notes?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  idCardNumber?: string;
  batchNumber?: string;
  password?: string;
  // Family Information (ID Card Back)
  familyInfoName?: string;
  familyInfoRelation?: string;
  familyInfoMobile?: string;
  familyInfoAddress?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  nomineeMobile?: string;
  nomineeAddress?: string;
}

export interface CardFieldPosition {
  id: string; // 'photo', 'fullName', 'country', 'qrCodeFront', 'barcodeFront', 'memberId', 'dateOfBirth', 'bloodGroup', 'phone', 'email', 'idCardNumber', 'qrCodeBack', 'barcodeBack', 'logoHeader', 'vipBadge'
  label: string;
  side: 'front' | 'back';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width?: number; // percentage 0-100
  height?: number; // percentage 0-100
  fontSize?: number; // in px
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  visible?: boolean;
}

export interface CardTemplateConfig {
  id: string;
  name: string;
  frontBgUrl?: string;
  backBgUrl?: string;
  frontBgColor?: string;
  backBgColor?: string;
  primaryColor?: string;
  accentColor?: string;
  frontFields: CardFieldPosition[];
  backFields: CardFieldPosition[];
  updatedAt?: string;
}

export interface Deposit {
  id: string; // e.g., DEP-9001
  memberId: string;
  memberName: string;
  amount: number; // in BDT (৳)
  category?: 'Fund Raising' | 'Real Estate';
  currency: 'BDT';
  localAmount?: number;
  depositDate: string;
  paymentMethod: 'Bank' | 'bKash' | 'Nagad' | 'Bank Wire' | 'bKash/Nagad' | 'Wise' | 'Stripe/Card' | 'Cheque' | 'Cash';
  referenceNumber: string;
  notes?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  receiptUrl?: string;
  approvedByAdminName?: string;
  approvedByAdminId?: string;
  approvedByAdminSignature?: string;
}

export interface ProjectMemberAllocation {
  memberId: string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  allocatedAmount: number; // in BDT (৳)
  availableDeposit: number; // in BDT (৳)
  sharePercentage?: number; // % share in this project
  allocationDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface RealEstateProject {
  id: string; // e.g., PRJ-301
  projectName: string;
  projectNameBn?: string;
  category: InvestmentCategory;
  propertyType?: PropertyType;
  country: string;
  city: string;
  address?: string;
  investmentAmount: number; // in BDT (৳)
  currentValue: number; // in BDT (৳)
  profit: number; // in BDT (৳)
  loss?: number; // in BDT (৳)
  investmentDate: string; // YYYY-MM-DD
  purchaseDate?: string;
  status: ProjectStatus;
  isArchived?: boolean;
  photos: string[];
  documents?: ProjectDocument[];
  description: string;
  expectedRoiPercent?: number;
  totalInvestors?: number;
  memberAllocations?: ProjectMemberAllocation[];
  createdAt?: any;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'deposit' | 'project' | 'profit' | 'system';
}

export interface ClubStats {
  totalMembers: number;
  totalDeposits: number;
  totalFundRaisingDeposits?: number;
  totalRealEstateDeposits?: number;
  totalFund: number;
  totalInvestment: number;
  availableBalance: number;
  totalProfit: number;
  profitPercentage: number;
}

export interface BoardDirector {
  id: string; // e.g. DIR-101
  name: string;
  designation: string;
  photoUrl: string;
  location?: string;
  mobile?: string;
  nationalId?: string;
  email?: string;
  homeAddress?: string;
  village?: string;
  subDistrict?: string;
  district?: string;
  postalCode?: string;
  displayOrder?: number;
  isActive?: boolean;
  allowedAccessUsers?: string[]; // array of emails or member IDs granted permission by Super Admin
  createdAt?: string;
  updatedAt?: string;
}

export type AppTab = 'dashboard' | 'members' | 'deposits' | 'real_estate' | 'reports' | 'my_profile' | 'admin_panel' | 'directors' | 'active_now';

export interface QuoteItem {
  id: string; // e.g. QUOTE-101
  quote: string; // Quote text (Bangla or English)
  quoteBn?: string;
  author: string; // e.g. "Shakil Rana"
  authorDesignation?: string; // e.g. "Director & Investor, PBC"
  authorPhotoUrl?: string;
  category?: 'Investment' | 'Business' | 'Savings' | 'Motivation' | 'Leadership';
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NavigationState {
  tab: AppTab;
  title?: string;
  titleBn?: string;
  subView?: string | null;
  subId?: string | null;
  isFocusMode?: boolean;
  fromMoreMenu?: boolean;
}

