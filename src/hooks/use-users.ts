import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User, UserFilters, CreateUserInput, UpdateUserInput, ApiResponse } from "@/types/api.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchUsers = async (filters?: UserFilters): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>("/users", {
    params: filters as Record<string, string | number | boolean> | undefined,
  });
  return response.data || [];
};

const fetchUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data!;
};

const createUser = async (data: CreateUserInput): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>("/users", data);
  return response.data!;
};

const updateUser = async ({ id, ...data }: UpdateUserInput): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
  return response.data!;
};

const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete<void>(`/users/${id}`);
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all users with optional filters
 */
export function useUsers(filters?: UserFilters, enabled = true) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    enabled,
  });
}

/**
 * Get a single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

/**
 * Create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
}

/**
 * Delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
