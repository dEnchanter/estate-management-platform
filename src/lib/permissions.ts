/**
 * Role-based access control utilities
 *
 * Keyed on userType from the login response (localStorage "userType"),
 * NOT profile.profileType. Values match login response userType field:
 *   "System"    → Zamanni super admin (full access)
 *   "Community" → Estate admin / staff (scoped to their community)
 *   "Resident"  → Resident self-service
 *   "Developer" → Developer self-service
 */

export type UserType = "System" | "Community" | "Resident" | "Developer";

export type NavigationItem = "dashboard" | "admins" | "communities" | "users" | "collections" | "utilities" | "wallet" | "access-codes" | "audit-logs" | "partners" | "integrations";

/**
 * Define which navigation items each user type can access
 */
export const ROLE_PERMISSIONS: Record<UserType, NavigationItem[]> = {
  "System": [
    "dashboard",
    "admins",
    "communities",
    "utilities",
    "wallet",
    "partners",
    "integrations",
    "audit-logs",
  ],
  "Community": [
    "dashboard",
    "admins",
    "users",
    "collections",
    "wallet",
    "access-codes",
    "audit-logs",
  ],
  "Resident": [
    "dashboard",
  ],
  "Developer": [
    "dashboard",
  ],
};

/**
 * Check if a user has permission to access a specific navigation item
 */
export function hasPermission(
  userType: string | undefined,
  item: NavigationItem
): boolean {
  if (!userType) return false;

  const permissions = ROLE_PERMISSIONS[userType as UserType];
  if (!permissions) return false;

  return permissions.includes(item);
}

/**
 * Get all allowed navigation items for a user
 */
export function getAllowedNavItems(
  userType: string | undefined
): NavigationItem[] {
  if (!userType) return [];

  return ROLE_PERMISSIONS[userType as UserType] || [];
}

/**
 * Check if user is System (Zamanni super admin)
 */
export function isSuperAdmin(userType: string | undefined): boolean {
  return userType === "System";
}

/**
 * Check if user is a Community admin/staff
 */
export function isCommunityAdmin(userType: string | undefined): boolean {
  return userType === "Community";
}
