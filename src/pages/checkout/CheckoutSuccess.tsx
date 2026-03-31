import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Home, Mail, PackageOpen } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useGetPublicOrderStatusQuery } from "@/redux/apis/orderApi";

const STORAGE_KEY = "primecollege_pending_checkout";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkoutSummary = useMemo(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
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
      };
    } catch {
      return null;
    }
  }, []);

  const checkoutForm = useMemo(() => {
    const raw = sessionStorage.getItem("primecollege_checkout_form");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { email?: string };
    } catch {
      return null;
    }
  }, []);

  const orderNumberFromUrl = searchParams.get("order_number") || "";
  const orderNumber = orderNumberFromUrl || checkoutSummary?.orderNumber || "";
  const orderEmail = checkoutSummary?.customer?.email || checkoutForm?.email || "";
  const [shouldPollOrderStatus, setShouldPollOrderStatus] = useState(true);

  const {
    data: orderStatusResponse,
    isFetching: isStatusFetching,
  } = useGetPublicOrderStatusQuery(
    { order_number: orderNumber, email: orderEmail },
    {
      skip: !orderNumber || !orderEmail,
      pollingInterval: shouldPollOrderStatus ? 3000 : 0,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const orderStatus = orderStatusResponse?.data;

  useEffect(() => {
    if (orderStatus?.status_view === "failed") {
      const next = new URLSearchParams({
        order_number: orderStatus.order_number,
      });
      if (orderStatus.status_message) {
        next.set("message", orderStatus.status_message);
      }
      navigate(`/checkout/failed?${next.toString()}`, { replace: true });
      return;
    }

    if (orderStatus?.status_view === "cancelled") {
      navigate("/checkout/cancel", { replace: true });
    }
  }, [navigate, orderStatus]);

  useEffect(() => {
    // Stop polling after successful payment once order details are present.
    if (orderStatus?.status_view === "paid" && (orderStatus?.items?.length ?? 0) > 0) {
      setShouldPollOrderStatus(false);
    }
  }, [orderStatus?.items?.length, orderStatus?.status_view]);

  useEffect(() => {
    // Re-enable polling when the tracked order identity changes.
    setShouldPollOrderStatus(true);
  }, [orderEmail, orderNumber]);

  useEffect(() => {
    clearCart();
    sessionStorage.removeItem("primecollege_payment_setup");
    sessionStorage.removeItem("primecollege_checkout_form");
    // We keep primecollege_pending_checkout for this mount to show the summary,
    // but the cart itself is now empty in localStorage.
  }, [clearCart]);

  const currency = orderStatus?.currency || checkoutSummary?.currency || "GBP";
  const subtotal = Number(checkoutSummary?.subtotal || checkoutSummary?.grandTotal || orderStatus?.grand_total || 0);
  const discountTotal = Number(checkoutSummary?.discountTotal || 0);
  const totalPaid = Number(orderStatus?.grand_total || checkoutSummary?.grandTotal || 0);
  const enrolledItems = orderStatus?.items?.length
    ? orderStatus.items.map((item) => ({
      key: item.qualification_id,
      title: item.qualification_title,
      price: `${currency} ${Number(item.line_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      meta: item.status,
    }))
    : (checkoutSummary?.items || []).map((item) => ({
      key: item.slug,
      title: item.title,
      price: item.price,
      meta: [item.level, item.duration, item.qualificationSessionTitle].filter(Boolean).join(" • "),
    }));

  return (
    <div className="min-h-screen bg-muted px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-md border border-border bg-card px-6 py-10 text-center shadow-sm md:px-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Enrollment Successful!</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            {orderStatus?.status_message ||
              "Thank you for enrolling with The Prime College. We are confirming your payment."}
          </p>
          {(orderStatus?.status_view === "processing" || isStatusFetching) ? (
            <p className="mt-2 text-xs text-muted-foreground">Payment confirmation is in progress. This page refreshes automatically.</p>
          ) : null}
        </section>

        <section className="rounded-md border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-foreground">Enrollment Details</h2>

          <div className="mt-6 flex items-center justify-between border-b border-border pb-4 text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-semibold text-foreground">{orderStatus?.order_number || checkoutSummary?.orderNumber || "Pending"}</span>
          </div>

          <div className="mt-4 border-b border-border pb-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Enrolled Courses</p>
            <div className="space-y-4">
              {enrolledItems.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {item.meta ? <span>{item.meta}</span> : null}
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold text-foreground">{item.price}</span>
                </div>
              ))}
              {enrolledItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your enrolled courses will appear here once payment confirmation is available.</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">
                {currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {discountTotal > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-primary">
                  -{currency} {discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-3 text-2xl font-bold">
              <span className="text-foreground">Total Paid</span>
              <span className="text-primary">
                {currency} {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
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
            Back to Home
            <Home className="h-4 w-4" />
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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/8">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default CheckoutSuccess;
