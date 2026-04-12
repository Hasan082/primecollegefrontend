import { api } from "../api";

export interface ContactForm {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface PaginatedContactForms {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContactForm[];
}

export interface ContactFormsResponse {
  success: boolean;
  message: string;
  data: PaginatedContactForms;
}

export const contactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContactForms: builder.query<
      ContactFormsResponse,
      { page?: number; search?: string }
    >({
      query: (params) => ({
        url: "/api/settings/contact-form/",
        params,
      }),
      providesTags: ["ContactForms"],
    }),
    submitContactForm: builder.mutation<
      ContactForm,
      { full_name: string; email: string; subject: string; message: string }
    >({
      query: (body) => ({
        url: "/api/settings/contact-form/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContactForms"],
    }),
  }),
});

export const { useGetContactFormsQuery, useSubmitContactFormMutation } =
  contactApi;
