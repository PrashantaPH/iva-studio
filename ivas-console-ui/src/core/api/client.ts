import axios, {
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { handleMockRequest } from "@/mocks/handlers";

// Base URL for the future real backend (Spring Boot). The mock adapter below
// intercepts all requests so no server is required during development.
export const API_BASE = "/api/v1";

const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toUpperCase();
  const fullUrl = (config.url ?? "").replace(API_BASE, "");
  const result = await handleMockRequest(method, fullUrl, config.data);

  const response: AxiosResponse = {
    data: result.data,
    status: result.status,
    statusText: result.status >= 400 ? "Error" : "OK",
    headers: {},
    config,
  };

  if (result.status >= 400) {
    return Promise.reject({
      response,
      isAxiosError: true,
      message:
        (result.data as { message?: string })?.message ?? "Request failed",
    });
  }
  return response;
};

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  adapter: mockAdapter,
});

// Attach bearer token from stored session when present.
apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem("iva-auth");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.session?.tokens?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

export async function unwrap<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  const res = await promise;
  return res.data;
}
