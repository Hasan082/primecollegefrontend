import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Home,
  Loader2,
  Mail,
  PackageOpen,
  RefreshCw,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useGetPublicOrderStatusQuery } from "@/redux/apis/orderApi";

const STORAGE_KEY = "primecollege_pending_checkout";
const DEFAULT_POLL_SECONDS = 5;
const MAX_POLL_ATTEMPTS = 24; // ~2 minutes

const normalizeCurrencyCode = (currency?: string | null) => {
  const value = (currency || "").trim();
  if (!value) return "GBP";
  if (value === "£") return "GBP";
  if (value === "$") return "USD";
  if (value === "€") return "EUR";
  if (/^[A-Z]{3}$/.test(value)) return value;
  return "GBP";
};

const formatMoney = (value: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: normalizeCurrencyCode(currency),
    maximumFractionDigits: 2,
  }).format(value);

interface PendingCheckout {
  orderNumber: string;
  subtotal?: string;
  discountTotal?: string;
  grandTotal: string;
  currency: string;
  items: Array<{
    slug: string;
    title: string;
    price: string;
    level?: string | null;
    duration?: string;
    qualificationSessionTitle?: string | null;
  }>;
  customer?: { firstName: string; email: string };
}

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();

  // order_number comes from Stripe's return_url query param
  const orderNumberFromUrl = searchParams.get("order_number") || "";

  // Local snapshot saved at checkout time (for email + fallback display)
  const [localSnapshot] = useState<PendingCheckout | null>(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingCheckout;
    } catch {
      return null;
    }
  });

  const orderNumber = orderNumberFromUrl || localSnapshot?.orderNumber || "";
  const email = localSnapshot?.customer?.email || "";

  // Polling state
  const [pollCount, setPollCount] = useState(0);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [secondsUntilNextPoll, setSecondsUntilNextPoll] = useState(0);
  const countdownRef = useRef<number | null>(null);

  const {
    data: apiResponse,
    isFetching,
    isError,
    refetch,
  } = useGetPublicOrderStatusQuery(
    { order_number: orderNumber, email },
    {
      skip: !orderNumber || !email,
      refetchOnMountOrArgChange: true,
    },
  );

  const orderData = apiResponse?.data;
  const isTerminal = orderData?.is_terminal ?? false;
  const statusView = orderData?.status_view;
  const isFailed =
    statusView === "failed" ||
    statusView === "cancelled" ||
    statusView === "refunded";

  // Clear cart on mount; clean up snapshot on unmount
  useEffect(() => {
    clearCart();
    sessionStorage.removeItem("primecollege_payment_setup");
    sessionStorage.removeItem("primecollege_checkout_form");
    return () => {
      sessionStorage.removeItem(STORAGE_KEY);
    };
  }, [clearCart]);

  // Polling loop
  useEffect(() => {
    if (!pollingEnabled || isTerminal || pollCount >= MAX_POLL_ATTEMPTS) {
      if (isTerminal || pollCount >= MAX_POLL_ATTEMPTS) setPollingEnabled(false);
      return;
    }
    if (!orderNumber || !email) return;

    const waitSeconds = orderData?.poll_recommended_seconds ?? DEFAULT_POLL_SECONDS;
    setSecondsUntilNextPoll(waitSeconds);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = window.setInterval(() => {
      setSecondsUntilNextPoll((s) => Math.max(0, s - 1));
    }, 1000);

    const timer = window.setTimeout(() => {
      setPollCount((c) => c + 1);
      refetch();
    }, waitSeconds * 1000);

    return () => {
      clearTimeout(timer);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [pollCount, isTerminal, pollingEnabled, orderNumber, email]);

  const handleManualRefresh = () => {
    if (isFetching) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    setPollCount((c) => c + 1);
    refetch();
  };

  // ── Resolved display values (API takes priority; falls back to snapshot) ──
  const checkoutSummary = localSnapshot; // alias for readability

  // Items: prefer API items, fall back to snapshot items
  const displayItems =
    orderData?.items && orderData.items.length > 0
      ? orderData.items.map((it) => ({
        slug: it.qualification_id,
        title: it.qualification_title,
        price: formatMoney(Number(it.line_total), orderData.currency),
        level: null as string | null,
        duration: undefined as string | undefined,
        qualificationSessionTitle: null as string | null,
      }))
      : (checkoutSummary?.items ?? []);

  const currency = orderData?.currency || checkoutSummary?.currency || "GBP";
  const subtotal = Number(
    checkoutSummary?.subtotal || checkoutSummary?.grandTotal || orderData?.grand_total || 0,
  );
  const discountTotal = Number(checkoutSummary?.discountTotal || 0);
  const totalPaid = Number(orderData?.grand_total || checkoutSummary?.grandTotal || 0);
  const displayOrderNumber =
    orderData?.order_number || checkoutSummary?.orderNumber || orderNumber || "Pending";

  // ── Polling / confirming state ─────────────────────────────────────────────
  if (!isTerminal && pollingEnabled && !isFailed) {
    return (
      <div className="min-h-screen bg-muted px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-md border border-border bg-card px-6 py-10 text-center shadow-sm md:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
              {isFetching ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-10 w-10 text-primary opacity-40" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-foreground">Verifying Order…</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Thank you for enrolling with The Prime College. We are verifying your
              order with Stripe - please don't close this page.
            </p>
            {displayOrderNumber && displayOrderNumber !== "Pending" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Order reference:{" "}
                <span className="font-semibold text-foreground">{displayOrderNumber}</span>
              </p>
            )}
            {!isFetching && (
              <p className="mt-3 text-xs text-muted-foreground">
                Checking again in{" "}
                <span className="font-semibold text-foreground">{secondsUntilNextPoll}s</span>…
              </p>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isFetching}
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Checking…" : "Check Now"}
            </button>
          </section>
        </div>
      </div>
    );
  }

  // ── Max polls reached (still not terminal) ────────────────────────────────
  if (!pollingEnabled && !isTerminal && !isFailed) {
    return (
      <div className="min-h-screen bg-muted px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-md border border-border bg-card px-6 py-10 text-center shadow-sm md:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
              <CheckCircle2 className="h-10 w-10 text-primary opacity-40" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Still Processing…</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Thank you for enrolling with The Prime College. Your payment is taking a little
              longer to confirm. A confirmation email will be sent to your inbox once it's
              processed — please don't re-submit.
            </p>
            {displayOrderNumber && displayOrderNumber !== "Pending" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Order reference:{" "}
                <span className="font-semibold text-foreground">{displayOrderNumber}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => {
                  setPollingEnabled(true);
                  setPollCount(0);
                  refetch();
                }}
                className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" /> Retry Check
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-bold text-foreground hover:bg-muted"
              >
                Back to Home <Home className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ── Failed / error state ───────────────────────────────────────────────────
  if (isFailed || isError) {
    return (
      <div className="min-h-screen bg-muted px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-md border border-border bg-card px-6 py-10 text-center shadow-sm md:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
              <PackageOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Payment {orderData?.status_label || "Not Confirmed"}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              {orderData?.status_message ||
                "We were unable to confirm your payment. Please try again or contact our support team."}
            </p>
            {displayOrderNumber && displayOrderNumber !== "Pending" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Order reference:{" "}
                <span className="font-semibold text-foreground">{displayOrderNumber}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/checkout"
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-bold text-primary-foreground hover:opacity-90"
              >
                Try Again
              </Link>
              <Link
                to="/qualifications"
                className="flex flex-1 items-center justify-center rounded-md border border-border bg-card px-6 py-4 text-sm font-bold text-foreground hover:bg-muted"
              >
                Browse More Courses
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }



  // ── SUCCESS — original UI restored exactly ────────────────────────────────
  return (
    <div className="min-h-screen bg-muted px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
        <section className="rounded-md border border-border bg-card px-6 py-10 text-center shadow-sm md:px-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Enrollment Successful!</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Thank you for enrolling with The Prime College. A confirmation email
            has been sent to your inbox.
          </p>
        </section>

        <section className="rounded-md border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-foreground">Enrollment Details</h2>

          <div className="mt-6 flex items-center justify-between border-b border-border pb-4 text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-semibold text-foreground">{displayOrderNumber}</span>
          </div>

          <div className="mt-4 border-b border-border pb-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Enrolled Courses
            </p>
            <div className="space-y-4">
              {displayItems.length > 0 ? (
                displayItems.map((item, idx) => (
                  <div
                    key={item.slug || idx}
                    className="flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {item.level ? <span>{item.level}</span> : null}
                        {item.duration ? <span>• {item.duration}</span> : null}
                        {item.qualificationSessionTitle ? (
                          <span>• {item.qualificationSessionTitle}</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold text-foreground">
                      {item.price}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your enrolled courses will appear here once payment
                  confirmation is available.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatMoney(subtotal, currency)}</span>
            </div>
            {discountTotal > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-primary">-{formatMoney(discountTotal, currency)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-3 text-2xl font-bold">
              <span className="text-foreground">Total Paid</span>
              <span className="text-primary">{formatMoney(totalPaid, currency)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-foreground">What Happens Next?</h2>

          <div className="mt-6 space-y-5">
            <SuccessStep
              icon={<Mail className="h-5 w-5 text-primary" />}
              title="Check Your Email"
              description="You'll receive a welcome email with login credentials for the learning portal within 24 hours."
            />
            <SuccessStep
              icon={<CalendarDays className="h-5 w-5 text-primary" />}
              title="Induction Session"
              description="Our team will contact you to schedule your induction and orientation session."
            />
            <SuccessStep
              icon={<PackageOpen className="h-5 w-5 text-primary" />}
              title="Course Materials"
              description="Access your course materials and study resources through the learning portal once activated."
            />
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            to="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/qualifications"
            className="flex flex-1 items-center justify-center rounded-md border border-border bg-card px-6 py-4 text-sm font-bold text-foreground hover:bg-muted"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

const SuccessStep = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/8">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default CheckoutSuccess;
