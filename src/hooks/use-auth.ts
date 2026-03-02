import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  SetPasswordRequest,
  MessageResponse,
  ApproveResidentRequest,
  CreateUserWithRoleRequest,
  RolesResponse,
  User,
  ApiResponse,
} from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  roles: () => [...authKeys.all, "roles"] as const,
  pendingResidents: () => [...authKeys.all, "pending-residents"] as const,
  checkUsername: (username: string) => [...authKeys.all, "check-username", username] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>("/login", credentials);
};

const register = async (data: RegistrationRequest): Promise<MessageResponse> => {
  return apiClient.post<MessageResponse>("/register", data);
};

const setPassword = async (data: SetPasswordRequest): Promise<MessageResponse> => {
  return apiClient.post<MessageResponse>("/users/set-password", data);
};

const approveResident = async (data: ApproveResidentRequest): Promise<MessageResponse> => {
  return apiClient.post<MessageResponse>("/users/approve", data);
};

const createUserWithRole = async (data: CreateUserWithRoleRequest): Promise<MessageResponse> => {
  return apiClient.post<MessageResponse>("/users/new-user", data);
};

const fetchAdminRoles = async (): Promise<RolesResponse> => {
  return apiClient.get<RolesResponse>("/users/admin-roles");
};

const fetchPendingResidents = async (): Promise<User[]> => {
  const response = await apiClient.get<{ success: boolean; data: User[] }>("/residents/pending");
  return response.data || [];
};

const checkUsername = async (username: string): Promise<ApiResponse> => {
  return apiClient.get<ApiResponse>(`/users/${username}`);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Login mutation hook
 * Automatically stores token and user data in localStorage on success
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store authentication data
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user_id);
        localStorage.setItem("userType", data.userType);
        localStorage.setItem("userProfile", JSON.stringify(data.profile));
      }

      // Update query cache — include userType so permissions system has the
      // clean single-word value ("System", "Community") without re-reading localStorage
      queryClient.setQueryData(authKeys.user(), { ...data.profile, userType: data.userType });
    },
  });
}

/**
 * Logout utility
 * Clears all authentication data from localStorage, sessionStorage, and query cache
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      localStorage.removeItem("userProfile");

      // Clear sessionStorage as well
      sessionStorage.clear();
    }

    // Clear query cache
    queryClient.clear();
  };
}

/**
 * Register new user (resident/developer)
 */
export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

/**
 * Set/change password
 */
export function useSetPassword() {
  return useMutation({
    mutationFn: setPassword,
  });
}

/**
 * Approve pending resident
 */
export function useApproveResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveResident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.pendingResidents() });
    },
  });
}

/**
 * Create user with specific role
 */
export function useCreateUserWithRole() {
  return useMutation({
    mutationFn: createUserWithRole,
  });
}

/**
 * Get admin roles based on logged-in user profile
 */
export function useAdminRoles() {
  return useQuery({
    queryKey: authKeys.roles(),
    queryFn: fetchAdminRoles,
  });
}

/**
 * Get all pending residents awaiting approval
 */
export function usePendingResidents(enabled = true) {
  return useQuery({
    queryKey: authKeys.pendingResidents(),
    queryFn: fetchPendingResidents,
    enabled,
  });
}

/**
 * Check if username exists
 */
export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: authKeys.checkUsername(username),
    queryFn: () => checkUsername(username),
    enabled: !!username && username.length >= 4,
    retry: false,
  });
}

/**
 * Get current user from localStorage
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => {
      if (typeof window === "undefined") return null;
      const userProfile = localStorage.getItem("userProfile");
      const userType = localStorage.getItem("userType");
      if (!userProfile) return null;
      const profile = JSON.parse(userProfile);
      // Attach userType so permissions can use the clean single-word value
      // e.g. "System" instead of profile.profileType "Super Admin"
      return { ...profile, userType: userType || profile.profileType };
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  return !!token;
}

/**
 * Get auth token
 */
export function useAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
