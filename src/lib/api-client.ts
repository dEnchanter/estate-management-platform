// API Client Configuration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://16.171.32.5:8080/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean; // Skip adding auth header
}

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Helper to build headers with auth
function buildHeaders(config?: RequestConfig): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...config?.headers,
  };

  // Add auth token if available and not skipped
  if (!config?.skipAuth) {
    const token = getAuthToken();
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorData = isJson ? await response.json() : await response.text();
    throw new ApiError(
      response.status,
      errorData?.message || `Request failed with status ${response.status}`,
      errorData
    );
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as T;
}

export const apiClient = {
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: buildHeaders(config),
      ...config,
    });

    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: buildHeaders(config),
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });

    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: buildHeaders(config),
      ...config,
    });

    return handleResponse<T>(response);
  },
};
