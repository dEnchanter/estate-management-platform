import { useMemo } from "react";
import { useCurrentUser } from "./use-auth";
import {
  hasPermission,
  getAllowedNavItems,
  isSuperAdmin,
  isCommunityAdmin,
  type NavigationItem,
} from "@/lib/permissions";

/**
 * Hook to manage user permissions based on profile type
 */
export function usePermissions() {
  const { data: user } = useCurrentUser();

  const profileType = user?.profileType;

  const permissions = useMemo(() => {
    return {
      // Check if user has permission for specific navigation item
      canAccess: (item: NavigationItem) => hasPermission(profileType, item),

      // Get all allowed navigation items
      allowedNavItems: getAllowedNavItems(profileType),

      // Role checks
      isSuperAdmin: isSuperAdmin(profileType),
      isCommunityAdmin: isCommunityAdmin(profileType),

      // Profile type
      profileType,

      // User data
      user,
    };
  }, [profileType, user]);

  return permissions;
}
