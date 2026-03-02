// ============================================================================
// BASE TYPES & COMMON INTERFACES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

// ============================================================================
// AUTHENTICATION & USER TYPES
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ProfileAccount {
  account: string;
  accountName: string;
  bank: string;
  ledgerBalance: number;
  availableBalance: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  username: string;
  profileType: "Super Admin" | "Community" | "Resident" | "Developer" | "System";
  communityName?: string;
  communityCode?: string;
  communityLogo?: string;
  categoryName?: string;
  address?: Record<string, unknown>;
  account?: ProfileAccount;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  userType: string;
  profile: UserProfile;
}

export interface ErrorLoginResponse {
  error: string;
  mustChangePassword?: string;
}

export interface SetPasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}

export interface RegistrationRequest {
  username: string;
  name: string;
  email: string;
  phone: string;
  myCommunityID: string;
  street: string;
  number: string;
  type: "Resident" | "Developer";
  gender: "Male" | "Female";
  movedIn: string; // ISO date string
}

export interface ApproveResidentRequest {
  residentID: string;
  categoryID: string;
}

export interface CreateUserWithRoleRequest {
  username: string;
  name: string;
  phone: string;
  email?: string;
  roleName: string;
}

export interface RolesResponse {
  roles: string[];
}

// ============================================================================
// COMMUNITY TYPES
// ============================================================================

export interface CommunityAddress {
  // Actual API field names (used when creating a community)
  nationality?: string; // what the API stores for country
  address?: string;     // what the API stores for street address
  state?: string;
  lga?: string;
  city?: string;
  // Legacy / alternate field names
  country?: string;
  street?: string;
  zipCode?: string;
  [key: string]: unknown;
}

export interface Community {
  id: string;
  name: string;
  myCommunityID: string;
  logoUrl?: string;
  address?: CommunityAddress;
  userID?: string;
  message?: string;
}

export interface CreateCommunityRequest {
  community: {
    name: string;
    address: Record<string, string>;
    myCommunityID: string;
    message?: string;
  };
  user: {
    name: string;
    username: string;
    phone: string;
    email?: string;
  };
}

export interface CommunityQRResponse {
  message: string;
  name: string;
  myCommunityID: string;
  logoUrl: string;
  address: CommunityAddress;
  qrCode: string; // base64 encoded
}

export interface CommunityCategory {
  id: string;
  category: string;
  description?: string;
  communityID?: string;
  isActive?: boolean;
}

export interface CreateCategoryCategoryRequest {
  category: string;
  description?: string;
}

// ============================================================================
// STREET TYPES
// ============================================================================

export interface CommunityStreet {
  id: string;
  name: string;
  communityID: string;
  isActive: boolean;
}

export interface CreateStreetRequest {
  name: string;
  communityCode: string;
}

// ============================================================================
// USER & RESIDENT TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username?: string;
  avatar?: string;
  community?: string;
  communityID?: string;
  role?: string;
  status?: "active" | "inactive" | "pending";
  profileType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  communityId?: string;
  role?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  id: string;
}

export interface Occupant {
  id: string;
  name: string;
  relationship: "Spouse" | "FlatMate" | "Child" | "Partner" | "Employee";
  live_in: boolean;
  is_active: boolean;
  residentID?: string;
}

export interface OccupantRequest {
  id?: string;
  name: string;
  relationship: string;
  live_in: boolean;
  is_active: boolean;
}

// ============================================================================
// ACCESS CODE TYPES
// ============================================================================

export interface AccessCode {
  id: string;
  code: string;
  codeCategory: string;
  status: "Open" | "Used" | "Cancelled" | "Expired";
  residentID?: string;
  residentName?: string;
  validFrom?: string;
  validUntil?: string;
  usageCount?: number;
  maxUsage?: number;
  details?: Record<string, unknown>;
  createdAt?: string;
}

export interface CreateAccessRuleRequest {
  myCommunityID: string;
  codeCategory: string;
  codeType: number;
  usageNumber: number;
  expirationType: string;
  expirationNumber: number;
}

export interface CreateAccessCodeRequest {
  residentID: string;
  codeCategory: string;
  details?: Record<string, unknown>;
}

export interface AccessResponse {
  code: string;
  message: string;
}

export interface GenerateCodeRequest {
  code_type: number;
  count: number;
}

// ============================================================================
// DUE & PAYMENT TYPES
// ============================================================================

export interface DueCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Due {
  id: string;
  name: string;
  description?: string;
  due_type: "Service Charge" | "Recurring" | "One Time";
  amount: number;
  recur_type?: "Monthly" | "Quarterly" | "Yearly";
  resident_category?: string;
  communityID?: string;
  walletID?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateDueRequest {
  name: string;
  description?: string;
  due_type: string;
  amount?: number;
  recur_type?: string;
  resident_category?: string;
  wallet: string;
}

export interface DueWithTransaction extends Due {
  lastTransaction?: Transaction;
}

export interface DuePaymentRequest {
  product_id: string;
  pay_amount: number;
  period?: number;
  request_ref?: string;
  remarks?: string;
}

export interface DueDistributionRequest {
  id?: string;
  distribution_type: string;
  amount: number;
  wallet_id?: string;
}

export interface DueChargeProfile {
  id: string;
  name?: string;
  community: string;
  category: string;
  distributions: DueDistributionRequest[];
  isActive?: boolean;
}

export interface CreateDueChargeProfileRequest {
  id?: string;
  name?: string;
  community: string;
  category: string;
  distributions: DueDistributionRequest[];
}

// ============================================================================
// SERVICE & UTILITY TYPES
// ============================================================================

export interface Service {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  walletID?: string;
  integrationID?: string;
  isActive?: boolean;
  products?: ServiceProduct[];
  lastTransaction?: Transaction;
}

export interface ServiceProduct {
  id: string;
  service_id: string;
  name: string;
  label?: string;
  description?: string;
  amount?: number;
  min_amount?: number;
  max_amount?: number;
  recurring_type?: string;
  is_active: boolean;
}

export interface ServiceProductRequest {
  id?: string;
  service_id: string;
  name: string;
  label?: string;
  description?: string;
  amount?: number;
  min_amount?: number;
  max_amount?: number;
  recurring_type?: string;
  is_active?: boolean;
}

export interface ServiceCharge {
  id: string;
  service_id: string;
  community_id: string;
  fee: number;
  fee_type: string;
  min_amount?: number;
  max_amount?: number;
  is_active: boolean;
  distributions?: ServiceDistributionRequest[];
}

export interface ServiceChargeRequest {
  id?: string;
  service_id: string;
  community_id: string;
  fee: number;
  fee_type: string;
  min_amount?: number;
  max_amount?: number;
  is_active?: boolean;
  distributions?: ServiceDistributionRequest[];
}

export interface ServiceDistributionRequest {
  id?: string;
  distribution_type: string;
  amount: number;
  wallet_id?: string;
}

export interface ServiceCommunity {
  id: string;
  service_id: string;
  community_id: string;
  is_active: boolean;
  service?: Service;
  community?: Community;
}

export interface ServiceCommunityRequest {
  id?: string;
  service_id: string;
  community_id: string;
  is_active?: boolean;
}

export interface ProductCharge {
  id: string;
  product_id: string;
  fee: number;
  fee_type: string;
  min_amount?: number;
  max_amount?: number;
  is_active: boolean;
  distributions?: ProductDistributionRequest[];
}

export interface ProductChargeRequest {
  id?: string;
  product_id: string;
  fee: number;
  fee_type: string;
  min_amount?: number;
  max_amount?: number;
  is_active?: boolean;
  distributions?: ProductDistributionRequest[];
}

export interface ProductDistributionRequest {
  id?: string;
  distribution_type: string;
  amount: number;
  wallet_id?: string;
}

export interface VasPaymentRequest {
  service_id: string;
  service_product_id: string;
  amount: number;
  password: string;
  request_ref: string;
  lookup_param?: string;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface Integration {
  id: string;
  name: string;
  method: string;
  description?: string;
  isActive?: boolean;
}

export interface IntegrationRequest {
  id?: string;
  name: string;
  method: string;
  description?: string;
}

// ============================================================================
// WALLET & TRANSACTION TYPES
// ============================================================================

export interface Wallet {
  id: string;           // normalized from API's uppercase "ID"
  name: string;
  profileType?: string;
  profileID?: string;
  isActive?: boolean;
  version?: number;
  balance: string;      // API returns balance as a string e.g. "0"
  ledger: string;       // API returns ledger as a string e.g. "0"
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  type: "credit" | "debit";
  status: "pending" | "success" | "failed";
  description?: string;
  walletID?: string;
  userID?: string;
  productID?: string;
  serviceID?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaPaymentRequest {
  va: string;
  amount: number;
  sessionID: string;
  tnxRef: string;
}

// ============================================================================
// PARTNER TYPES
// ============================================================================

export interface Partner {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  address?: Record<string, unknown>;
  wallet?: Wallet;
  user?: User;
}

export interface CreatePartnerRequest {
  name: string;
  username: string;
  email: string;
  phone: string;
  address?: Record<string, unknown>;
}

// ============================================================================
// DASHBOARD & REPORT TYPES
// ============================================================================

export interface ResidentDashboard {
  walletBalance: {
    ledgerBalance: number;
    availableBalance: number;
  };
  occupantStats: {
    total: number;
    active: number;
  };
  recentOccupants: Occupant[];
  recentTransactions: Transaction[];
  recentAccessCodes: AccessCode[];
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface CommunityFilters {
  status?: "active" | "inactive";
  search?: string;
}

export interface UserFilters {
  status?: "active" | "inactive" | "pending";
  communityId?: string;
  role?: string;
  search?: string;
}

export interface AccessCodeFilters {
  status?: "Open" | "Used" | "Cancelled" | "Expired";
  codeCategory?: string;
  residentID?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionFilters {
  type?: "credit" | "debit";
  status?: "pending" | "success" | "failed";
  walletID?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ServiceFilters {
  communityID?: string;
  isActive?: boolean;
}
