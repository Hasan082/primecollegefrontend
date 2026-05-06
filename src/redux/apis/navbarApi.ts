import { api } from "../api";

export interface NavLinkItem {
  label: string;
  href?: string;
  short_description?: string;
  order: number;
  is_active: boolean;
  is_dropdown?: boolean;
  is_mega_menu?: boolean;
  children?: NavLinkItem[];
}

export interface NavbarSettings {
  id?: string;
  dynamicNavLinks: NavLinkItem[];
  header_logo: string | {
    original: string;
    small?: string;
    medium?: string;
    large?: string;
  } | null;
  header_logo_alt_text: string;
  is_active: boolean;
}

export interface UpdateNavbarRequest extends Partial<NavbarSettings> {
  header_logo_key?: string | null;
  clear_header_logo?: boolean;
}

const navbarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNavbarPublic: builder.query<{ success: boolean; data: NavbarSettings }, void>({
      query: () => ({
        url: "/api/settings/navigation/",
        method: "GET",
      }),
      providesTags: ["NavbarSettings"],
    }),
    updateNavbarSettings: builder.mutation<any, FormData | UpdateNavbarRequest>({
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
    presignHeaderLogo: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          upload_url: string;
          fields: Record<string, string>;
          key: string;
          public_url?: string;
        };
      },
      { file_name: string; content_type: string }
    >({
      query: (body) => ({
        url: "/api/settings/navigation/presign-logo/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetNavbarPublicQuery,
  useUpdateNavbarSettingsMutation,
  useCreateNavbarSettingsMutation,
  usePresignHeaderLogoMutation,
} = navbarApi;
