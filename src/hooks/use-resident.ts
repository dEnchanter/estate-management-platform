import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ResidentDashboard,
  Occupant,
  OccupantRequest,
  ApiResponse,
} from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const residentKeys = {
  all: ["resident"] as const,
  dashboard: () => [...residentKeys.all, "dashboard"] as const,
  occupants: () => [...residentKeys.all, "occupants"] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchResidentDashboard = async (): Promise<ResidentDashboard> => {
  const response = await apiClient.get<ApiResponse<ResidentDashboard>>("/report/resident/dashboard");
  return response.data!;
};

const createOrUpdateOccupant = async (data: OccupantRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/resident/occupant", data);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get resident dashboard data
 * Includes wallet balance, occupant stats, recent occupants, transactions, and access codes
 */
export function useResidentDashboard() {
  return useQuery({
    queryKey: residentKeys.dashboard(),
    queryFn: fetchResidentDashboard,
  });
}

/**
 * Create or update an occupant
 * Use empty id for create, provide id for update
 */
export function useCreateOrUpdateOccupant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateOccupant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: residentKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: residentKeys.occupants() });
    },
  });
}
