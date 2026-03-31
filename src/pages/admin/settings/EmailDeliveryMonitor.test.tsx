import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EmailDeliveryMonitor from "./EmailDeliveryMonitor";
import { TooltipProvider } from "@/components/ui/tooltip";

const mockToast = vi.fn();
const mockRefetch = vi.fn();
const mockUnwrap = vi.fn();
const mockResendMutation = vi.fn();
const mockUseGetEmailLogsQuery = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/redux/apis/emailLogsApi", () => ({
  useGetEmailLogsQuery: (params: unknown) => mockUseGetEmailLogsQuery(params),
  useResendEmailLogMutation: () => [mockResendMutation],
}));

describe("EmailDeliveryMonitor", () => {
  const renderPage = () =>
    render(
      <TooltipProvider>
        <MemoryRouter>
          <EmailDeliveryMonitor />
        </MemoryRouter>
      </TooltipProvider>,
    );

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGetEmailLogsQuery.mockReturnValue({
      data: {
        success: true,
        message: "Outbound email logs retrieved successfully.",
        data: [
          {
            id: "57f9ee45-9613-4229-8b4c-0ec93a264164",
            recipient_email: "student@example.com",
            subject: "Set up your account for The Prime College",
            template_name: "emails/auth/account_setup",
            template_key: "account_setup",
            status: "failed",
            related_user: "user-uuid",
            related_user_email: "student@example.com",
            reference_type: "user",
            reference_id: "user-uuid",
            metadata: {},
            attempt_count: 1,
            error_message: "SMTPAuthenticationError",
            can_resend: true,
            resend_block_reason: null,
            sent_at: null,
            created_at: "2026-03-31T08:14:34.529217Z",
            updated_at: "2026-03-31T08:14:40.529217Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUnwrap.mockResolvedValue({ detail: "Email resend has been queued." });
    mockResendMutation.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("loads failed logs by default", () => {
    renderPage();

    expect(mockUseGetEmailLogsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", limit: 100 }),
    );
  });

  it("resends failed email and refreshes list", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /resend/i }));

    await waitFor(() => {
      expect(mockResendMutation).toHaveBeenCalledWith("57f9ee45-9613-4229-8b4c-0ec93a264164");
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Email resend has been queued." }),
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
