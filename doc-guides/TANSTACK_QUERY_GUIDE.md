# TanStack Query Setup Guide

This guide explains how to use TanStack Query (React Query) in your Zamanni Community project for API integration.

## Table of Contents

1. [Setup Complete](#setup-complete)
2. [Configuration](#configuration)
3. [Using Query Hooks](#using-query-hooks)
4. [Creating New Hooks](#creating-new-hooks)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

---

## Setup Complete

TanStack Query has been configured and is ready to use in your project. Here's what has been set up:

✅ **Installed Packages:**
- `@tanstack/react-query` - Core library
- `@tanstack/react-query-devtools` - Development tools

✅ **Provider Setup:**
- QueryProvider configured in `src/providers/query-provider.tsx`
- Wrapped around your app in `src/app/layout.tsx`

✅ **API Client:**
- HTTP client configured in `src/lib/api-client.ts`
- Base URL: `http://13.61.25.196:8080/api`

✅ **Example Hooks:**
- Communities hooks: `src/hooks/use-communities.ts`
- Users hooks: `src/hooks/use-users.ts`

---

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://13.61.25.196:8080/api
```

### QueryClient Settings

The QueryClient is configured with these defaults (in `src/providers/query-provider.tsx`):

```typescript
{
  queries: {
    staleTime: 5 * 60 * 1000,        // 5 minutes
    retry: 1,                          // Retry failed requests once
    refetchOnWindowFocus: process.env.NODE_ENV === "production"
  },
  mutations: {
    retry: 1
  }
}
```

### React Query DevTools

In development mode, the DevTools are automatically available. Click the TanStack Query icon in the bottom-left of your screen.

---

## Using Query Hooks

### Fetching Data (Queries)

#### Example: Fetch All Communities

```typescript
import { useCommunities } from "@/hooks/use-communities";

export default function CommunitiesPage() {
  const { data, isLoading, isError, error } = useCommunities();

  if (isLoading) return <div>Loading communities...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((community) => (
        <div key={community.id}>{community.name}</div>
      ))}
    </div>
  );
}
```

#### Example: Fetch Single Community

```typescript
import { useCommunity } from "@/hooks/use-communities";

export default function CommunityDetail({ id }: { id: string }) {
  const { data: community, isLoading } = useCommunity(id);

  if (isLoading) return <div>Loading...</div>;

  return <h1>{community?.name}</h1>;
}
```

#### Example: Fetch with Filters

```typescript
const { data } = useCommunities({ status: "active" });
```

### Mutating Data (Mutations)

#### Example: Create Community

```typescript
"use client";

import { useCreateCommunity } from "@/hooks/use-communities";
import { useState } from "react";

export default function CreateCommunityForm() {
  const [name, setName] = useState("");
  const createCommunity = useCreateCommunity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCommunity.mutateAsync({
        name,
        address: "...",
        country: "Nigeria",
        state: "Lagos",
        lga: "Ikeja",
        zipCode: "100001",
      });

      alert("Community created successfully!");
      setName("");
    } catch (error) {
      alert("Failed to create community");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Community name"
      />
      <button
        type="submit"
        disabled={createCommunity.isPending}
      >
        {createCommunity.isPending ? "Creating..." : "Create Community"}
      </button>
    </form>
  );
}
```

#### Example: Update Community

```typescript
const updateCommunity = useUpdateCommunity();

const handleUpdate = () => {
  updateCommunity.mutate({
    id: "community-id",
    name: "Updated Name",
  });
};
```

#### Example: Delete Community

```typescript
const deleteCommunity = useDeleteCommunity();

const handleDelete = (id: string) => {
  if (confirm("Are you sure?")) {
    deleteCommunity.mutate(id);
  }
};
```

---

## Creating New Hooks

Here's how to create hooks for new API endpoints:

### Step 1: Create the Hook File

Create `src/hooks/use-your-resource.ts`

### Step 2: Define Types

```typescript
export interface YourResource {
  id: string;
  name: string;
  // ... other fields
}

export interface CreateResourceInput {
  name: string;
  // ... required fields
}

export interface UpdateResourceInput extends Partial<CreateResourceInput> {
  id: string;
}
```

### Step 3: Define Query Keys

```typescript
export const resourceKeys = {
  all: ["resources"] as const,
  lists: () => [...resourceKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...resourceKeys.lists(), filters] as const,
  details: () => [...resourceKeys.all, "detail"] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
};
```

### Step 4: Create API Functions

```typescript
import { apiClient } from "@/lib/api-client";

const fetchResources = async (): Promise<YourResource[]> => {
  return apiClient.get<YourResource[]>("/your-endpoint");
};

const fetchResource = async (id: string): Promise<YourResource> => {
  return apiClient.get<YourResource>(`/your-endpoint/${id}`);
};

const createResource = async (data: CreateResourceInput): Promise<YourResource> => {
  return apiClient.post<YourResource>("/your-endpoint", data);
};

const updateResource = async ({ id, ...data }: UpdateResourceInput): Promise<YourResource> => {
  return apiClient.put<YourResource>(`/your-endpoint/${id}`, data);
};

const deleteResource = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/your-endpoint/${id}`);
};
```

### Step 5: Create Hooks

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useResources(filters?: { status?: string }) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: () => fetchResources(filters),
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => fetchResource(id),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateResource,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(data.id) });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}
```

---

## Best Practices

### 1. Query Keys Organization

Always use a structured query key factory:

```typescript
export const queryKeys = {
  all: ["resource"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id) => [...queryKeys.details(), id] as const,
};
```

### 2. Error Handling

```typescript
const { data, error, isError } = useResources();

if (isError) {
  if (error instanceof ApiError) {
    // Handle API-specific errors
    console.error(error.status, error.message);
  }
}
```

### 3. Loading States

```typescript
const { data, isLoading, isFetching } = useResources();

// isLoading: First time loading (no data yet)
// isFetching: Background refetch (data already exists)

if (isLoading) return <Spinner />;
if (isFetching) return <DataWithRefreshIndicator />;
```

### 4. Optimistic Updates

```typescript
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateResource,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: resourceKeys.detail(newData.id) });

      // Snapshot previous value
      const previous = queryClient.getQueryData(resourceKeys.detail(newData.id));

      // Optimistically update
      queryClient.setQueryData(resourceKeys.detail(newData.id), newData);

      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(resourceKeys.detail(newData.id), context?.previous);
    },
    onSettled: (data) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(data.id) });
    },
  });
}
```

### 5. Dependent Queries

```typescript
const { data: user } = useUser(userId);
const { data: posts } = usePosts(user?.id, {
  enabled: !!user?.id, // Only fetch when user is loaded
});
```

### 6. Pagination

```typescript
export function useResources(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: resourceKeys.list({ page, pageSize }),
    queryFn: () => fetchResources({ page, pageSize }),
    keepPreviousData: true, // Keep previous page while loading next
  });
}
```

---

## Examples

### Complete CRUD Example

```typescript
"use client";

import {
  useCommunities,
  useCreateCommunity,
  useUpdateCommunity,
  useDeleteCommunity
} from "@/hooks/use-communities";
import { useState } from "react";

export default function CommunitiesManager() {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Queries
  const { data: communities, isLoading } = useCommunities();

  // Mutations
  const createCommunity = useCreateCommunity();
  const updateCommunity = useUpdateCommunity();
  const deleteCommunity = useDeleteCommunity();

  const handleCreate = async (formData: FormData) => {
    await createCommunity.mutateAsync({
      name: formData.get("name") as string,
      // ... other fields
    });
  };

  const handleUpdate = async (id: string, data: any) => {
    await updateCommunity.mutateAsync({ id, ...data });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this community?")) {
      await deleteCommunity.mutateAsync(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <form action={handleCreate}>
        <input name="name" placeholder="Community name" required />
        <button type="submit" disabled={createCommunity.isPending}>
          Create
        </button>
      </form>

      <ul>
        {communities?.map((community) => (
          <li key={community.id}>
            {editingId === community.id ? (
              <EditForm
                community={community}
                onSave={(data) => handleUpdate(community.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <span>{community.name}</span>
                <button onClick={() => setEditingId(community.id)}>Edit</button>
                <button onClick={() => handleDelete(community.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Authentication Example

```typescript
// src/hooks/use-auth.ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user_id: string;
  userType: string;
  profile: {
    name: string;
    email: string;
    // ... other profile fields
  };
}

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>("/login", credentials);
};

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.profile));

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}
```

```typescript
// Usage in login page
"use client";

import { useLogin } from "@/hooks/use-auth";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login.mutateAsync({ username, password });
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? "Logging in..." : "Login"}
      </button>
      {login.isError && (
        <p className="error">Login failed. Please check your credentials.</p>
      )}
    </form>
  );
}
```

---

## Next Steps

1. **Create `.env.local`** file with your API URL
2. **Review** the API documentation in `API_DOCUMENTATION.md`
3. **Create hooks** for the endpoints you need (refer to the existing examples)
4. **Test** your API integration using the DevTools
5. **Add authentication** by creating an auth context/hook

For more information, visit:
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [API Documentation](./API_DOCUMENTATION.md)
