import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Lock, ShieldCheck, X } from "lucide-react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutOnlineMutation } from "@/redux/apis/orderApi";
import { useToast } from "@/hooks/use-toast";

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

const extractErrorMessage = (detail: any): string => {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const nested = detail.map(extractErrorMessage).filter(Boolean);
    return nested.join(" ");
  }

  if (detail && typeof detail === "object") {
    if (detail.message && typeof detail.message === "string") return detail.message;
    if (detail.detail && typeof detail.detail === "string") return detail.detail;
    if (detail.error && typeof detail.error === "string") return detail.error;

    const values = Object.values(detail as Record<string, unknown>)
      .map(extractErrorMessage)
      .filter(Boolean);
    return values.join(" ");
  }

  return "";
};

interface CustomerFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}

interface PaymentSetupState {
  clientSecret: string;
  publishableKey: string;
  orderNumber: string;
}

const isCheckoutFormComplete = (form: CustomerFormState) =>
  [
    form.firstName,
    form.lastName,
    form.email,
    form.phone,
    form.address,
    form.city,
    form.postcode,
    form.country,
  ].every((value) => value.trim().length > 0);

const PaymentElementSection = ({
  clientSecret,
  publishableKey,
  form,
  orderNumber,
  submitButtonRef,
}: {
  clientSecret: string;
  publishableKey: string;
  form: CustomerFormState;
  orderNumber: string;
  submitButtonRef?: React.RefObject<HTMLButtonElement>;
}) => {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  const elementOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#0e4a86",
          borderRadius: "14px",
        },
      },
    }),
    [clientSecret],
  );

  return (
    <Elements stripe={stripePromise} options={elementOptions}>
      <PaymentElementForm form={form} orderNumber={orderNumber} submitButtonRef={submitButtonRef} />
    </Elements>
  );
};

const PaymentElementForm = ({
  form,
  orderNumber,
  submitButtonRef,
}: {
  form: CustomerFormState;
  orderNumber: string;
  submitButtonRef?: React.RefObject<HTMLButtonElement>;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentElementOptions: any = {
    layout: "tabs",
    defaultValues: {
      billingDetails: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        address: {
          line1: form.address,
          city: form.city,
          postal_code: form.postcode,
          country: form.country.toLowerCase() === "united kingdom" ? "GB" : form.country,
        },
      },
    },
  };

  const handleConfirmPayment = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_number=${encodeURIComponent(orderNumber)}`,
        payment_method_data: {
          billing_details: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email,
            phone: form.phone,
            address: {
              line1: form.address,
              city: form.city,
              postal_code: form.postcode,
              country: form.country.toLowerCase() === "united kingdom" ? "GB" : form.country,
            },
          },
        },
      },
    });

    if (error) {
      toast({
        title: "Payment could not be completed",
        description: error.message || "Please review your payment details and try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitButtonRef?.current) {
      const btn = submitButtonRef.current;
      const handler = () => handleConfirmPayment();
      btn.addEventListener("click", handler);
      return () => btn.removeEventListener("click", handler);
    }
  }, [stripe, elements, submitButtonRef]);

  return (
    <div className="mt-4 space-y-4">
      <PaymentElement options={paymentElementOptions} />
      <div className="hidden">
        <button id="stripe-confirm-btn" onClick={handleConfirmPayment}>
          Confirm
        </button>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { items, removeItem } = useCart();
  const { toast } = useToast();
  const [checkoutOnline, { isLoading: isPreparingPayment }] = useCheckoutOnlineMutation();
  const [paymentSetup, setPaymentSetup] = useState<PaymentSetupState | null>(() => {
    const saved = sessionStorage.getItem("primecollege_payment_setup");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [form, setForm] = useState<CustomerFormState>(() => {
    const saved = sessionStorage.getItem("primecollege_checkout_form");
    return saved
      ? JSON.parse(saved)
      : {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
      };
  });

  const paymentStepRef = React.useRef<HTMLDivElement>(null);
  const sidebarSubmitRef = React.useRef<HTMLButtonElement>(null);
  const autoPrepareTimeoutRef = React.useRef<number | null>(null);
  const lastPreparedSignatureRef = React.useRef<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem("primecollege_checkout_form", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (paymentSetup) {
      sessionStorage.setItem("primecollege_payment_setup", JSON.stringify(paymentSetup));
    } else {
      sessionStorage.removeItem("primecollege_payment_setup");
    }
  }, [paymentSetup]);

  const isFormComplete = useMemo(() => isCheckoutFormComplete(form), [form]);

  const checkoutSignature = useMemo(() => JSON.stringify({
    form,
    items: items.map((item) => ({
      qualificationId: item.qualificationId,
      qualificationSessionId: item.qualificationSessionId || null,
      isUpsell: Boolean(item.isUpsell),
      pricingNote: item.pricingNote || "",
    })),
  }), [form, items]);

  const preparePayment = async () => {
    if (items.length === 0) return;
    try {
      const response = await checkoutOnline({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        billing_address: form.address,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
        items: items.map((item) => ({
          qualification_id: item.qualificationId,
          qualification_session_id: item.qualificationSessionId || undefined,
          is_upsell: item.isUpsell || false,
          pricing_note: item.pricingNote || "",
        })),
      }).unwrap();

      setPaymentSetup({
        clientSecret: response.data.payment_intent_client_secret,
        publishableKey: response.data.stripe_publishable_key,
        orderNumber: response.data.order.order_number,
      });
      sessionStorage.setItem(
        "primecollege_pending_checkout",
        JSON.stringify({
          orderNumber: response.data.order.order_number,
          subtotal: response.data.order.subtotal,
          discountTotal: response.data.order.discount_total,
          grandTotal: response.data.order.grand_total,
          currency: response.data.order.currency,
          items: response.data.order.items.map((item) => ({
            slug: item.id,
            title: item.qualification_title,
            price: `${response.data.order.currency} ${Number(item.line_total).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            qualificationSessionTitle: item.qualification_session_title,
          })),
          customer: { firstName: form.firstName, email: form.email },
        }),
      );
      lastPreparedSignatureRef.current = checkoutSignature;

      toast({
        title: "Payment ready",
        description: "Enter your card details below to complete the payment on this page.",
      });

      setTimeout(() => {
        paymentStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error: any) {
      const description =
        extractErrorMessage(error?.data?.detail || error?.data?.data || error?.data || error?.message) ||
        "Unable to prepare secure payment. Please review your details and try again.";
      toast({
        title: "Checkout failed",
        description,
        variant: "destructive",
      });
    }
  };

  const handlePreparePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    await preparePayment();
  };

  useEffect(() => {
    if (items.length === 0 || paymentSetup || isPreparingPayment || !isFormComplete) {
      return;
    }

    if (lastPreparedSignatureRef.current === checkoutSignature) {
      return;
    }

    lastPreparedSignatureRef.current = checkoutSignature;

    autoPrepareTimeoutRef.current = window.setTimeout(() => {
      if (!isPreparingPayment && !paymentSetup && items.length > 0) {
        void preparePayment();
      }
    }, 350);

    return () => {
      if (autoPrepareTimeoutRef.current) {
        window.clearTimeout(autoPrepareTimeoutRef.current);
        autoPrepareTimeoutRef.current = null;
      }
    };
  }, [checkoutSignature, paymentSetup, isPreparingPayment, isFormComplete, items.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold text-foreground">Your Basket Is Empty</h1>
        <p className="mb-6 text-muted-foreground">Add a qualification before starting secure checkout.</p>
        <Link
          to="/qualifications"
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          View qualifications
        </Link>
      </div>
    );
  }

  const selectedUpsellItem = items.find((item) => item.isUpsell && (item.bundleDiscountTotal || 0) > 0);
  const subtotal = selectedUpsellItem?.bundleOriginalPrice || items.reduce((sum, item) => sum + item.priceValue, 0);
  const discountTotal = selectedUpsellItem?.bundleDiscountTotal || 0;
  const estimatedTotal = subtotal - discountTotal;
  const currency = items[0]?.currency || "GBP";
  const inputsLocked = Boolean(paymentSetup);

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-primary py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link to="/qualifications" className="flex items-center gap-2 text-sm hover:opacity-80">
            <ChevronLeft className="h-4 w-4" />
            Back to qualifications
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4" />
            Secure Stripe payment
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="mb-10 flex items-center justify-center gap-2 text-sm">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">1</span>
          <span className="font-semibold text-foreground">Basket</span>
          <span className="h-px w-8 bg-border" />
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">2</span>
          <span className="font-semibold text-foreground">Your details</span>
          <span className="h-px w-8 bg-border" />
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">3</span>
          <span className="font-semibold text-foreground">Payment</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <form id="checkout-form" onSubmit={handlePreparePayment} className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Learner details</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">First name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Last name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Email address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Phone number *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Billing address</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Street address *</label>
                  <input name="address" value={form.address} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Postcode *</label>
                    <input name="postcode" value={form.postcode} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Country *</label>
                  <input name="country" value={form.country} onChange={handleChange} required className={inputClass} disabled={inputsLocked} />
                </div>
              </div>
            </div>

            <div ref={paymentStepRef} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Payment step</h2>
              </div>
              {!paymentSetup ? (
                <div className="mt-4 space-y-4">
                  {/* Skeleton for card form */}
                  <div className="animate-pulse space-y-3">
                    <div className="h-10 rounded-xl bg-muted/50" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-10 rounded-xl bg-muted/50" />
                      <div className="h-10 rounded-xl bg-muted/50" />
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {!isFormComplete
                      ? "Complete the learner and billing details above to reveal secure payment fields."
                      : isPreparingPayment ? "Preparing secure payment form..." : "Connecting to Stripe..."}
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground text-primary font-medium">
                    Please enter your card details and complete payment below.
                  </p>
                  <PaymentElementSection
                    clientSecret={paymentSetup.clientSecret}
                    publishableKey={paymentSetup.publishableKey}
                    form={form}
                    orderNumber={paymentSetup.orderNumber}
                    submitButtonRef={sidebarSubmitRef}
                  />
                </>
              )}
            </div>
          </form>

          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">
                Order summary ({items.length} qualification{items.length !== 1 ? "s" : ""})
              </h2>

              <div className="mb-4 mt-5 space-y-3 border-b border-border pb-4">
                {items.map((item) => (
                  <div
                    key={`${item.qualificationId}-${item.qualificationSessionId || "no-session"}-${item.isUpsell ? "upsell" : "base"}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-tight text-foreground">{item.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {item.category ? <span>{item.category}</span> : null}
                        {item.level ? <span>• {item.level}</span> : null}
                        {item.qualificationSessionTitle ? <span>• {item.qualificationSessionTitle}</span> : null}
                      </div>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{item.price}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        disabled={inputsLocked}
                        className="text-muted-foreground hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4 space-y-2 border-b border-border pb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated subtotal</span>
                  <span className="text-foreground">{formatMoney(subtotal, currency)}</span>
                </div>
                {discountTotal > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-primary">-{formatMoney(discountTotal, currency)}</span>
                  </div>
                ) : null}
              </div>

              <div className="mb-4 flex justify-between text-base font-bold">
                <span className="text-foreground">Estimated total</span>
                <span className="text-primary">{formatMoney(estimatedTotal, currency)}</span>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">
                {paymentSetup
                  ? "Payment has been prepared for this basket. To change items or learner details, go back to qualifications and start a fresh checkout."
                  : isFormComplete
                    ? "We are preparing Stripe's secure payment form for this basket."
                    : "Your card details will be handled securely by Stripe within this checkout page."}
              </div>

              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  SSL encrypted
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Stripe secured
                </div>
              </div>

              {!paymentSetup ? (
                <button
                  disabled
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-muted py-4 text-sm font-bold text-muted-foreground cursor-not-allowed border border-border"
                >
                  <Lock className="h-4 w-4" />
                  {isFormComplete ? "Preparing Payment..." : "Complete Details to Pay"}
                </button>
              ) : (
                <button
                  ref={sidebarSubmitRef}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-4 text-sm font-bold text-secondary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  <Lock className="h-4 w-4" />
                  Pay {formatMoney(estimatedTotal, currency)} Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
