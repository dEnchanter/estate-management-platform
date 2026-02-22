import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CommunityStreet, CreateStreetRequest, MessageResponse } from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const streetKeys = {
  all: ["streets"] as const,
  lists: () => [...streetKeys.all, "list"] as const,
  list: (communityCode?: string) => [...streetKeys.lists(), communityCode] as const,
  details: () => [...streetKeys.all, "detail"] as const,
  detail: (id: string) => [...streetKeys.details(), id] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchCommunityStreets = async (communityCode: string, skipAuth?: boolean): Promise<CommunityStreet[]> => {
  return apiClient.get<CommunityStreet[]>(`/streets/community/${communityCode}`, { skipAuth });
};

const createStreet = async (data: CreateStreetRequest): Promise<MessageResponse> => {
  return apiClient.post<MessageResponse>("/streets", data);
};

const toggleStreetStatus = async (params: { id: string; action: "activate" | "deactivate" }): Promise<MessageResponse> => {
  return apiClient.put<MessageResponse>(`/streets/${params.id}/status/${params.action}`);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all streets in a community
 */
export function useCommunityStreets(communityCode: string, skipAuth?: boolean) {
  return useQuery({
    queryKey: streetKeys.list(communityCode),
    queryFn: () => fetchCommunityStreets(communityCode, skipAuth),
    enabled: !!communityCode,
  });
}

/**
 * Create a new street
 */
export function useCreateStreet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStreet,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: streetKeys.list(variables.communityCode) });
      queryClient.invalidateQueries({ queryKey: streetKeys.lists() });
    },
  });
}

/**
 * Toggle street status (activate/deactivate)
 */
export function useToggleStreetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleStreetStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: streetKeys.lists() });
    },
  });
}
