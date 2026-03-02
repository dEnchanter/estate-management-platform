import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Community,
  CommunityQRResponse,
  CommunityCategory,
  CreateCategoryCategoryRequest,
  CommunityFilters,
  ApiResponse,
} from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const communityKeys = {
  all: ["communities"] as const,
  lists: () => [...communityKeys.all, "list"] as const,
  list: (filters?: CommunityFilters) => [...communityKeys.lists(), filters] as const,
  details: () => [...communityKeys.all, "detail"] as const,
  detail: (id: string) => [...communityKeys.details(), id] as const,
  qrCode: (id: string) => [...communityKeys.all, "qr", id] as const,
  categories: (id?: string) => [...communityKeys.all, "categories", id] as const,
  idCheck: (communityId: string) => [...communityKeys.all, "id-check", communityId] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchCommunities = async (filters?: CommunityFilters, skipAuth?: boolean): Promise<Community[]> => {
  return apiClient.get<Community[]>("/community/communities", {
    params: filters as Record<string, string | number | boolean> | undefined,
    skipAuth,
  });
};

const fetchCommunity = async (id: string): Promise<Community> => {
  return apiClient.get<Community>(`/community/communities/${id}`);
};

const fetchCommunityQR = async (id: string): Promise<CommunityQRResponse> => {
  return apiClient.get<CommunityQRResponse>(`/community/${id}/qrcode`);
};

const fetchCommunityCategories = async (id?: string): Promise<CommunityCategory[]> => {
  const response = await apiClient.get<ApiResponse<CommunityCategory[]>>("/community/categories", {
    params: id ? { id } : undefined,
  });
  return response.data || [];
};

const createCommunity = async (formData: FormData): Promise<ApiResponse> => {
  // Special handling for multipart/form-data
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://16.171.32.5:8080/api"}/community/new-community`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create community");
  }

  return response.json();
};

const checkCommunityId = async (communityId: string): Promise<{ taken: boolean }> => {
  const results = await apiClient.get<Community[]>("/community/communities", {
    params: { search: communityId },
  });
  const taken = Array.isArray(results) && results.some(
    (c) => c.myCommunityID?.toLowerCase() === communityId.toLowerCase()
  );
  return { taken };
};

const createCommunityCategory = async (data: CreateCategoryCategoryRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/community/new-collection", data);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all communities
 */
export function useCommunities(filters?: CommunityFilters, skipAuth?: boolean) {
  return useQuery({
    queryKey: communityKeys.list(filters),
    queryFn: () => fetchCommunities(filters, skipAuth),
  });
}

/**
 * Get a single community by ID
 */
export function useCommunity(id: string) {
  return useQuery({
    queryKey: communityKeys.detail(id),
    queryFn: () => fetchCommunity(id),
    enabled: !!id,
  });
}

/**
 * Get community QR code and details
 */
export function useCommunityQR(id: string) {
  return useQuery({
    queryKey: communityKeys.qrCode(id),
    queryFn: () => fetchCommunityQR(id),
    enabled: !!id,
  });
}

/**
 * Get community resident categories
 */
export function useCommunityCategories(communityId?: string, enabled = true) {
  return useQuery({
    queryKey: communityKeys.categories(communityId),
    queryFn: () => fetchCommunityCategories(communityId),
    enabled,
  });
}

/**
 * Check if a communityId (community username/slug) is already taken.
 * Only fires when communityId.length >= 4.
 */
export function useCheckCommunityId(communityId: string) {
  return useQuery({
    queryKey: communityKeys.idCheck(communityId),
    queryFn: () => checkCommunityId(communityId),
    enabled: communityId.length >= 4,
  });
}

/**
 * Create a new community with logo upload
 */
export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
    },
  });
}

/**
 * Create a community resident category
 */
export function useCreateCommunityCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityCategory,
    onSuccess: () => {
      // Invalidate at the base "categories" prefix so all community-scoped
      // category queries (with or without an id param) are refreshed.
      queryClient.invalidateQueries({ queryKey: [...communityKeys.all, "categories"] });
    },
  });
}
