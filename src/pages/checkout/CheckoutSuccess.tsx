import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Home,
  Mail,
  PackageOpen,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const STORAGE_KEY = "primecollege_pending_checkout";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();

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

 
  useEffect(() => {
    clearCart();
    sessionStorage.removeItem("primecollege_payment_setup");
    sessionStorage.removeItem("primecollege_checkout_form");
    // We keep primecollege_pending_checkout for this mount to show the summary,
    // but the cart itself is now empty in localStorage.
  }, [clearCart]);

  const currency = checkoutSummary?.currency || "GBP";
  const subtotal = Number(
    checkoutSummary?.subtotal || checkoutSummary?.grandTotal || 0,
  );
  const discountTotal = Number(checkoutSummary?.discountTotal || 0);
  const totalPaid = Number(checkoutSummary?.grandTotal || 0);

  return (
    <div className="min-h-screen bg-muted px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-md border border-border bg-card px-6 py-10 text-center shadow-sm md:px-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/8">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Enrollment Successful!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Thank you for enrolling with The Prime College. A confirmation email
            has been sent to your inbox.
          </p>
        </section>

        <section className="rounded-md border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-foreground">
            Enrollment Details
          </h2>

          <div className="mt-6 flex items-center justify-between border-b border-border pb-4 text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-semibold text-foreground">
              {checkoutSummary?.orderNumber || "Pending"}
            </span>
          </div>

          <div className="mt-4 border-b border-border pb-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Enrolled Courses
            </p>
            <div className="space-y-4">
              {checkoutSummary?.items?.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.title}
                    </p>
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
              )) || (
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
              <span className="text-foreground">
                {currency}{" "}
                {subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {discountTotal > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-primary">
                  -{currency}{" "}
                  {discountTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-3 text-2xl font-bold">
              <span className="text-foreground">Total Paid</span>
              <span className="text-primary">
                {currency}{" "}
                {totalPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-foreground">
            What Happens Next?
          </h2>

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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/8">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  </div>
);

export default CheckoutSuccess;
