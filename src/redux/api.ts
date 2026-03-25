import { appConfig } from "@/app.config";
import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
};

let csrfTokenMemory: string | null = null;

export const setCsrfToken = (token: string | null) => {
  csrfTokenMemory = token;
};

const getCsrfToken = () => csrfTokenMemory || getCookie("csrftoken");
const getRefreshToken = () => getCookie("refresh");

const baseQuery = fetchBaseQuery({
  baseUrl: appConfig.API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // const refreshCookie = getRefreshToken();
    // if (!refreshCookie) {
    //   return result;
    // }

    try {
      const refreshHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        refreshHeaders["X-CSRFToken"] = csrfToken;
      }

      const res = await fetch(
        appConfig.API_BASE_URL + "/api/auth/token/refresh/cookie/",
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
          return await baseQuery(args, api, extraOptions);
        }
      }
    } catch (err) {
      console.error("Token refresh error:", err);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: ["User", "Pages", "Qualifications", "QualificationPrices"],
  endpoints: () => ({}),
});
