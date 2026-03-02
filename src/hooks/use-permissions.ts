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

  // Use userType (e.g. "System", "Community") — the clean single-word value
  // from the login response, not profileType ("Super Admin") from profile object
  const userType = user?.userType;

  const permissions = useMemo(() => {
    return {
      canAccess: (item: NavigationItem) => hasPermission(userType, item),
      allowedNavItems: getAllowedNavItems(userType),
      isSuperAdmin: isSuperAdmin(userType),
      isCommunityAdmin: isCommunityAdmin(userType),
      userType,
      user,
    };
  }, [userType, user]);

  return permissions;
}
