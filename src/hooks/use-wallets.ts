import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Wallet, Transaction, TransactionFilters, ApiResponse } from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const walletKeys = {
  all: ["wallets"] as const,
  lists: () => [...walletKeys.all, "list"] as const,
  list: (profileType?: string) => [...walletKeys.lists(), profileType] as const,
  details: () => [...walletKeys.all, "detail"] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
  transactions: () => [...walletKeys.all, "transactions"] as const,
  transactionList: (filters?: TransactionFilters) => [...walletKeys.transactions(), filters] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

interface RawWalletApiResponse {
  ID: string;
  name: string;
  ProfileType?: string;
  ProfileID?: string;
  IsActive?: boolean;
  Version?: number;
  balance: string;
  ledger: string;
}

const fetchWallets = async (profileType?: string): Promise<Wallet[]> => {
  const response = await apiClient.get<ApiResponse<RawWalletApiResponse[]>>("/wallets", {
    params: profileType ? { profileType } : undefined,
  });
  return (response.data || []).map((raw) => ({
    id: raw.ID,
    name: raw.name,
    profileType: raw.ProfileType,
    profileID: raw.ProfileID,
    isActive: raw.IsActive,
    version: raw.Version,
    balance: raw.balance,
    ledger: raw.ledger,
  }));
};

const createWalletByProfile = async (name: string): Promise<ApiResponse> => {
  return apiClient.put<ApiResponse>(`/wallets/${name}/wallet-by-profile`);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all wallets (optionally filtered by profile type)
 */
export function useWallets(profileType?: "Community" | "System" | "Resident" | "Developer") {
  return useQuery({
    queryKey: walletKeys.list(profileType),
    queryFn: () => fetchWallets(profileType),
  });
}

/**
 * Create a wallet for a user based on their profile type
 */
export function useCreateWalletByProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWalletByProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.lists() });
    },
  });
}

/**
 * Get wallet balance for current user
 */
export function useMyWalletBalance() {
  return useQuery({
    queryKey: [...walletKeys.all, "my-balance"],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) return null;

      const profile = JSON.parse(userProfile);
      return profile.account || null;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
