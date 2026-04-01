import { api } from "../api";

export interface FooterLink {
  id?: string;
  label: string;
  url: string;
  is_external: boolean;
  order: number;
  is_active: boolean;
}

export interface LinkGroup {
  id?: string;
  title: string;
  order: number;
  links: FooterLink[];
}

export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  order: number;
  is_active: boolean;
}

export interface FooterSettings {
  id?: string;
  footer_logo: string | File | null;
  footer_logo_alt_text: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  link_groups: LinkGroup[];
  social_links: SocialLink[];
  copyright_name: string;
  copyright_year: number;
  updated_at?: string;
}

const footerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFooterPublic: builder.query<{ success: boolean; data: FooterSettings }, void>({
      query: () => ({
        url: "/api/settings/footer/public/",
        method: "GET",
      }),
      providesTags: ["FooterSettings"],
    }),
    updateFooterSettings: builder.mutation<{ success: boolean; message: string; data: FooterSettings }, FormData | any>({
      query: (body) => ({
        url: "/api/settings/footer/admin/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["FooterSettings"],
    }),
  }),
});

export const { useGetFooterPublicQuery, useUpdateFooterSettingsMutation } = footerApi;
export default footerApi;
