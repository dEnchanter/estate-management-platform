/**
 * Role-based access control utilities
 */

export type ProfileType = "Super Admin" | "Community Admin" | "Resident" | "Developer" | "System";

export type NavigationItem = "dashboard" | "admins" | "communities" | "users" | "collections" | "utilities" | "wallet" | "access-codes" | "audit-logs" | "partners" | "integrations";

/**
 * Define which navigation items each profile type can access
 */
export const ROLE_PERMISSIONS: Record<ProfileType, NavigationItem[]> = {
  "Super Admin": [
    "dashboard",
    "communities",
    "utilities",
    "wallet",
    "audit-logs",
    "partners",
    "integrations",
  ],
  "Community Admin": [
    "dashboard",
    "users",
    "collections",
    "wallet",
    "access-codes",
    "audit-logs",
    "partners",
  ],
  "Resident": [
    "dashboard",
  ],
  "Developer": [
    "dashboard",
  ],
  "System": [
    "dashboard",
  ],
};

/**
 * Check if a user has permission to access a specific navigation item
 */
export function hasPermission(
  profileType: string | undefined,
  item: NavigationItem
): boolean {
  if (!profileType) return false;

  // Normalize profile type
  const normalizedProfileType = profileType as ProfileType;

  const permissions = ROLE_PERMISSIONS[normalizedProfileType];
  if (!permissions) return false;

  return permissions.includes(item);
}

/**
 * Get all allowed navigation items for a user
 */
export function getAllowedNavItems(
  profileType: string | undefined
): NavigationItem[] {
  if (!profileType) return [];

  const normalizedProfileType = profileType as ProfileType;
  return ROLE_PERMISSIONS[normalizedProfileType] || [];
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(profileType: string | undefined): boolean {
  return profileType === "Super Admin";
}

/**
 * Check if user is Community Admin
 */
export function isCommunityAdmin(profileType: string | undefined): boolean {
  return profileType === "Community Admin";
}
