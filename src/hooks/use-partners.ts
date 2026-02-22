import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Partner, CreatePartnerRequest, ApiResponse } from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const partnerKeys = {
  all: ["partners"] as const,
  lists: () => [...partnerKeys.all, "list"] as const,
  details: () => [...partnerKeys.all, "detail"] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchPartners = async (): Promise<Partner[]> => {
  const response = await apiClient.get<ApiResponse<Partner[]>>("/partners");
  return response.data || [];
};

const createPartner = async (data: CreatePartnerRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/partners/create-partner", data);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all partners with wallet balances and user info
 */
export function usePartners() {
  return useQuery({
    queryKey: partnerKeys.lists(),
    queryFn: fetchPartners,
  });
}

/**
 * Create a new partner
 */
export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
}
