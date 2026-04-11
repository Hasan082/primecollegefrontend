import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle2, CreditCard, CalendarPlus, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateLearnerExtensionOrderMutation,
  useGetLearnerExtensionOrderStatusQuery,
  useGetLearnerExtensionPlansQuery,
  type LearnerExtensionPlan,
} from "@/redux/apis/enrolmentApi";
import { useGetMeQuery } from "@/redux/apis/authApi";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const normalizeCurrencyCode = (currency?: string | null) => {
  const value = (currency || "").trim();
  if (!value) return "GBP";
  if (value === "£") return "GBP";
  if (value === "$") return "USD";
  if (value === "€") return "EUR";
  if (/^[A-Z]{3}$/.test(value)) return value;
  return "GBP";
};

const formatMoney = (value: number | string, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: normalizeCurrencyCode(currency),
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const extractErrorMessage = (detail: unknown): string => {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(extractErrorMessage).filter(Boolean).join(" ");
  if (detail && typeof detail === "object") {
    const record = detail as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.error === "string") return record.error;
    return Object.values(record).map(extractErrorMessage).filter(Boolean).join(" ");
  }
  return "";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB");
};

interface BillingFormState {
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
  orderId: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrolmentId: string;
  qualificationTitle: string;
  currentExpiry: string;
}

const ExtensionPaymentElementSection = ({
  clientSecret,
  publishableKey,
  form,
  orderNumber,
  submitButtonRef,
}: {
  clientSecret: string;
  publishableKey: string;
  form: BillingFormState;
  orderNumber: string;
  submitButtonRef: React.RefObject<HTMLButtonElement>;
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
      <ExtensionPaymentElementForm form={form} orderNumber={orderNumber} submitButtonRef={submitButtonRef} />
    </Elements>
  );
};

const ExtensionPaymentElementForm = ({
  form,
  orderNumber,
  submitButtonRef,
}: {
  form: BillingFormState;
  orderNumber: string;
  submitButtonRef: React.RefObject<HTMLButtonElement>;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmPayment = async () => {
    if (!stripe || !elements || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/learner/qualifications?extension_order_number=${encodeURIComponent(orderNumber)}`,
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
    const btn = submitButtonRef.current;
    if (!btn) return;
    btn.onclick = () => {
      void handleConfirmPayment();
    };
    return () => {
      btn.onclick = null;
    };
  }, [submitButtonRef, stripe, elements, isSubmitting]);

  return <PaymentElement options={{ layout: "tabs" }} />;
};

const ExtensionRequestModal = ({ open, onOpenChange, enrolmentId, qualificationTitle, currentExpiry }: Props) => {
  const [selectedPlan, setSelectedPlan] = useState<LearnerExtensionPlan | null>(null);
  const [step, setStep] = useState<"select" | "payment" | "success">("select");
  const [paymentSetup, setPaymentSetup] = useState<PaymentSetupState | null>(null);
  const [orderStatusArgs, setOrderStatusArgs] = useState<{ enrolmentId: string; orderId: string } | null>(null);
  const [billingForm, setBillingForm] = useState<BillingFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  });
  const sidebarSubmitRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const { data: meData } = useGetMeQuery(undefined);
  const { data: plansResponse, isLoading, error, refetch } = useGetLearnerExtensionPlansQuery(enrolmentId, {
    skip: !open || !enrolmentId,
  });
  const [createExtensionOrder, { isLoading: isPreparingPayment }] = useCreateLearnerExtensionOrderMutation();
  const { data: extensionOrderStatus } = useGetLearnerExtensionOrderStatusQuery(orderStatusArgs!, {
    skip: !orderStatusArgs,
  });

  const plans = plansResponse?.data || [];
  const user = meData?.data?.user;

  useEffect(() => {
    if (!open) return;
    setBillingForm((prev) => ({
      ...prev,
      firstName: user?.first_name || prev.firstName,
      lastName: user?.last_name || prev.lastName,
      email: user?.email || prev.email,
      phone: user?.phone || prev.phone || "",
    }));
  }, [open, user]);

  useEffect(() => {
    const paidOrder = extensionOrderStatus?.data;
    if (paidOrder?.status === "paid") {
      setStep("success");
      toast({
        title: "Payment successful",
        description: `Your access has been extended until ${formatDateTime(paidOrder.extended_access_expires_at)}.`,
      });
    }
  }, [extensionOrderStatus, toast]);

  const newExpiry = extensionOrderStatus?.data?.extended_access_expires_at
    ? formatDateTime(extensionOrderStatus.data.extended_access_expires_at)
    : paymentSetup && selectedPlan
      ? `${selectedPlan.duration_months} month${selectedPlan.duration_months > 1 ? "s" : ""} added after payment`
      : "";

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return;

    try {
      const response = await createExtensionOrder({
        enrolmentId,
        plan_id: selectedPlan.id,
      }).unwrap();

      setPaymentSetup({
        clientSecret: response.data.payment_intent_client_secret,
        publishableKey: response.data.stripe_publishable_key,
        orderNumber: response.data.extension_order.order.order_number,
        orderId: response.data.extension_order.order.id,
      });
      setOrderStatusArgs({
        enrolmentId,
        orderId: response.data.extension_order.order.id,
      });
      setStep("payment");
      toast({
        title: "Payment ready",
        description: "Enter your card details below to complete your extension payment.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to start extension payment",
        description:
          extractErrorMessage(error?.data?.detail || error?.data?.data || error?.data || error?.message) ||
          "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSelectedPlan(null);
      setStep("select");
      setPaymentSetup(null);
      setOrderStatusArgs(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" /> Extend Deadline
          </DialogTitle>
        </DialogHeader>

        {step === "success" ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold">Extension Activated!</h3>
            <p className="text-sm text-muted-foreground">
              Your {selectedPlan?.label} extension is now active. New expiry: <span className="font-semibold text-foreground">{newExpiry}</span>
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground mt-2">
              A receipt has been sent to your email address.
            </div>
            <Button onClick={handleClose} className="mt-4">Close</Button>
          </div>
        ) : step === "payment" ? (
          <div className="space-y-4 pt-2">
            <Card className="p-4 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Summary</p>
              <div className="flex justify-between text-sm">
                <span>{selectedPlan?.label} Extension</span>
                <span className="font-semibold">{formatMoney(selectedPlan?.amount || 0, selectedPlan?.currency)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{qualificationTitle}</p>
              <div className="border-t border-border mt-3 pt-2 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>{formatMoney(selectedPlan?.amount || 0, selectedPlan?.currency)}</span>
              </div>
            </Card>

            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Billing Details
              </p>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name</Label>
                    <Input value={billingForm.firstName} onChange={(e) => setBillingForm((prev) => ({ ...prev, firstName: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name</Label>
                    <Input value={billingForm.lastName} onChange={(e) => setBillingForm((prev) => ({ ...prev, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={billingForm.email} onChange={(e) => setBillingForm((prev) => ({ ...prev, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input value={billingForm.phone} onChange={(e) => setBillingForm((prev) => ({ ...prev, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Input value={billingForm.address} onChange={(e) => setBillingForm((prev) => ({ ...prev, address: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">City</Label>
                    <Input value={billingForm.city} onChange={(e) => setBillingForm((prev) => ({ ...prev, city: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Postcode</Label>
                    <Input value={billingForm.postcode} onChange={(e) => setBillingForm((prev) => ({ ...prev, postcode: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Country</Label>
                    <Input value={billingForm.country} onChange={(e) => setBillingForm((prev) => ({ ...prev, country: e.target.value }))} />
                  </div>
                </div>
                {paymentSetup ? (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Card Details
                    </p>
                    <ExtensionPaymentElementSection
                      clientSecret={paymentSetup.clientSecret}
                      publishableKey={paymentSetup.publishableKey}
                      form={billingForm}
                      orderNumber={paymentSetup.orderNumber}
                      submitButtonRef={sidebarSubmitRef}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Your payment is handled securely by Stripe on this page.</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("select")}>Back</Button>
              <Button ref={sidebarSubmitRef} className="flex-1 gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Pay {formatMoney(selectedPlan?.amount || 0, selectedPlan?.currency)}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Qualification</p>
              <p className="text-sm font-medium">{qualificationTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">Current expiry: {currentExpiry}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Select Extension Plan</p>
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading plans...
                </div>
              ) : error ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Unable to load extension plans.</p>
                      <p className="text-muted-foreground mt-1">
                        {extractErrorMessage((error as any)?.data?.detail || (error as any)?.data) || "Please try again."}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`p-3 cursor-pointer transition-all border-2 ${
                      selectedPlan?.id === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-muted-foreground/20"
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan?.id === plan.id ? "border-primary" : "border-muted-foreground/30"
                        }`}>
                          {selectedPlan?.id === plan.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{plan.label}</p>
                          <p className="text-xs text-muted-foreground">{plan.duration_months} month{plan.duration_months > 1 ? "s" : ""} additional access</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-sm font-semibold">{formatMoney(plan.amount, plan.currency)}</Badge>
                    </div>
                  </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Pay now and your extension is activated instantly — no approval wait.</span>
            </div>

            <Button className="w-full gap-1.5" disabled={!selectedPlan || isPreparingPayment} onClick={handleProceedToPayment}>
              <CreditCard className="w-4 h-4" />
              {isPreparingPayment ? "Preparing payment..." : `Proceed to Payment${selectedPlan ? ` — ${formatMoney(selectedPlan.amount, selectedPlan.currency)}` : ""}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionRequestModal;
