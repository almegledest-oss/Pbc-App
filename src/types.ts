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
  defaultFrameOverlayUrl?: string;
  trashBoxAccessAdmins?: string[];
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
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
  qrCodeData: string;
  barcodeData?: string;
  passportNumber?: string;
  emergencyContact?: string;
  role: UserRole;
  notes?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  idCardNumber?: string;
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

