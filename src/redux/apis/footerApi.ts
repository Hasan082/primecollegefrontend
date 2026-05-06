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
  footer_logo: string | File | {
    original: string;
    small?: string;
    medium?: string;
    large?: string;
  } | null;
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

export interface UpdateFooterRequest extends Partial<FooterSettings> {
  footer_logo_key?: string | null;
  clear_footer_logo?: boolean;
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
    updateFooterSettings: builder.mutation<{ success: boolean; message: string; data: FooterSettings }, FormData | UpdateFooterRequest>({
      query: (body) => ({
        url: "/api/settings/footer/admin/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["FooterSettings"],
    }),
    presignFooterLogo: builder.mutation<
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
        url: "/api/settings/footer/admin/presign-logo/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { 
  useGetFooterPublicQuery, 
  useUpdateFooterSettingsMutation,
  usePresignFooterLogoMutation,
} = footerApi;
export default footerApi;
