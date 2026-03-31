import { api } from "../api";

export interface NavLinkItem {
  label: string;
  href?: string;
  order: number;
  is_active: boolean;
  is_dropdown?: boolean;
  is_mega_menu?: boolean;
  children?: NavLinkItem[];
}

export interface NavbarSettings {
  id?: string;
  dynamicNavLinks: NavLinkItem[];
  header_logo: string | null;
  header_logo_alt_text: string;
  is_active: boolean;
}

const navbarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNavbarPublic: builder.query<any, void>({
      query: () => ({
        url: "/api/settings/navigation/",
        method: "GET",
      }),
      providesTags: ["NavbarSettings"],
    }),
    updateNavbarSettings: builder.mutation<any, FormData | Partial<NavbarSettings>>({
      query: (data) => ({
        url: "/api/settings/navigation/",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NavbarSettings"],
    }),
    createNavbarSettings: builder.mutation<any, FormData | NavbarSettings>({
      query: (data) => ({
        url: "/api/settings/navigation/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["NavbarSettings"],
    }),
  }),
});

export const {
  useGetNavbarPublicQuery,
  useUpdateNavbarSettingsMutation,
  useCreateNavbarSettingsMutation,
} = navbarApi;
