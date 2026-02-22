import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  AccessCode,
  CreateAccessRuleRequest,
  CreateAccessCodeRequest,
  AccessResponse,
  GenerateCodeRequest,
  ApiResponse,
  AccessCodeFilters,
} from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const accessCodeKeys = {
  all: ["access-codes"] as const,
  lists: () => [...accessCodeKeys.all, "list"] as const,
  list: (filters?: AccessCodeFilters) => [...accessCodeKeys.lists(), filters] as const,
  active: () => [...accessCodeKeys.all, "active"] as const,
  details: () => [...accessCodeKeys.all, "detail"] as const,
  detail: (code: string) => [...accessCodeKeys.details(), code] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchActiveAccessCodes = async (): Promise<AccessCode[]> => {
  const response = await apiClient.get<ApiResponse<AccessCode[]>>("/resident/access-codes/active");
  return response.data || [];
};

const generateAccessCode = async (data: CreateAccessCodeRequest): Promise<AccessResponse> => {
  return apiClient.post<AccessResponse>("/resident/access/generate-code", data);
};

const cancelAccessCode = async (code: string): Promise<ApiResponse> => {
  return apiClient.get<ApiResponse>(`/resident/access-codes/${code}/cancel`);
};

const validateAccessCode = async (code: string): Promise<ApiResponse> => {
  return apiClient.get<ApiResponse>(`/access/${code}/validate`);
};

const createAccessRule = async (data: CreateAccessRuleRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/access/community-rules", data);
};

const generateBulkCodes = async (data: GenerateCodeRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/access/generate-codes", data);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all active access codes for the current user
 */
export function useActiveAccessCodes() {
  return useQuery({
    queryKey: accessCodeKeys.active(),
    queryFn: fetchActiveAccessCodes,
  });
}

/**
 * Generate a new access code for a resident
 */
export function useGenerateAccessCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAccessCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessCodeKeys.active() });
      queryClient.invalidateQueries({ queryKey: accessCodeKeys.lists() });
    },
  });
}

/**
 * Cancel an access code (only works for 'Open' status)
 */
export function useCancelAccessCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAccessCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessCodeKeys.active() });
      queryClient.invalidateQueries({ queryKey: accessCodeKeys.lists() });
    },
  });
}

/**
 * Validate an access code (for community security)
 */
export function useValidateAccessCode() {
  return useMutation({
    mutationFn: validateAccessCode,
  });
}

/**
 * Create a new access rule for a community
 */
export function useCreateAccessRule() {
  return useMutation({
    mutationFn: createAccessRule,
  });
}

/**
 * Generate bulk access codes for partners
 */
export function useGenerateBulkCodes() {
  return useMutation({
    mutationFn: generateBulkCodes,
  });
}
