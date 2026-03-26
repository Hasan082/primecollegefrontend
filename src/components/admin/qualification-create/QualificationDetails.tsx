import { zodResolver } from "@hookform/resolvers/zod";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useCreateQualificationDetailsMutation,
  useGetQualificationDetailsQuery,
  useUpdateQualificationDetailsMutation,
} from "@/redux/apis/qualification/qualificationDetailsApi";
import { TryCatch } from "@/utils/apiTryCatch";
import { handleResponse } from "@/utils/handleResponse";

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const qualificationDetailsSchema = z
  .object({
    description: z
      .string()
      .min(1, "Description is required")
      .max(2000, "Description must be under 2000 characters"),

    access_duration_months: z
      .number({ invalid_type_error: "Must be a number" })
      .int("Must be a whole number")
      .min(1, "Must be at least 1 month")
      .max(32767, "Exceeds maximum allowed value"),

    scheduled_start_at: z.date({ required_error: "Start date is required" }),

    scheduled_end_at: z.date({ required_error: "End date is required" }),

    cpd_reference_number: z.string().min(1, "CPD reference number is required"),

    cpd_hours: z
      .string()
      .regex(
        /^-?\d+(\.\d{1,2})?$/,
        "Must be a valid number (e.g. 1.5 or -0.74)",
      ),

    pass_mark: z
      .number({ invalid_type_error: "Must be a number" })
      .int("Must be a whole number")
      .min(0, "Pass mark cannot be negative")
      .max(100, "Pass mark cannot exceed 100"),

    retake_policy: z.string().min(1, "Retake policy is required"),

    certificate_provider: z.enum(["none", "prime_college", "awarding_body"], {
      required_error: "Please select a certificate provider",
    }),

    certificate_title_override: z.string().optional(),

    // Boolean flags
    cpd_branding_clean: z.boolean().default(false),
    accessibility_audit_passed: z.boolean().default(false),
    privacy_policy_required: z.boolean().default(false),
    requires_learner_declaration: z.boolean().default(false),
    requires_course_evaluation: z.boolean().default(false),
    issues_certificate: z.boolean().default(false),
  })
  .refine((data) => data.scheduled_end_at > data.scheduled_start_at, {
    message: "End date must be after start date",
    path: ["scheduled_end_at"],
  });

export type QualificationDetailsFormValues = z.infer<
  typeof qualificationDetailsSchema
>;

// ─── Default Values ─────────────────────────────────────────────────────────

const defaultValues: Partial<QualificationDetailsFormValues> = {
  description: "",
  access_duration_months: 12,
  cpd_reference_number: "",
  cpd_hours: "0",
  pass_mark: 70,
  retake_policy: "",
  certificate_provider: "none",
  certificate_title_override: "",
  cpd_branding_clean: false,
  accessibility_audit_passed: false,
  privacy_policy_required: false,
  requires_learner_declaration: false,
  requires_course_evaluation: false,
  issues_certificate: false,
};

// ─── Boolean Field Config ────────────────────────────────────────────────────

const booleanFields: {
  name: keyof QualificationDetailsFormValues;
  label: string;
  description: string;
}[] = [
  {
    name: "cpd_branding_clean",
    label: "CPD Branding Clean",
    description: "Removes CPD branding from learner-facing content",
  },
  {
    name: "accessibility_audit_passed",
    label: "Accessibility Audit Passed",
    description: "Confirms content has passed accessibility standards",
  },
  {
    name: "privacy_policy_required",
    label: "Privacy Policy Required",
    description: "Learners must accept the privacy policy before starting",
  },
  {
    name: "requires_learner_declaration",
    label: "Requires Learner Declaration",
    description: "Learners must submit a declaration upon completion",
  },
  {
    name: "requires_course_evaluation",
    label: "Requires Course Evaluation",
    description: "Learners must complete an evaluation after the course",
  },
  {
    name: "issues_certificate",
    label: "Issues Certificate",
    description: "A certificate will be issued upon successful completion",
  },
];

// ─── DateTimePicker Helper ────────────────────────────────────────────────────

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
    // Preserve existing time when changing date
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

// ─── Component ───────────────────────────────────────────────────────────────

const QualificationDetails = () => {
  const dispatch = useDispatch();
  const { qualificationId } = useParams();
  const { toast } = useToast();

  const [createQualificationDetails] = useCreateQualificationDetailsMutation();
  const [updateQualificationDetails] = useUpdateQualificationDetailsMutation();
  const navigate = useNavigate();
  const { data } = useGetQualificationDetailsQuery(qualificationId, {
    skip: !qualificationId,
  });
  const isEditMode = Boolean(data?.data);
  console.log({ isEditMode, data: data?.data });

  const form = useForm<QualificationDetailsFormValues>({
    resolver: zodResolver(qualificationDetailsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty },
  } = form;

  const issuesCertificate = watch("issues_certificate");

  // ── Populate form in edit mode ──────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && data?.data) {
      form.reset({
        ...data?.data,
        scheduled_start_at: data?.data?.scheduled_start_at
          ? new Date(data?.data?.scheduled_start_at)
          : undefined,
        scheduled_end_at: data?.data?.scheduled_end_at
          ? new Date(data?.data?.scheduled_end_at)
          : undefined,
      });
    }
  }, [isEditMode, data?.data, form]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const onSubmit = async (values: QualificationDetailsFormValues) => {
    const payload = {
      ...values,
      scheduled_start_at: values.scheduled_start_at.toISOString(),
      scheduled_end_at: values.scheduled_end_at.toISOString(),
    };

    if (isEditMode) {
      const [data, error] = await TryCatch(
        updateQualificationDetails({
          id: qualificationId,
          payload,
        }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Qualification updated successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });
      toast({ title: "Qualification updated successfully" });
    } else {
      const [data, error] = await TryCatch(
        createQualificationDetails({ id: qualificationId, payload }).unwrap(),
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
        navigate(`/admin/qualifications/${qualificationId}/edit?step=3`);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Basic Info ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Description – full width */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter qualification description…"
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Access Duration */}
            <FormField
              control={form.control}
              name="access_duration_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Duration (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 12"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPD Reference Number */}
            <FormField
              control={form.control}
              name="cpd_reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPD Reference Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CPD-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduled Start */}
            <FormField
              control={form.control}
              name="scheduled_start_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled Start Date &amp; Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick start date & time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduled End */}
            <FormField
              control={form.control}
              name="scheduled_end_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled End Date &amp; Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick end date & time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── CPD & Assessment ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              CPD &amp; Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CPD Hours */}
            <FormField
              control={form.control}
              name="cpd_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPD Hours</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1.5" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use negative value for deductions (e.g. -0.74)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pass Mark */}
            <FormField
              control={form.control}
              name="pass_mark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pass Mark (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 70"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Retake Policy – full width */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="retake_policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retake Policy</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the retake policy…"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Certificate ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Certificate Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Certificate Provider */}
            <FormField
              control={form.control}
              name="certificate_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Provider</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Certificate</SelectItem>
                      <SelectItem value="prime_college">
                        Prime College
                      </SelectItem>
                      <SelectItem value="awarding_body">
                        Awarding Body
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Certificate Title Override */}
            <FormField
              control={form.control}
              name="certificate_title_override"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Title Override</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Leave blank to use default title"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Overrides the default certificate title if provided
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Flags / Toggles ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Options &amp; Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {booleanFields.map((item, index) => (
              <div key={item.name}>
                <FormField
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          {item.label}
                        </FormLabel>
                        <FormDescription>{item.description}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Submit ── */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? isEditMode
                ? "Updating…"
                : "Creating…"
              : isEditMode
                ? "Update Details"
                : "Save & Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QualificationDetails;
