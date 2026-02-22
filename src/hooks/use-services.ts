import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Service,
  ServiceProduct,
  ServiceProductRequest,
  ServiceCharge,
  ServiceChargeRequest,
  ServiceCommunity,
  ServiceCommunityRequest,
  ProductCharge,
  ProductChargeRequest,
  VasPaymentRequest,
  ApiResponse,
  ServiceFilters,
} from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (filters?: ServiceFilters) => [...serviceKeys.lists(), filters] as const,
  residentServices: () => [...serviceKeys.all, "resident"] as const,
  products: () => [...serviceKeys.all, "products"] as const,
  charges: () => [...serviceKeys.all, "charges"] as const,
  productCharges: () => [...serviceKeys.all, "product-charges"] as const,
  communities: () => [...serviceKeys.all, "communities"] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchServices = async (): Promise<Service[]> => {
  const response = await apiClient.get<ApiResponse<Service[]>>("/config/utilities");
  return response.data || [];
};

const fetchResidentServices = async (): Promise<Service[]> => {
  const response = await apiClient.get<ApiResponse<Service[]>>("/resident/services");
  return response.data || [];
};

const createOrUpdateService = async (formData: FormData): Promise<ApiResponse> => {
  // Special handling for multipart/form-data
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://16.171.32.5:8080/api"}/config/utilities`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create/update service");
  }

  return response.json();
};

const fetchServiceProducts = async (): Promise<ServiceProduct[]> => {
  const response = await apiClient.get<ApiResponse<ServiceProduct[]>>("/config/utility-products");
  return response.data || [];
};

const createOrUpdateServiceProduct = async (data: ServiceProductRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/config/utility-products", data);
};

const fetchServiceCharges = async (): Promise<ServiceCharge[]> => {
  const response = await apiClient.get<ApiResponse<ServiceCharge[]>>("/config/service-charges");
  return response.data || [];
};

const createOrUpdateServiceCharge = async (data: ServiceChargeRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/config/service-charges", data);
};

const fetchProductCharges = async (): Promise<ProductCharge[]> => {
  const response = await apiClient.get<ApiResponse<ProductCharge[]>>("/config/product-charges");
  return response.data || [];
};

const createOrUpdateProductCharge = async (data: ProductChargeRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/config/product-charges", data);
};

const fetchServiceCommunities = async (): Promise<ServiceCommunity[]> => {
  const response = await apiClient.get<ApiResponse<ServiceCommunity[]>>("/config/service-communities");
  return response.data || [];
};

const mapServiceToCommunity = async (data: ServiceCommunityRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/config/utility-communities", data);
};

const makeVasPayment = async (data: VasPaymentRequest): Promise<ApiResponse> => {
  return apiClient.post<ApiResponse>("/resident/vas/pay", data);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all services (admin view)
 */
export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: fetchServices,
  });
}

/**
 * Get services available to a resident
 */
export function useResidentServices() {
  return useQuery({
    queryKey: serviceKeys.residentServices(),
    queryFn: fetchResidentServices,
  });
}

/**
 * Create or update a service (with logo upload)
 */
export function useCreateOrUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.residentServices() });
    },
  });
}

/**
 * Get all service products
 */
export function useServiceProducts() {
  return useQuery({
    queryKey: serviceKeys.products(),
    queryFn: fetchServiceProducts,
  });
}

/**
 * Create or update a service product
 */
export function useCreateOrUpdateServiceProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateServiceProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.products() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.residentServices() });
    },
  });
}

/**
 * Get all service charges
 */
export function useServiceCharges() {
  return useQuery({
    queryKey: serviceKeys.charges(),
    queryFn: fetchServiceCharges,
  });
}

/**
 * Create or update a service charge
 */
export function useCreateOrUpdateServiceCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateServiceCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.charges() });
    },
  });
}

/**
 * Get all product charges
 */
export function useProductCharges() {
  return useQuery({
    queryKey: serviceKeys.productCharges(),
    queryFn: fetchProductCharges,
  });
}

/**
 * Create or update a product charge
 */
export function useCreateOrUpdateProductCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateProductCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.productCharges() });
    },
  });
}

/**
 * Get all service-community mappings
 */
export function useServiceCommunities() {
  return useQuery({
    queryKey: serviceKeys.communities(),
    queryFn: fetchServiceCommunities,
  });
}

/**
 * Map a service to a community
 */
export function useMapServiceToCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mapServiceToCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.communities() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.residentServices() });
    },
  });
}

/**
 * Make a VAS payment (airtime, data, utilities, etc.)
 */
export function useMakeVasPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: makeVasPayment,
    onSuccess: () => {
      // Invalidate wallet as balance will change
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
