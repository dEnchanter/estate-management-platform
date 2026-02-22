// ============================================================================
// API CONSTANTS
// ============================================================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://16.171.32.5:8080/api";

// ============================================================================
// USER TYPES
// ============================================================================

export const USER_TYPES = {
  RESIDENT: "Resident",
  DEVELOPER: "Developer",
  COMMUNITY: "Community",
  SYSTEM: "System",
} as const;

export const PROFILE_TYPES = {
  RESIDENT: "Resident",
  DEVELOPER: "Developer",
  COMMUNITY: "Community",
  SYSTEM: "System",
} as const;

// ============================================================================
// GENDER OPTIONS
// ============================================================================

export const GENDERS = {
  MALE: "Male",
  FEMALE: "Female",
} as const;

// ============================================================================
// ACCESS CODE STATUSES
// ============================================================================

export const ACCESS_CODE_STATUS = {
  OPEN: "Open",
  USED: "Used",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
} as const;

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export const TRANSACTION_TYPES = {
  CREDIT: "credit",
  DEBIT: "debit",
} as const;

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

// ============================================================================
// DUE TYPES
// ============================================================================

export const DUE_TYPES = {
  SERVICE_CHARGE: "Service Charge",
  RECURRING: "Recurring",
  ONE_TIME: "One Time",
} as const;

export const RECUR_TYPES = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
} as const;

// ============================================================================
// OCCUPANT RELATIONSHIPS
// ============================================================================

export const OCCUPANT_RELATIONSHIPS = {
  SPOUSE: "Spouse",
  FLATMATE: "FlatMate",
  CHILD: "Child",
  PARTNER: "Partner",
  EMPLOYEE: "Employee",
} as const;

// ============================================================================
// STATUS OPTIONS
// ============================================================================

export const STATUS_OPTIONS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export const COMMUNITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

// ============================================================================
// FEE TYPES
// ============================================================================

export const FEE_TYPES = {
  FLAT: "flat",
  PERCENTAGE: "percentage",
} as const;

// ============================================================================
// DISTRIBUTION TYPES
// ============================================================================

export const DISTRIBUTION_TYPES = {
  FLAT_FEE: "flat_fee",
  PERCENTAGE: "percentage",
  SERVICE_PROVIDER: "service_provider",
  COMMUNITY_WALLET: "community_wallet",
  SYSTEM_WALLET: "system_wallet",
} as const;

// ============================================================================
// STREET ACTIONS
// ============================================================================

export const STREET_ACTIONS = {
  ACTIVATE: "activate",
  DEACTIVATE: "deactivate",
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER_ID: "userId",
  USER_TYPE: "userType",
  USER_PROFILE: "userProfile",
} as const;

// ============================================================================
// QUERY STALE TIMES (in milliseconds)
// ============================================================================

export const STALE_TIMES = {
  VERY_SHORT: 1000 * 30, // 30 seconds
  SHORT: 1000 * 60, // 1 minute
  MEDIUM: 1000 * 60 * 5, // 5 minutes
  LONG: 1000 * 60 * 15, // 15 minutes
  VERY_LONG: 1000 * 60 * 60, // 1 hour
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ============================================================================
// ROLES
// ============================================================================

export const COMMUNITY_ROLES = [
  "Community Admin",
  "Community Security",
  "Community Manager",
  "Finance Officer",
] as const;

export const SYSTEM_ROLES = [
  "System Admin",
  "Support",
] as const;
