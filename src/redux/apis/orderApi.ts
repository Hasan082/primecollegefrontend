// /api/orders/checkout/online/

import { api } from "../api";

export interface CheckoutOnlineItemPayload {
  qualification_id: string;
  qualification_session_id?: string | null;
  is_upsell?: boolean;
  pricing_note?: string;
}

export interface CheckoutOnlinePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  billing_address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  items: CheckoutOnlineItemPayload[];
}

export interface CheckoutOnlineResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      id: string;
      order_number: string;
      subtotal: string;
      discount_total: string;
      grand_total: string;
      currency: string;
      items: Array<{
        id: string;
        qualification: string;
        qualification_title: string;
        qualification_session: string | null;
        qualification_session_title: string | null;
        unit_price_snapshot: string;
        discount_amount: string;
        is_upsell: boolean;
        pricing_note: string;
        line_total: string;
      }>;
    };
    payment_intent_client_secret: string;
    stripe_payment_intent_id: string;
    stripe_customer_id: string;
    stripe_publishable_key: string;
  };
}

export interface PublicOrderStatusResponse {
  success: boolean;
  message: string;
  data: {
    order_id: string;
    order_number: string;
    customer_email: string;
    status: string;
    status_label: string;
    status_view: "pending" | "processing" | "paid" | "failed" | "cancelled" | "refunded";
    status_message: string;
    is_terminal: boolean;
    poll_recommended_seconds: number | null;
    payment_method: string;
    currency: string;
    grand_total: string;
    paid_at: string | null;
    items: Array<{
      qualification_id: string;
      qualification_title: string;
      status: string;
      line_total: string;
    }>;
    stripe: {
      payment_intent_id: string | null;
      latest_session_status: string | null;
      latest_webhook_event_type: string | null;
      latest_webhook_processing_status: string | null;
    };
  };
}

const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    checkoutOnline: builder.mutation<CheckoutOnlineResponse, CheckoutOnlinePayload>({
      query: (data) => ({
        url: `/api/orders/checkout/online/`,
        method: "POST",
        body: data,
      }),
    }),
    getPublicOrderStatus: builder.query<PublicOrderStatusResponse, { order_number: string; email: string }>({
      query: ({ order_number, email }) => ({
        url: `/api/orders/status/`,
        method: "GET",
        params: { order_number, email },
      }),
    }),
  }),
});

export const { useCheckoutOnlineMutation, useGetPublicOrderStatusQuery } = orderApi;
