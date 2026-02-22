import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Due,
  DueCategory,
  DueWithTransaction,
  CreateDueRequest,
  DuePaymentRequest,
  DueChargeProfile,
  CreateDueChargeProfileRequest,
  ApiResponse,
} from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dueKeys = {
  all: ["dues"] as const,
  lists: () => [...dueKeys.all, "list"] as const,
  categories: () => [...dueKeys.all, "categories"] as const,
  communityDues: () => [...dueKeys.all, "community"] as const,
  residentDues: () => [...dueKeys.all, "resident"] as const,
  profiles: () => [...dueKeys.all, "profiles"] as const,
  profile: (id: string) => [...dueKeys.profiles(), id] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchDueCategories = async (): Promise<DueCategory[]> => {
  const response = await apiClient.get<ApiResponse<DueCategory[]>>("/community/due-categories");
  return response.data || [];
};

const fetchCommunityDues = async (): Promise<Due[]> => {
  const response = await apiClient.get<ApiResponse<Due[]>>("/community/dues");
  return response.data || [];
};

const fetchResidentDues = async (): Promise<DueWithTransaction[]> => {
  const response = await apiClient.get<ApiResponse<DueWithTransaction[]>>("/resident/dues");
  return response.data || [];
};

const createDue = async (data: CreateDueRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/community/new-due", data);
};

const payDue = async (data: DuePaymentRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/resident/pay_due", data);
};

const fetchDueChargeProfiles = async (): Promise<DueChargeProfile[]> => {
  const response = await apiClient.get<ApiResponse<DueChargeProfile[]>>("/config/create-due-profiles");
  return response.data || [];
};

const createDueChargeProfile = async (data: CreateDueChargeProfileRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/config/create-due-profile", data);
};

const updateDueChargeProfile = async (data: CreateDueChargeProfileRequest): Promise<ApiResponse> => {
  return apiClient.put<ApiResponse>("/config/update-due-profile", data);
};

const toggleDueProfileStatus = async (params: { id: string; status: boolean }): Promise<ApiResponse> => {
  return apiClient.patch<ApiResponse>(`/config/due-profile/${params.id}/status`, undefined, {
    params: { status: params.status },
  });
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all due categories
 */
export function useDueCategories() {
  return useQuery({
    queryKey: dueKeys.categories(),
    queryFn: fetchDueCategories,
  });
}

/**
 * Get all dues for the authenticated user's community
 */
export function useCommunityDues() {
  return useQuery({
    queryKey: dueKeys.communityDues(),
    queryFn: fetchCommunityDues,
  });
}

/**
 * Get all dues for a resident with their last transaction
 */
export function useResidentDues() {
  return useQuery({
    queryKey: dueKeys.residentDues(),
    queryFn: fetchResidentDues,
  });
}

/**
 * Create a new community due
 */
export function useCreateDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dueKeys.communityDues() });
      queryClient.invalidateQueries({ queryKey: dueKeys.lists() });
    },
  });
}

/**
 * Make a due payment
 */
export function usePayDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payDue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dueKeys.residentDues() });
      // Invalidate wallet queries as balance will change
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

/**
 * Get all due charge profiles
 */
export function useDueChargeProfiles() {
  return useQuery({
    queryKey: dueKeys.profiles(),
    queryFn: fetchDueChargeProfiles,
  });
}

/**
 * Create a new due charge profile
 */
export function useCreateDueChargeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDueChargeProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dueKeys.profiles() });
    },
  });
}

/**
 * Update an existing due charge profile
 */
export function useUpdateDueChargeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDueChargeProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dueKeys.profiles() });
    },
  });
}

/**
 * Toggle due charge profile status (enable/disable)
 */
export function useToggleDueProfileStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleDueProfileStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dueKeys.profiles() });
    },
  });
}
