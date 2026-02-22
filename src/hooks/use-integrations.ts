import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Integration, IntegrationRequest, ApiResponse } from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
  details: () => [...integrationKeys.all, "detail"] as const,
  detail: (id: string) => [...integrationKeys.details(), id] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchIntegrations = async (): Promise<Integration[]> => {
  const response = await apiClient.get<ApiResponse<Integration[]>>("/config/integrations");
  return response.data || [];
};

const createOrUpdateIntegration = async (data: IntegrationRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/config/integrations", data);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all integrations
 */
export function useIntegrations() {
  return useQuery({
    queryKey: integrationKeys.lists(),
    queryFn: fetchIntegrations,
  });
}

/**
 * Create or update an integration
 * Use empty id for create, provide id for update
 */
export function useCreateOrUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
    },
  });
}
