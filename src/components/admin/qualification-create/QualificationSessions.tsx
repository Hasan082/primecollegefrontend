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
  Edit,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { TryCatch } from "@/utils/apiTryCatch";
import {
  useCreateQualificationSessionLocationDateMutation,
  useGetQualificationSessionLocationDateQuery,
  useUpdateQualificationSessionLocationDateMutation,
  useDeleteQualificationSessionLocationDateMutation,
} from "@/redux/apis/qualification/qualificationSessionLocationDate";
import {
  useCreateQualificationSessionLocationMutation,
  useUpdateQualificationSessionLocationMutation,
  useDeleteQualificationSessionLocationMutation,
  useGetQualificationSessionLocationQuery,
} from "@/redux/apis/qualification/qualificationSessionLocationApi";
import { handleResponse } from "@/utils/handleResponse";

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

const sessionDateSchema = z.object({
  start_at: z.date({ required_error: "Date is required" }),
  title: z.string().optional().or(z.literal("")),
  sort_order: z.number().int().min(0).max(32767).default(0),
  is_active: z.boolean().default(true),
  date: z.string().optional(),
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
  date?: string;
}

// ─── Default factory ──────────────────────────────────────────────────────────

const emptyDate = (): Partial<SessionDateValues> => ({
  start_at: undefined,
  title: "",
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
                    placeholder="e.g. April 2026 Cohort"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Start At (Date Only) */}
        <FormField
          control={form.control}
          name="start_at"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Session Date</FormLabel>
              <FormControl>
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick date"
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

        {/* Active Toggle */}
        <div className="md:col-span-2">
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
      <div className="rounded-xl border bg-card transition-colors">
        {/* Row header */}
        <div className="flex items-center gap-2 px-4 py-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex-1 flex items-center gap-3 text-left min-w-0",
                !item.is_active && "opacity-60",
              )}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {item.title || (item.date ? format(new Date(item.date), "PPP") : `Session Date ${index + 1}`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.start_at
                    ? format(new Date(item.start_at), "PPP")
                    : item.date
                      ? format(new Date(item.date), "PPP")
                      : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
                  This will permanently delete this session date.
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
        {/* Collapsed detail - simplified */}
        <CollapsibleContent>
          <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Date</p>
              <p>
                {item.date
                  ? format(new Date(item.date), "PPPP")
                  : item.start_at
                    ? format(new Date(item.start_at), "PPPP")
                    : "—"}
              </p>
            </div>
            {item.title && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Title</p>
                <p>{item.title}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Sort Order</p>
              <p>{item.sort_order}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Status</p>
              <p>{item.is_active ? "Active" : "Inactive"}</p>
            </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const QualificationSessions = () => {
  const { qualificationId } = useParams();
  const [searchParams] = useSearchParams();
  const locationId = searchParams?.get("location");
  const { toast } = useToast();
  
  //* get apis
  const { data: locationsData } = useGetQualificationSessionLocationQuery(qualificationId, {
    skip: !qualificationId,
  });

  const { data: sessionDateData, refetch } =
    useGetQualificationSessionLocationDateQuery(locationId, {
      skip: !locationId,
    });

  const [createQualificationSessionLocation, { isLoading: isLocationLoading }] =
    useCreateQualificationSessionLocationMutation();
  const [updateQualificationSessionLocation, { isLoading: isUpdatingLocation }] =
    useUpdateQualificationSessionLocationMutation();
  const [
    createQualificationSessionLocationDate,
    { isLoading: isCreatingDate },
  ] = useCreateQualificationSessionLocationDateMutation();
  const [
    updateQualificationSessionLocationDate,
    { isLoading: isUpdatingDate },
  ] = useUpdateQualificationSessionLocationDateMutation();

  const [deleteQualificationSessionLocation] = useDeleteQualificationSessionLocationMutation();
  const [deleteQualificationSessionLocationDate] = useDeleteQualificationSessionLocationDateMutation();

  const navigate = useNavigate();

  // ── Local state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFormView, setIsFormView] = useState(Boolean(locationId));

  // Sync isFormView with locationId from URL
  useEffect(() => {
    if (locationId) {
      setIsFormView(true);
    }
  }, [locationId]);

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
    const locations = locationsData?.data?.results || locationsData?.data || [];
    if (locationId && Array.isArray(locations)) {
      const currentLoc = locations.find((l: any) => l.id === locationId);
      if (currentLoc) {
        locationForm.reset({
          name: currentLoc.name,
          venue_address: currentLoc.venue_address,
          sort_order: currentLoc.sort_order,
          is_active: currentLoc.is_active,
        });
      }
    } else {
      locationForm.reset({
        name: "",
        venue_address: "",
        sort_order: 0,
        is_active: true,
      });
    }
  }, [locationId, locationsData, locationForm]);

  const onLocationSubmit = async (payload: LocationFormValues) => {
    if (locationId) {
      const [data, error] = await TryCatch(
        updateQualificationSessionLocation({
          id: locationId,
          payload,
        }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Location updated successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });
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
        successMessage: "Location created successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });

      if (result.type === "success") {
        navigate(
          `/admin/qualifications/${qualificationId}/edit?step=4&location=${data?.data?.id}`,
        );
        // Scroll the form into view
        window.requestAnimationFrame(() => {
          const formElement = document.getElementById("qualification-sessions-form");
          if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    }
  };

  // ── Add date ──────────────────────────────────────────────────────────────
  const handleAddDate = async (values: SessionDateValues) => {
    if (!locationId) return;

    const payload = {
      date: format(values.start_at, "yyyy-MM-dd"),
      title: values.title || "",
      sort_order: values.sort_order || 0,
      is_active: values.is_active !== undefined ? values.is_active : true,
    };

    const [data, error] = await TryCatch(
      createQualificationSessionLocationDate({ locationId, payload }).unwrap(),
    );

    const result = handleResponse({
      data,
      error,
      successMessage: "Session date created",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
    if (data?.success) {
      refetch();
      setShowAddForm(false);
    }
  };

  // ── Edit date ─────────────────────────────────────────────────────────────
  const handleEditDate = async (id: string, values: SessionDateValues) => {
    if (!locationId) return;

    const payload = {
      date: format(values.start_at, "yyyy-MM-dd"),
      title: values.title || "",
      sort_order: values.sort_order || 0,
      is_active: values.is_active !== undefined ? values.is_active : true,
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

  const handleUpdateDate = handleEditDate;

  // ── Delete date ───────────────────────────────────────────────────────────
  const handleDeleteDate = async (id: string) => {
    const [data, error] = await TryCatch(
      deleteQualificationSessionLocationDate(id).unwrap(),
    );
    const result = handleResponse({
      data,
      error,
      successMessage: "Session date deleted",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });

    if (result.type === "success") {
      refetch();
    }
  };

  const handleDeleteLocationRecord = async (id: string) => {
    const [data, error] = await TryCatch(
      deleteQualificationSessionLocation(id).unwrap(),
    );
    const result = handleResponse({
      data,
      error,
      successMessage: "Location deleted successfully",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });

    if (result.type === "success") {
      if (locationId === id) {
        navigate(`/admin/qualifications/${qualificationId}/edit?step=4`);
        setIsFormView(false);
      }
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {isFormView && (
        /* ── Form & Dates View ── */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(`/admin/qualifications/${qualificationId}/edit?step=4`);
                setIsFormView(false);
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel / Close Form
            </Button>

            {locationId && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  navigate(
                    `/admin/qualifications/${qualificationId}/edit?step=4`,
                  );
                }}
                className="gap-2 border-dashed"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Location
              </Button>
            )}
          </div>

          {/* ── Location & Sessions Consolidated Card ── */}
          <Card id="qualification-sessions-form" className="scroll-mt-24">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">
                  {locationId ? "Edit Session Location" : "Add Session Location"}
                </CardTitle>
                {locationId ? (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    Editing
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    New Location
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/50">
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
                              Inactive locations and their sessions are hidden
                              from learners
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigate(
                          `/admin/qualifications/${qualificationId}/edit?step=4`,
                        );
                        setIsFormView(false);
                      }}
                      disabled={isLocationLoading || isUpdatingLocation}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLocationLoading || isUpdatingLocation}
                      className="min-w-36"
                    >
                      {(isLocationLoading || isUpdatingLocation) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {locationId ? "Update Location" : "Save Location"}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* ── Session Dates Section (Merged) ── */}
              {locationId && (
                <div className="mt-8 pt-8 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Session Dates</h3>
                      {((sessionDateData?.data?.results || sessionDateData?.data) as any[])?.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {(sessionDateData?.data?.results || sessionDateData?.data).length}{" "}
                          {(sessionDateData?.data?.results || sessionDateData?.data).length === 1
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
                        onClick={() => setShowAddForm(true)}
                        className="gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        Add Date
                      </Button>
                    )}
                  </div>

                  {/* Empty state */}
                  {((sessionDateData?.data?.results || sessionDateData?.data) as any[])?.length === 0 && !showAddForm && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-xl gap-2">
                      <CalendarDays className="h-8 w-8 opacity-40" />
                      <p className="text-sm">No session dates added yet</p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Date
                      </Button>
                    </div>
                  )}

                  {/* Saved dates */}
                  <div className="space-y-3">
                    {(sessionDateData?.data?.results || (Array.isArray(sessionDateData?.data) ? sessionDateData.data : []))?.map((item: any, index: number) =>
                      editingId === item.id ? (
                        <div key={item.id} className="rounded-xl border bg-muted/30">
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
                              start_at: item.date
                                ? new Date(item.date)
                                : item.start_at
                                  ? new Date(item.start_at)
                                  : undefined,
                            }}
                            onSave={(values) => handleUpdateDate(item.id, values)}
                            onCancel={() => setEditingId(null)}
                            isSaving={isCreatingDate || isUpdatingDate}
                          />
                        </div>
                      ) : (
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
                  </div>

                  {/* Add new form */}
                  {showAddForm && (
                    <div className="rounded-xl border bg-muted/30">
                      <div className="px-4 py-3 flex items-center gap-3 border-b">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {(sessionDateData?.data?.results ||
                            sessionDateData?.data ||
                            []).length + 1}
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
                        isSaving={isCreatingDate}
                      />
                    </div>
                  )}

                  {/* Add another bottom button */}
                  {(sessionDateData?.data?.results ||
                    (Array.isArray(sessionDateData?.data)
                      ? sessionDateData.data
                      : []))?.length > 0 &&
                    !showAddForm &&
                    !editingId && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full gap-2 border-dashed border h-12"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Date
                      </Button>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Locations Table View (Always visible at bottom when list exists) ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Location History
            </CardTitle>
            <CardDescription>
              Manage locations and their associated session dates.
            </CardDescription>
          </div>
          {!isFormView && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                navigate(`/admin/qualifications/${qualificationId}/edit?step=4`);
                setIsFormView(true);
              }}
              className="gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Location
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {(locationsData?.data?.results || (Array.isArray(locationsData?.data) ? locationsData.data : []))?.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Details</TableHead>
                    <TableHead>Session Dates</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(locationsData?.data?.results || (Array.isArray(locationsData?.data) ? locationsData.data : [])).map((loc: any) => (
                    <TableRow key={loc.id} className={cn(locationId === loc.id && "bg-muted/50")}>
                      <TableCell className="min-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-sm">{loc.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {loc.venue_address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {loc.dates && loc.dates.length > 0 ? (
                            loc.dates.map((d: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 h-5 bg-primary/5 border-primary/20">
                                {typeof d === 'string' ? d : d.date}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No dates</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{loc.sort_order}</TableCell>
                      <TableCell>
                        {loc.is_active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px] h-5 px-2">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] h-5 px-2">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigate(
                                `/admin/qualifications/${qualificationId}/edit?step=4&location=${loc.id}`,
                              );
                              setIsFormView(true);
                               // Scroll the form into view
                              window.requestAnimationFrame(() => {
                                const formElement = document.getElementById("qualification-sessions-form");
                                if (formElement) {
                                  formElement.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                              });
                            }}
                            title="Edit Location"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete Location"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the location "{loc.name}"
                                  and all its associated session dates.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    handleDeleteLocationRecord(loc.id);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <p>No locations added yet.</p>
              {!isFormView && (
                <Button
                  variant="link"
                  onClick={() => setIsFormView(true)}
                  className="mt-2"
                >
                  Create your first location
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default QualificationSessions;
