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
  credentials: "include",
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const res = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/auth/refresh-token",
      {
        method: "GET",
        credentials: "include",
      },
    );

    await res.json();
  }

  return result;
};

export const base_api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    "exams",
    "exam",
    "subjects",
    "topics",
    "auth",
    "taken-exams",
    "users",
    "subscription",
    "notes",
    "notice",
  ],
  endpoints: () => ({}),
});
