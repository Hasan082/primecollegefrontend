import { api } from "../api";

export type EmailLogStatus = "queued" | "sent" | "failed";

export interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  template_name: string;
  template_key: string;
  status: EmailLogStatus;
  related_user: string | null;
  related_user_email: string | null;
  reference_type: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  attempt_count: number;
  error_message: string | null;
  can_resend: boolean;
  resend_block_reason: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetEmailLogsParams {
  status?: EmailLogStatus;
  template_key?: string;
  email?: string;
  limit?: number;
}

export interface EmailLogsResponse {
  success: boolean;
  message: string;
  data: EmailLog[];
}

export interface ResendEmailLogResponse {
  detail: string;
}

const emailLogsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmailLogs: builder.query<EmailLogsResponse, GetEmailLogsParams | void>({
      query: (params) => ({
        url: "/api/auth/admin/email-logs/",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((log) => ({ type: "EmailLogs" as const, id: log.id })),
              { type: "EmailLogs" as const, id: "LIST" },
            ]
          : [{ type: "EmailLogs" as const, id: "LIST" }],
    }),
    resendEmailLog: builder.mutation<ResendEmailLogResponse, string>({
      query: (id) => ({
        url: `/api/auth/admin/email-logs/${id}/resend/`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "EmailLogs", id },
        { type: "EmailLogs", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetEmailLogsQuery, useResendEmailLogMutation } = emailLogsApi;
export default emailLogsApi;
