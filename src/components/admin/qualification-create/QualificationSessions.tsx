/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { format, setHours, setMinutes } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  CalendarDays,
  GripVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ─── DateTimePicker ───────────────────────────────────────────────────────────

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled,
}: DateTimePickerProps) => {
  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return onChange(undefined);
    const h = value ? value.getHours() : 0;
    const m = value ? value.getMinutes() : 0;
    onChange(setMinutes(setHours(day, h), m));
  };

  const handleTime = (type: "hours" | "minutes", raw: string) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const base = value ?? new Date();
    onChange(
      type === "hours"
        ? setHours(base, Math.min(23, Math.max(0, num)))
        : setMinutes(base, Math.min(59, Math.max(0, num))),
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
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
        <div className="border-t p-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="number"
              min={0}
              max={23}
              placeholder="HH"
              value={value ? String(value.getHours()).padStart(2, "0") : ""}
              onChange={(e) => handleTime("hours", e.target.value)}
              className="w-16 text-center tabular-nums"
            />
            <span className="text-muted-foreground font-semibold">:</span>
            <Input
              type="number"
              min={0}
              max={59}
              placeholder="MM"
              value={value ? String(value.getMinutes()).padStart(2, "0") : ""}
              onChange={(e) => handleTime("minutes", e.target.value)}
              className="w-16 text-center tabular-nums"
            />
          </div>
          <span className="text-xs text-muted-foreground">24h</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

// Session date entry
const sessionDateSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    venue_address: z.string().min(1, "Venue address is required"),
    start_at: z.date({ required_error: "Start date & time is required" }),
    end_at: z.date({ required_error: "End date & time is required" }),
    capacity: z
      .number({ invalid_type_error: "Must be a number" })
      .int()
      .min(1, "Capacity must be at least 1")
      .max(32767),
    available_seats: z
      .number({ invalid_type_error: "Must be a number" })
      .int()
      .min(0, "Cannot be negative")
      .max(32767),
    price_override: z
      .string()
      .regex(
        /^-?\d+(\.\d{1,2})?$/,
        "Must be a valid price (e.g. 49.99 or -5.00)",
      )
      .optional()
      .or(z.literal("")),
    booking_deadline: z.date({
      required_error: "Booking deadline is required",
    }),
    is_featured: z.boolean().default(false),
    sort_order: z
      .number({ invalid_type_error: "Must be a number" })
      .int()
      .min(0)
      .max(32767)
      .default(0),
    is_active: z.boolean().default(true),
  })
  .refine((d) => d.end_at > d.start_at, {
    message: "End must be after start",
    path: ["end_at"],
  })
  .refine((d) => d.booking_deadline <= d.start_at, {
    message: "Booking deadline must be on or before the start date",
    path: ["booking_deadline"],
  })
  .refine((d) => d.available_seats <= d.capacity, {
    message: "Available seats cannot exceed capacity",
    path: ["available_seats"],
  });

// Location (main) schema
const qualificationSessionSchema = z.object({
  name: z.string().min(1, "Location name is required").max(255),
  venue_address: z.string().min(1, "Venue address is required"),
  sort_order: z
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(0)
    .max(32767)
    .default(0),
  is_active: z.boolean().default(true),
  dates: z.array(sessionDateSchema).min(1, "Add at least one session date"),
});

export type SessionDateValues = z.infer<typeof sessionDateSchema>;
export type QualificationSessionFormValues = z.infer<
  typeof qualificationSessionSchema
>;

// ─── Default values ───────────────────────────────────────────────────────────

const defaultDate = (): Partial<SessionDateValues> => ({
  title: "",
  venue_address: "",
  capacity: 30,
  available_seats: 30,
  price_override: "",
  is_featured: false,
  sort_order: 0,
  is_active: true,
});

const defaultValues: Partial<QualificationSessionFormValues> = {
  name: "",
  venue_address: "",
  sort_order: 0,
  is_active: true,
  dates: [defaultDate() as SessionDateValues],
};

// ─── Session Date Card ────────────────────────────────────────────────────────

interface SessionDateCardProps {
  index: number;
  control: any;
  register: any;
  errors: any;
  onRemove: () => void;
  canRemove: boolean;
  watch: any;
}

const SessionDateCard = ({
  index,
  control,
  errors,
  onRemove,
  canRemove,
  watch,
}: SessionDateCardProps) => {
  const [open, setOpen] = useState(true);
  const title = watch(`dates.${index}.title`);
  const startAt = watch(`dates.${index}.start_at`);
  const isActive = watch(`dates.${index}.is_active`);
  const isFeatured = watch(`dates.${index}.is_featured`);

  const dateErrors = errors?.dates?.[index];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "rounded-xl border bg-card transition-colors",
          !isActive && "opacity-60",
        )}
      >
        {/* Card Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex-1 flex items-center gap-3 text-left min-w-0"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {title || `Session Date ${index + 1}`}
                </p>
                {startAt && (
                  <p className="text-xs text-muted-foreground">
                    {format(startAt, "PPP, HH:mm")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isFeatured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
                {!isActive && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    Inactive
                  </Badge>
                )}
                {open ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <Separator />
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <FormField
                control={control}
                name={`dates.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Morning Cohort – London"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Venue Address */}
            <div className="md:col-span-2">
              <FormField
                control={control}
                name={`dates.${index}.venue_address`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 123 Conference St, London, EC1A 1BB"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start At */}
            <FormField
              control={control}
              name={`dates.${index}.start_at`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date &amp; Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick start"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End At */}
            <FormField
              control={control}
              name={`dates.${index}.end_at`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date &amp; Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick end"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Booking Deadline */}
            <FormField
              control={control}
              name={`dates.${index}.booking_deadline`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Booking Deadline</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick deadline"
                    />
                  </FormControl>
                  <FormDescription>Must be on or before start</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Override */}
            <FormField
              control={control}
              name={`dates.${index}.price_override`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Override</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                        $
                      </span>
                      <Input
                        placeholder="Leave blank to use default"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Overrides the qualification price
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={control}
              name={`dates.${index}.capacity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={32767}
                      placeholder="e.g. 30"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Available Seats */}
            <FormField
              control={control}
              name={`dates.${index}.available_seats`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={32767}
                      placeholder="e.g. 30"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sort Order */}
            <FormField
              control={control}
              name={`dates.${index}.sort_order`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={32767}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Booleans */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={control}
                name={`dates.${index}.is_featured`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5 leading-none">
                      <FormLabel className="cursor-pointer">Featured</FormLabel>
                      <FormDescription className="text-xs">
                        Highlight this date in listings
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`dates.${index}.is_active`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5 leading-none">
                      <FormLabel className="cursor-pointer">Active</FormLabel>
                      <FormDescription className="text-xs">
                        Inactive dates are hidden from learners
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const QualificationSessions = () => {
  const dispatch = useDispatch();
  const { qualificationId } = useParams();
  const { toast } = useToast();
  const isEditMode = Boolean(qualificationId);

  // TODO: Replace with your actual Redux selector
  // const existingData = useSelector(selectQualificationSession);
  const existingData = null;

  const form = useForm<QualificationSessionFormValues>({
    resolver: zodResolver(qualificationSessionSchema),
    defaultValues: defaultValues as QualificationSessionFormValues,
  });

  const {
    handleSubmit,
    control,
    register,
    watch,
    formState: { isSubmitting, errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dates",
  });

  // ── Populate in edit mode ─────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && existingData) {
      form.reset({
        ...existingData,
        dates: existingData.dates?.map((d: any) => ({
          ...d,
          start_at: d.start_at ? new Date(d.start_at) : undefined,
          end_at: d.end_at ? new Date(d.end_at) : undefined,
          booking_deadline: d.booking_deadline
            ? new Date(d.booking_deadline)
            : undefined,
        })),
      });
    }
  }, [isEditMode, existingData, form]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: QualificationSessionFormValues) => {
    try {
      const payload = {
        location: {
          name: values.name,
          venue_address: values.venue_address,
          sort_order: values.sort_order,
          is_active: values.is_active,
        },
        dates: values.dates.map((d) => ({
          ...d,

          location: qualificationId ?? "",
          start_at: d.start_at.toISOString(),
          end_at: d.end_at.toISOString(),
          booking_deadline: d.booking_deadline.toISOString(),
        })),
      };

      if (isEditMode) {
        // TODO: dispatch(updateQualificationSession({ id: qualificationId, ...payload }));
        console.log("UPDATE payload:", payload);
        toast({ title: "Session updated successfully" });
      } else {
        // TODO: dispatch(createQualificationSession(payload));
        console.log("CREATE payload:", payload);
        toast({ title: "Session created successfully" });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Location ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Session Location
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. London Training Centre"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sort Order */}
            <FormField
              control={control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={32767}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Venue Address – full width */}
            <div className="md:col-span-2">
              <FormField
                control={control}
                name="venue_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 10 Downing St, London, SW1A 2AA"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Is Active – full width */}
            <div className="md:col-span-2">
              <FormField
                control={control}
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
                        Active Location
                      </FormLabel>
                      <FormDescription>
                        Inactive locations and their sessions are hidden from
                        learners
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Session Dates ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">
                  Session Dates
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {fields.length} {fields.length === 1 ? "date" : "dates"}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(defaultDate() as SessionDateValues)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Date
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Array-level error */}
            {errors.dates && !Array.isArray(errors.dates) && (
              <p className="text-sm text-destructive">
                {errors.dates.message as string}
              </p>
            )}

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl gap-2">
                <CalendarDays className="h-8 w-8 opacity-40" />
                <p className="text-sm">No session dates added yet</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => append(defaultDate() as SessionDateValues)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Date
                </Button>
              </div>
            )}

            {fields.map((field, index) => (
              <SessionDateCard
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}

            {fields.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={() => append(defaultDate() as SessionDateValues)}
              >
                <Plus className="h-4 w-4" />
                Add Another Date
              </Button>
            )}
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
                ? "Update Session"
                : "Save & Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QualificationSessions;
