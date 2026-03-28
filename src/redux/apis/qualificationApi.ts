import { api } from "../api";

export interface QualificationTaxonomy {
  id: string;
  name: string;
  slug?: string;
}

export interface QualificationAwardingBody {
  id: string;
  name: string;
}

export interface QualificationImageSet {
  original?: string;
  card?: string;
  hero_desktop?: string;
  hero_tablet?: string;
  hero_mobile?: string;
}

export interface QualificationSession {
  id: string;
  title: string;
  location_name: string;
  venue_address: string;
  start_at: string;
  end_at: string;
  available_seats: number | null;
  effective_price: string | null;
  is_featured: boolean;
}

export interface QualificationListItem {
  id: string;
  title: string;
  slug: string;
  featured_image: QualificationImageSet | null;
  excerpt: string;
  category: QualificationTaxonomy | null;
  level: QualificationTaxonomy | null;
  awarding_body: QualificationAwardingBody | null;
  current_price: string | null;
  currency: string;
  course_duration: string;
  is_cpd: boolean;
}

export interface QualificationPageReference {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
}

export interface QualificationDetail extends QualificationListItem {
  short_description: string;
  qualification_type: QualificationTaxonomy | null;
  delivery_mode: QualificationTaxonomy | null;
  hero_mode: "standard" | "session_booking";
  has_sessions: boolean;
  detail_page: QualificationPageReference | null;
  upcoming_sessions: QualificationSession[];
  is_cpd: boolean;
}

export interface QualificationUpsellItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  message: string;
  discount_amount: string;
  discount_percent: string;
  current_price: string | null;
  currency: string;
  featured_image: QualificationImageSet | null;
  bundle_original_price: string;
  bundle_discount_total: string;
  final_price: string;
}

export interface QualificationListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: QualificationListItem[];
  };
}

export interface QualificationDetailResponse {
  success: boolean;
  message: string;
  data: QualificationDetail;
}

export interface QualificationUpsellResponse {
  success: boolean;
  message: string;
  data: QualificationUpsellItem[];
}

const qualificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQualifications: builder.query<
      QualificationListResponse,
      Record<string, string | number | undefined> | void
    >({
      query: (params) => ({
        url: "/api/qualification/",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) => {
        const qualificationTags =
          result?.data?.results?.map((qualification) => ({
            type: "Qualifications" as const,
            id: qualification.id,
          })) || [];
        return [{ type: "Qualifications" as const, id: "LIST" }, ...qualificationTags];
      },
      keepUnusedDataFor: 30,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
    getQualificationDetail: builder.query<QualificationDetailResponse, string>({
      query: (slug) => ({
        url: `/api/qualification/${slug}/`,
        method: "GET",
      }),
      providesTags: (result, _error, slug) => [
        { type: "Qualifications" as const, id: slug },
        ...(result?.data?.id ? [{ type: "Qualifications" as const, id: result.data.id }] : []),
      ],
      keepUnusedDataFor: 30,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
    getUpSales: builder.query<QualificationUpsellResponse, string>({
      query: (slug) => ({
        url: `/api/qualification/${slug}/upsells/`,
        method: "GET",
      }),
      keepUnusedDataFor: 30,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
  }),
});

export const {
  useGetQualificationsQuery,
  useGetQualificationDetailQuery,
  useGetUpSalesQuery,
} = qualificationApi;
