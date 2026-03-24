import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateQualificationPriceMutation,
  useGetQualificationPriceQuery,
  useUpdateQualificationPriceMutation,
} from "@/redux/apis/qualification/qualificationPriceApi";
import { handleResponse } from "@/utils/handleResponse";
import { TryCatch } from "@/utils/apiTryCatch";

// ─── Currency options ─────────────────────────────────────────────────────────

const CURRENCIES = [
  { value: "USD", label: "USD – US Dollar" },
  { value: "GBP", label: "GBP – British Pound" },
  { value: "EUR", label: "EUR – Euro" },
  { value: "AUD", label: "AUD – Australian Dollar" },
  { value: "CAD", label: "CAD – Canadian Dollar" },
  { value: "BDT", label: "BDT – Bangladeshi Taka" },
];

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const qualificationPriceSchema = z
  .object({
    amount: z
      .string()
      .min(1, "Amount is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g. 9.99)"),

    currency: z
      .string()
      .min(1, "Currency is required")
      .max(10, "Currency code too long"),

    effective_from: z.date({
      required_error: "Effective from date is required",
    }),

    effective_to: z.date({ required_error: "Effective to date is required" }),

    is_active: z.boolean().default(true),
  })
  .refine((data) => data.effective_to > data.effective_from, {
    message: "Effective to must be after effective from",
    path: ["effective_to"],
  });

export type QualificationPriceFormValues = z.infer<
  typeof qualificationPriceSchema
>;

// ─── Default values ───────────────────────────────────────────────────────────

const defaultValues: Partial<QualificationPriceFormValues> = {
  amount: "",
  currency: "",
  is_active: true,
};

// ─── DateTimePicker ───────────────────────────────────────────────────────────

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Pick date & time",
}: DateTimePickerProps) => {
  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return onChange(undefined);
    const hours = value ? value.getHours() : 0;
    const minutes = value ? value.getMinutes() : 0;
    onChange(setMinutes(setHours(day, hours), minutes));
  };

  const handleTimeChange = (type: "hours" | "minutes", raw: string) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const base = value ?? new Date();
    if (type === "hours")
      onChange(setHours(base, Math.min(23, Math.max(0, num))));
    else onChange(setMinutes(base, Math.min(59, Math.max(0, num))));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {value ? format(value, "PPP, HH:mm") : placeholder}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
        />
        {/* Time row */}
        <div className="border-t p-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="number"
              min={0}
              max={23}
              placeholder="HH"
              value={value ? String(value.getHours()).padStart(2, "0") : ""}
              onChange={(e) => handleTimeChange("hours", e.target.value)}
              className="w-16 text-center tabular-nums"
            />
            <span className="text-muted-foreground font-semibold">:</span>
            <Input
              type="number"
              min={0}
              max={59}
              placeholder="MM"
              value={value ? String(value.getMinutes()).padStart(2, "0") : ""}
              onChange={(e) => handleTimeChange("minutes", e.target.value)}
              className="w-16 text-center tabular-nums"
            />
          </div>
          <span className="text-xs text-muted-foreground">24h</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const QualificationPrice = () => {
  const dispatch = useDispatch();
  const { qualificationId } = useParams();
  const { toast } = useToast();
  const { data } = useGetQualificationPriceQuery(qualificationId, {
    skip: !qualificationId,
  });
  // const isEditMode = Boolean(data?.data);
  const isEditMode = false;
  const [createQualificationPrice] = useCreateQualificationPriceMutation();
  const [updateQualificationPrice] = useUpdateQualificationPriceMutation();
  const navigate = useNavigate();

  const form = useForm<QualificationPriceFormValues>({
    resolver: zodResolver(qualificationPriceSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  // ── Populate form in edit mode ────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && data?.data) {
      form.reset({
        ...data?.data,
        effective_from: data?.data.effective_from
          ? new Date(data?.data.effective_from)
          : undefined,
        effective_to: data?.data.effective_to
          ? new Date(data?.data.effective_to)
          : undefined,
      });
    }
  }, [isEditMode, data?.data, form]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: QualificationPriceFormValues) => {
    const payload = {
      ...values,
      effective_from: values.effective_from.toISOString(),
      effective_to: values.effective_to.toISOString(),
    };

    if (isEditMode) {
      const [data, error] = await TryCatch(
        updateQualificationPrice({
          id: qualificationId,
          payload,
        }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Price updated successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });
      toast({ title: "Qualification Price updated successfully" });
    } else {
      const [data, error] = await TryCatch(
        createQualificationPrice({ id: qualificationId, payload }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Qualification main create Successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });

      if (result.type === "success")
        navigate(`/admin/qualifications/${qualificationId}/edit?step=4`);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Pricing Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                        $
                      </span>
                      <Input placeholder="0.00" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the price (e.g. 49.99)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Effective From */}
            <FormField
              control={form.control}
              name="effective_from"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Effective From</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick start date & time"
                    />
                  </FormControl>
                  <FormDescription>
                    Date &amp; time this price becomes active
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Effective To */}
            <FormField
              control={form.control}
              name="effective_to"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Effective To</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick end date & time"
                    />
                  </FormControl>
                  <FormDescription>
                    Date &amp; time this price expires
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Active Price
                      </FormLabel>
                      <FormDescription>
                        Only active prices will be shown to learners during
                        enrollment
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Submit ── */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? isEditMode
                ? "Updating…"
                : "Saving…"
              : isEditMode
                ? "Update Price"
                : "Save & Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QualificationPrice;
