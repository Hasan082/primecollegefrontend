/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { format, setHours, setMinutes } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  MapPin,
  CalendarDays,
  Check,
  X,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { TryCatch } from "@/utils/apiTryCatch";
import {
  useCreateQualificationSessionLocationMutation,
  useUpdateQualificationSessionLocationMutation,
} from "@/redux/apis/qualification/qualificationSessionLocationApi";
import { handleResponse } from "@/utils/handleResponse";
import {
  useCreateQualificationSessionLocationDateMutation,
  useGetQualificationSessionLocationDateQuery,
  useUpdateQualificationSessionLocationDateMutation,
} from "@/redux/apis/qualification/qualificationSessionLocationDate";

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
      .regex(/^-?\d+(\.\d{1,2})?$/, "Must be a valid price (e.g. 49.99)")
      .optional()
      .or(z.literal("")),
    booking_deadline: z.date({
      required_error: "Booking deadline is required",
    }),
    is_featured: z.boolean().default(false),
    sort_order: z.number().int().min(0).max(32767).default(0),
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

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(255),
  venue_address: z.string().min(1, "Venue address is required"),
  sort_order: z.number().int().min(0).max(32767).default(0),
  is_active: z.boolean().default(true),
});

type SessionDateValues = z.infer<typeof sessionDateSchema>;
type LocationFormValues = z.infer<typeof locationSchema>;

// ─── Saved session date (includes API id) ────────────────────────────────────

interface SavedSessionDate extends SessionDateValues {
  id: string;
}

// ─── Default factory ──────────────────────────────────────────────────────────

const emptyDate = (): Partial<SessionDateValues> => ({
  title: "",
  venue_address: "",
  capacity: 30,
  available_seats: 30,
  price_override: "",
  is_featured: false,
  sort_order: 0,
  is_active: true,
});

// ─── Reusable Session Date Form ───────────────────────────────────────────────

interface SessionDateFormProps {
  locationId: string;
  initial?: Partial<SessionDateValues>;
  onSave: (values: SessionDateValues) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const SessionDateForm = ({
  initial,
  onSave,
  onCancel,
  isSaving,
}: SessionDateFormProps) => {
  const form = useForm<SessionDateValues>({
    resolver: zodResolver(sessionDateSchema),
    defaultValues: { ...emptyDate(), ...initial } as SessionDateValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSave)}
        className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Title */}
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="title"
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
            control={form.control}
            name="venue_address"
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
          control={form.control}
          name="start_at"
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
          control={form.control}
          name="end_at"
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
          control={form.control}
          name="booking_deadline"
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
          control={form.control}
          name="price_override"
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
          control={form.control}
          name="capacity"
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
          control={form.control}
          name="available_seats"
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
          control={form.control}
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

        {/* Booleans */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="is_featured"
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
            control={form.control}
            name="is_active"
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

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1.5" />
            )}
            {isSaving ? "Saving…" : "Save Date"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// ─── Saved Date Row (read-only, collapsible detail) ───────────────────────────

interface SavedDateRowProps {
  item: SavedSessionDate;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const SavedDateRow = ({ item, index, onEdit, onDelete }: SavedDateRowProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "rounded-xl border bg-card transition-colors",
          !item.is_active && "opacity-60",
        )}
      >
        {/* Row header */}
        <div className="flex items-center gap-2 px-4 py-3">
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
                  {item.title || `Session Date ${index + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.start_at
                    ? format(new Date(item.start_at), "PPP, HH:mm")
                    : "—"}
                  {" → "}
                  {item.end_at ? format(new Date(item.end_at), "HH:mm") : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
                {!item.is_active && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    Inactive
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                  {item.capacity} seats
                </span>
                {open ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          {/* Edit button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Delete with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Session Date?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{" "}
                  <strong>{item.title || `Session Date ${index + 1}`}</strong>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Collapsed detail */}
        <CollapsibleContent>
          <Separator />
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Venue</p>
              <p className="truncate">{item.venue_address || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Booking Deadline
              </p>
              <p>
                {item.booking_deadline
                  ? format(new Date(item.booking_deadline), "PPP, HH:mm")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Available Seats
              </p>
              <p>{item.available_seats}</p>
            </div>
            {item.price_override && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Price Override
                </p>
                <p>${item.price_override}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Sort Order</p>
              <p>{item.sort_order}</p>
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
  const [searchParams] = useSearchParams();
  const locationId = searchParams?.get("location");
  const { toast } = useToast();
  const [createQualificationSessionLocation, { isLoading: isLocationLoading }] =
    useCreateQualificationSessionLocationMutation();
  const [updateQualificationSessionLocation] =
    useUpdateQualificationSessionLocationMutation();
  const [
    createQualificationSessionLocationDate,
    { isLoading: isCreatingDate },
  ] = useCreateQualificationSessionLocationDateMutation();
  const [
    updateQualificationSessionLocationDate,
    { isLoading: isUpdatingDate },
  ] = useUpdateQualificationSessionLocationDateMutation();

  //* get apis
  const { data: sessionDateData, refetch } =
    useGetQualificationSessionLocationDateQuery(locationId, {
      skip: !locationId,
    });

  // const isEditMode = Boolean(qualificationId);

  const navigate = useNavigate();
  const isEditMode = false;

  // ── Location ──────────────────────────────────────────────────────────────
  // TODO: const existingLocation = useSelector(selectQualificationLocation);
  const existingLocation = null;

  // const [locationId, setLocationId] = useState<string | null>(
  //   isEditMode ? (qualificationId ?? null) : null,
  // );
  const [isLocationSaving, setIsLocationSaving] = useState(false);

  // ── Session dates ─────────────────────────────────────────────────────────
  // TODO: const savedDates = useSelector(selectSessionDates); + fetch on mount
  const [savedDates, setSavedDates] = useState<SavedSessionDate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSavingDate, setIsSavingDate] = useState(false);

  // ── Location form ─────────────────────────────────────────────────────────
  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      venue_address: "",
      sort_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditMode && existingLocation) {
      locationForm.reset(existingLocation as any);
    }
  }, [isEditMode, existingLocation, locationForm]);

  const onLocationSubmit = async (payload: LocationFormValues) => {
    if (isEditMode) {
      const [data, error] = await TryCatch(
        updateQualificationSessionLocation({
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
        createQualificationSessionLocation({
          id: qualificationId,
          payload,
        }).unwrap(),
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
        navigate(
          `/admin/qualifications/${qualificationId}/edit?step=4&location=${data?.data?.id}`,
        );
    }
  };

  // ── Add date ──────────────────────────────────────────────────────────────
  const handleAddDate = async (values: SessionDateValues) => {
    if (!locationId) return;

    const payload = {
      ...values,
      location: locationId,
      start_at: values.start_at.toISOString(),
      end_at: values.end_at.toISOString(),
      booking_deadline: values.booking_deadline.toISOString(),
    };

    const [data, error] = await TryCatch(
      createQualificationSessionLocationDate({
        locationId,
        payload,
      }).unwrap(),
    );

    const result = handleResponse({
      data,
      error,
      successMessage: "location Date create Successfully",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
    if (data?.success) refetch();
  };

  // ── Edit date ─────────────────────────────────────────────────────────────
  const handleEditDate = async (id: string, values: SessionDateValues) => {
    if (!locationId) return;

    const payload = {
      ...values,
      location: locationId,
      start_at: values.start_at.toISOString(),
      end_at: values.end_at.toISOString(),
      booking_deadline: values.booking_deadline.toISOString(),
    };

    const [data, error] = await TryCatch(
      updateQualificationSessionLocationDate({
        dateId: id,
        payload,
      }).unwrap(),
    );

    const result = handleResponse({
      data,
      error,
      successMessage: "Session date updated",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });

    if (data?.success) {
      refetch();
      setEditingId(null);
    }
  };

  // ── Delete date ───────────────────────────────────────────────────────────
  const handleDeleteDate = async (id: string) => {
    try {
      // TODO: await dispatch(deleteSessionDate(id)).unwrap();
      setSavedDates((prev) => prev.filter((d) => d.id !== id));
      console.log("DELETE session date:", id);
      toast({ title: "Session date removed" });
    } catch {
      toast({ title: "Failed to delete session date", variant: "destructive" });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Location Card ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Session Location
            </CardTitle>
            {locationId && (
              <Badge variant="secondary" className="text-xs ml-auto">
                Saved
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...locationForm}>
            <form
              onSubmit={locationForm.handleSubmit(onLocationSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <FormField
                control={locationForm.control}
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

              <FormField
                control={locationForm.control}
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

              <div className="md:col-span-2">
                <FormField
                  control={locationForm.control}
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

              <div className="md:col-span-2">
                <FormField
                  control={locationForm.control}
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

              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isLocationLoading}
                  className="min-w-36"
                >
                  {isLocationLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLocationLoading
                    ? isEditMode
                      ? "Updating…"
                      : "Saving…"
                    : isEditMode
                      ? "Update Location"
                      : "Save Location"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── Session Dates Card ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Session Dates
              </CardTitle>
              {sessionDateData?.data?.results?.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {sessionDateData?.data?.results?.length}{" "}
                  {sessionDateData?.data?.results?.length === 1
                    ? "date"
                    : "dates"}
                </Badge>
              )}
            </div>
            {!showAddForm && !editingId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!locationId}
                onClick={() => setShowAddForm(true)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Date
              </Button>
            )}
          </div>
          {!locationId && (
            <p className="text-xs text-muted-foreground mt-1">
              Save the location above before adding session dates.
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Empty state */}
          {sessionDateData?.data?.results?.length === 0 && !showAddForm && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl gap-2">
              <CalendarDays className="h-8 w-8 opacity-40" />
              <p className="text-sm">No session dates added yet</p>
              {locationId && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Date
                </Button>
              )}
            </div>
          )}

          {/* Saved dates */}
          {sessionDateData?.data?.results?.map((item, index) =>
            editingId === item.id ? (
              // Inline edit form
              <div key={item.id} className="rounded-xl border bg-card">
                <div className="px-4 py-3 flex items-center gap-3 border-b">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium flex-1">
                    Editing:{" "}
                    <span className="text-muted-foreground">
                      {item.title || `Session Date ${index + 1}`}
                    </span>
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Editing
                  </Badge>
                </div>
                <SessionDateForm
                  locationId={locationId!}
                  initial={{
                    ...item,
                    start_at:
                      item.start_at instanceof Date
                        ? item.start_at
                        : new Date(item.start_at),
                    end_at:
                      item.end_at instanceof Date
                        ? item.end_at
                        : new Date(item.end_at),
                    booking_deadline:
                      item.booking_deadline instanceof Date
                        ? item.booking_deadline
                        : new Date(item.booking_deadline),
                  }}
                  onSave={(values) => handleEditDate(item.id, values)}
                  onCancel={() => setEditingId(null)}
                  isSaving={isCreatingDate || isUpdatingDate}
                />
              </div>
            ) : (
              // Read-only row
              <SavedDateRow
                key={item.id}
                item={item}
                index={index}
                onEdit={() => {
                  setShowAddForm(false);
                  setEditingId(item.id);
                }}
                onDelete={() => handleDeleteDate(item.id)}
              />
            ),
          )}

          {/* Add new form */}
          {showAddForm && (
            <div className="rounded-xl border bg-card">
              <div className="px-4 py-3 flex items-center gap-3 border-b">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {sessionDateData?.data?.results?.length + 1}
                </div>
                <p className="text-sm text-muted-foreground flex-1">
                  New Session Date
                </p>
                <Badge variant="outline" className="text-xs">
                  New
                </Badge>
              </div>
              <SessionDateForm
                locationId={locationId!}
                onSave={handleAddDate}
                onCancel={() => setShowAddForm(false)}
                isSaving={isSavingDate}
              />
            </div>
          )}

          {/* Add another */}
          {savedDates.length > 0 &&
            !showAddForm &&
            !editingId &&
            locationId && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4" />
                Add Another Date
              </Button>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualificationSessions;
