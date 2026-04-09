import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useEnrollLearnerMutation,
  useGetQualificationOnlyQuery,
} from "@/redux/apis/admin/learnerManagementApi";
import { cleanObject } from "@/utils/cleanObject";

const enrollLearnerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  billing_address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  qualification_id: z.string().min(1, "Qualification is required"),
  qualification_session_id: z.string().optional(),
  payment_method: z.enum(["bank_transfer", "cash", "invoice", "employer"], {
    message: "Payment method is required",
  }),
  discount_amount: z.string().optional(),
});

type EnrollLearnerFormValues = z.infer<typeof enrollLearnerSchema>;

type QualificationDate = {
  id: string;
  label: string;
};

type QualificationSessionLocation = {
  id: string;
  name: string;
  dates: QualificationDate[];
};

type QualificationOption = {
  id: string;
  name: string;
  slug: string;
  is_session: boolean;
  current_price: string | null;
  currency: string;
  session_locations: QualificationSessionLocation[];
};

type QualificationOnlyResponse = {
  success: boolean;
  message: string;
  data: QualificationOption[];
};

interface EnrollLearnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getErrorMessage = (error: any) => {
  if (typeof error?.data?.message === "string") return error.data.message;
  if (typeof error?.data?.detail === "string") return error.data.detail;
  if (typeof error?.message === "string") return error.message;
  return "Something went wrong.";
};
// TODO: need to work here after api changes
export default function EnrollLearnerModal({
  open,
  onOpenChange,
}: EnrollLearnerModalProps) {
  const { toast } = useToast();
  const [enrollLearner, { isLoading: isSubmitting }] =
    useEnrollLearnerMutation();
  const { data: qualificationResponse, isLoading: isLoadingQualifications } =
    useGetQualificationOnlyQuery(undefined, { skip: !open });

  const qualifications =
    (qualificationResponse as QualificationOnlyResponse | undefined)?.data ||
    [];

  const form = useForm<EnrollLearnerFormValues>({
    resolver: zodResolver(enrollLearnerSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone: "",
      billing_address: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
      qualification_id: "",
      qualification_session_id: "",
      payment_method: "cash",
      discount_amount: "0.00",
    },
  });

  const selectedQualificationId = form.watch("qualification_id");
  const discountAmount = form.watch("discount_amount");
  const selectedQualification = useMemo(
    () =>
      qualifications.find(
        (qualification) => qualification.id === selectedQualificationId,
      ),
    [qualifications, selectedQualificationId],
  );

  const sessionOptions = useMemo(() => {
    if (!selectedQualification?.is_session) return [];

    return selectedQualification.session_locations.flatMap((location) =>
      location.dates.map((date) => ({
        id: date.id,
        label: `${location.name} - ${date.label}`,
      })),
    );
  }, [selectedQualification]);

  const parsedBasePrice = Number.parseFloat(
    selectedQualification?.current_price ?? "0",
  );
  const parsedDiscountAmount = Number.parseFloat(discountAmount || "0");
  const safeDiscountAmount = Number.isFinite(parsedDiscountAmount)
    ? Math.max(0, Math.min(parsedDiscountAmount, parsedBasePrice))
    : 0;
  const finalPrice = Math.max(0, parsedBasePrice - safeDiscountAmount);

  const formatPrice = (value: number, currency: string | undefined) => {
    const normalizedCurrency = currency === "GBP" ? "GBP" : "GBP";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: normalizedCurrency,
    }).format(value);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  useEffect(() => {
    form.setValue("qualification_session_id", "");
    form.clearErrors("qualification_session_id");
  }, [form, selectedQualificationId]);

  const handleSubmit = async (values: EnrollLearnerFormValues) => {
    if (selectedQualification?.is_session && !values.qualification_session_id) {
      form.setError("qualification_session_id", {
        type: "manual",
        message: "Session date is required for this qualification",
      });
      return;
    }

    const payload = cleanObject({
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      billing_address: values.billing_address,
      city: values.city,
      postcode: values.postcode,
      country: values.country,
      payment_method: values.payment_method,
      items: [
        cleanObject({
          qualification_id: values.qualification_id,
          qualification_session_id: selectedQualification?.is_session
            ? values.qualification_session_id
            : undefined,
          discount_amount:
            safeDiscountAmount > 0 ? safeDiscountAmount.toFixed(2) : undefined,
        }),
      ],
    });

    try {
      const response = await enrollLearner(payload).unwrap();
      toast({
        title: "Learner enrolled successfully",
        description:
          response?.message || "The learner has been enrolled successfully.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Enrollment failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manual Learner Enrolment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Quincy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="learner@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+44 7700 000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="United Kingdom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Input placeholder="221B Baker Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input placeholder="SW1A 1AA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualification_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Qualification *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingQualifications}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingQualifications
                                ? "Loading qualifications..."
                                : "Select qualification"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {qualifications.map((qualification) => (
                          <SelectItem
                            key={qualification.id}
                            value={qualification.id}
                          >
                            {qualification.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedQualification?.is_session ? (
                <FormField
                  control={form.control}
                  name="qualification_session_id"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Session Date *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={sessionOptions.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sessionOptions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Payment Method *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedQualification ? (
                <>
                  <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Base Price</span>
                      <span className="text-slate-900">
                        {formatPrice(parsedBasePrice, selectedQualification.currency)}
                      </span>
                    </div>

                    <FormField
                      control={form.control}
                      name="discount_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max={parsedBasePrice.toFixed(2)}
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-semibold">
                      <span className="text-slate-900">Final Total</span>
                      <span className="text-slate-900">
                        {formatPrice(finalPrice, selectedQualification.currency)}
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enrolling learner...
                </>
              ) : (
                "Enrol Learner"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
