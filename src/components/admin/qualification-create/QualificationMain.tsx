import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ─── Slug helper ──────────────────────────────────────────────────────────────

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const qualificationMainSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be under 255 characters"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be under 255 characters")
    .regex(
      /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, hyphens, and underscores",
    ),

  featured_image: z.string().optional(),

  short_description: z
    .string()
    .max(500, "Short description must be under 500 characters")
    .optional(),

  excerpt: z
    .string()
    .max(1000, "Excerpt must be under 1000 characters")
    .optional(),

  course_duration_text: z
    .string()
    .max(100, "Duration text must be under 100 characters")
    .optional(),

  access_duration_months: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(1, "Must be at least 1 month")
    .max(32767, "Exceeds maximum allowed value"),

  qualification_code: z
    .string()
    .min(1, "Qualification code is required")
    .max(100, "Code must be under 100 characters"),

  total_units: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(32767, "Exceeds maximum allowed value"),

  status: z.enum(["draft", "published", "archived"], {
    required_error: "Please select a status",
  }),

  is_session: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type QualificationMainFormValues = z.infer<
  typeof qualificationMainSchema
>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: QualificationMainFormValues["status"];
  label: string;
  color: string;
}[] = [
  { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  {
    value: "published",
    label: "Published",
    color: "bg-green-100 text-green-800",
  },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-700" },
];

const BOOLEAN_FIELDS: {
  name: "is_session" | "is_active";
  label: string;
  description: string;
}[] = [
  {
    name: "is_session",
    label: "Session-based",
    description:
      "Enable if this qualification is delivered through scheduled sessions",
  },
  {
    name: "is_active",
    label: "Active",
    description:
      "Inactive qualifications are hidden from learners and enrolment",
  },
];

const defaultValues: Partial<QualificationMainFormValues> = {
  title: "",
  slug: "",
  featured_image: "",
  short_description: "",
  excerpt: "",
  course_duration_text: "",
  access_duration_months: 12,
  qualification_code: "",
  total_units: 0,
  status: "draft",
  is_session: false,
  is_active: true,
};

// ─── Image Upload Preview ─────────────────────────────────────────────────────

interface ImageUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
  onClear: () => void;
}

const ImageUpload = ({ value, onChange, onClear }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    // TODO: upload to your storage and call onChange(uploadedUrl)
    onChange(url);
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-border aspect-video bg-muted">
          <img
            src={preview}
            alt="Featured"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onClear();
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-black/80 text-white p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-border",
            "aspect-video flex flex-col items-center justify-center gap-2",
            "text-muted-foreground hover:border-primary hover:text-primary",
            "transition-colors bg-muted/40",
          )}
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm font-medium">Click to upload image</span>
          <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const QualificationMain = () => {
  const dispatch = useDispatch();
  const { qualificationId } = useParams();
  const { toast } = useToast();
  const isEditMode = Boolean(qualificationId);

  // TODO: Replace with your actual Redux selector
  // const existingData = useSelector(selectQualificationMain);
  const existingData = null;

  const form = useForm<QualificationMainFormValues>({
    resolver: zodResolver(qualificationMainSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const titleValue = watch("title");
  const slugValue = watch("slug");
  const statusValue = watch("status");

  // ── Auto-generate slug from title (create mode only) ─────────────────────
  useEffect(() => {
    if (!isEditMode && titleValue) {
      setValue("slug", generateSlug(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isEditMode, setValue]);

  // ── Populate form in edit mode ────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && existingData) {
      form.reset(existingData);
    }
  }, [isEditMode, existingData, form]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: QualificationMainFormValues) => {
    try {
      if (isEditMode) {
        // TODO: dispatch(updateQualificationMain({ id: qualificationId, ...values }));
        console.log("UPDATE payload:", values);
        toast({ title: "Qualification updated successfully" });
      } else {
        // TODO: dispatch(createQualificationMain(values));
        console.log("CREATE payload:", values);
        toast({ title: "Qualification created successfully" });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === statusValue);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Identity ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title – full width */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Certificate in Project Management"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Slug – full width */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. certificate-in-project-management"
                          {...field}
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Re-generate from title"
                          onClick={() =>
                            setValue("slug", generateSlug(titleValue || ""), {
                              shouldValidate: true,
                            })
                          }
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Auto-generated from title. Click{" "}
                      <RefreshCw className="inline h-3 w-3" /> to regenerate.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Qualification Code */}
            <FormField
              control={form.control}
              name="qualification_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. QUAL-2024-PM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center gap-2">
                      Status
                      {currentStatus && (
                        <Badge
                          className={cn(
                            "text-xs font-medium px-2 py-0.5",
                            currentStatus.color,
                          )}
                          variant="outline"
                        >
                          {currentStatus.label}
                        </Badge>
                      )}
                    </span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      min={1}
                      max={32767}
                      placeholder="e.g. 12"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Units */}
            <FormField
              control={form.control}
              name="total_units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Units</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={32767}
                      placeholder="e.g. 8"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course Duration Text */}
            <FormField
              control={form.control}
              name="course_duration_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Duration Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. "6 weeks" or "3–5 hours"'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Human-readable duration shown to learners
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Media ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Featured Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="featured_image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onClear={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Content ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Descriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Short Description */}
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief overview of the qualification (shown in listings)…"
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length ?? 0} / 500
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Excerpt */}
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Longer excerpt shown on the qualification detail page…"
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length ?? 0} / 1000
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Flags ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Options &amp; Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BOOLEAN_FIELDS.map((item) => (
              <FormField
                key={item.name}
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
                ? "Update Qualification"
                : "Save & Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QualificationMain;
