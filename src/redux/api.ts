/* eslint-disable @typescript-eslint/no-explicit-any */
import { appConfig } from "@/app.config";
import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  DefinitionType,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: appConfig.API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // 1. Try to get token from Redux state (best for cross-origin)
    const state = getState() as any;
    const storedToken = state.auth?.csrfToken;

    if (storedToken) {
      headers.set("X-CSRFToken", storedToken);
      return headers;
    }

    // 2. Fallback to cookie (for same-domain/production)
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
      return match ? match[2] : undefined;
    };

    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    try {
      const state = api.getState() as any;
      const csrfToken = state.auth?.csrfToken;

      const refreshHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        refreshHeaders["X-CSRFToken"] = csrfToken;
      }

      const res = await fetch(
        appConfig.API_BASE_URL + "/api/auth/token/refresh/cookie",
        {
          method: "POST",
          credentials: "include",
          headers: refreshHeaders,
        },
      );

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          await res.json();
          // After a successful refresh, retry the original request
          return await baseQuery(args, api, extraOptions);
        }
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [],
  endpoints: () => ({}),
});
