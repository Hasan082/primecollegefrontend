/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  useCreateQualificationMainMutation,
  useGetQualificationMainQuery,
  usePresignQualificationImageUploadMutation,
  useUpdateQualificationMainMutation,
} from "@/redux/apis/qualification/qualificationMainApi";
import { handleResponse } from "@/utils/handleResponse";
import { TryCatch } from "@/utils/apiTryCatch";
import {
  buildQualificationDraftKey,
  clearQualificationDraft,
  loadQualificationDraft,
  saveQualificationDraft,
} from "@/lib/qualificationDrafts";
import {
  useGetAwardingBodiesQuery,
  useGetCategoriesQuery,
  useGetDeliveryModesQuery,
  useGetLevelsQuery,
  useGetTypesQuery,
} from "@/redux/apis/qualification/qualificationSupportApi";

// ─── Slug helper ──────────────────────────────────────────────────────────────

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

const withCacheBust = (url?: string | null) => {
  if (!url) return undefined;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
};

const normalizeSelectValue = (value: unknown) =>
  typeof value === "string" ? value : "";

type QualificationMainDraft = {
  values: QualificationMainFormValues;
  clearFeaturedImage: boolean;
}

type QualificationPayload = Omit<QualificationMainFormValues, "featured_image"> & {
  featured_image_key?: string;
  clear_featured_image?: boolean;
};

type PresignResponse = {
  key: string;
  upload_url: string;
  fields: Record<string, string>;
};

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
  category: z
    .string({ required_error: "Category is required" })
    .uuid("Invalid category ID"),

  level: z
    .string({ required_error: "Level is required" })
    .uuid("Invalid level ID"),

  awarding_body: z
    .string({ required_error: "Awarding body is required" })
    .uuid("Invalid awarding body ID"),

  qualification_type: z
    .string({ required_error: "Qualification type is required" })
    .uuid("Invalid qualification type ID"),

  delivery_mode: z
    .string({ required_error: "Delivery mode is required" })
    .uuid("Invalid delivery mode ID"),

  featured_image: z
    .instanceof(File, { message: "Please upload a valid image file" })
    .refine((f) => f.size <= 10 * 1024 * 1024, "Image must be under 10MB")
    .refine(
      (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
      "Only JPG, PNG, or WEBP allowed",
    )
    .optional()
    .nullable(),

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

  qualification_code: z
    .string()
    .min(1, "Qualification code is required")
    .max(100, "Code must be under 100 characters"),

  total_units: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(32767, "Exceeds maximum allowed value"),

  status: z.enum(["draft", "active", "inactive", "archived"], {
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
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-800" },
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
  featured_image: null,
  short_description: "",
  excerpt: "",
  course_duration_text: "",
  category: "",
  level: "",
  awarding_body: "",
  qualification_type: "",
  delivery_mode: "",
  qualification_code: "",
  total_units: 0,
  status: "draft",
  is_session: false,
  is_active: true,
};

// ─── Image Upload Preview ─────────────────────────────────────────────────────

interface ImageUploadProps {
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  onClearExisting: () => void;
  existingUrl?: string; // URL string from API in edit mode
}

const ImageUpload = ({ value, onChange, onClearExisting, existingUrl }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive preview: new File takes priority, then existing URL from API
  const preview = value ? URL.createObjectURL(value) : (existingUrl ?? null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  const handleClear = () => {
    onChange(null);
    onClearExisting();
    if (inputRef.current) inputRef.current.value = "";
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
            onClick={handleClear}
            className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-black/80 text-white p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 transition-colors"
          >
            Replace image
          </button>
          {value && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md max-w-[80%] truncate">
              {value.name} ({(value.size / 1024).toFixed(1)} KB)
            </div>
          )}
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
          <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const QualificationMain = () => {
  const { qualificationId } = useParams();
  const { toast } = useToast();
  const isEditMode = Boolean(qualificationId);
  const [createQualificationMain] = useCreateQualificationMainMutation();
  const [presignQualificationImageUpload] = usePresignQualificationImageUploadMutation();
  const [updateQualificationMain] = useUpdateQualificationMainMutation();

  const { data: awardingBodiesData } = useGetAwardingBodiesQuery(null);
  const { data: categories } = useGetCategoriesQuery(null);
  const { data: deliveryModes } = useGetDeliveryModesQuery(null);
  const { data: levels } = useGetLevelsQuery(null);
  const { data: types } = useGetTypesQuery(null);
  const navigate = useNavigate();

  const { data } = useGetQualificationMainQuery(qualificationId, {
    skip: !qualificationId,
  });

  const draftKey = buildQualificationDraftKey("main", qualificationId);
  // Holds the existing image URL string from the API (edit mode only)
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [clearFeaturedImage, setClearFeaturedImage] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState<QualificationMainDraft | null | undefined>(undefined);
  const hydrationRef = useRef(false);

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
  const statusValue = watch("status");

  useEffect(() => {
    let active = true;
    setDraftLoaded(undefined);

    loadQualificationDraft<QualificationMainDraft>(draftKey)
      .then((draft) => {
        if (active) setDraftLoaded(draft);
      })
      .catch(() => {
        if (active) setDraftLoaded(null);
      });

    return () => {
      active = false;
    };
  }, [draftKey]);

  useEffect(() => {
    if (draftLoaded === undefined) return;
    if (isEditMode && !data?.data) return;

    if (isEditMode && data?.data) {
      const { featured_image, ...rest } = data.data as any;
      const nextValues = {
        ...defaultValues,
        ...rest,
        category: normalizeSelectValue(rest.category),
        level: normalizeSelectValue(rest.level),
        awarding_body: normalizeSelectValue(rest.awarding_body),
        qualification_type: normalizeSelectValue(rest.qualification_type),
        delivery_mode: normalizeSelectValue(rest.delivery_mode),
        featured_image: draftLoaded?.values.featured_image ?? null,
      };

      form.reset(nextValues);
      setExistingImageUrl(draftLoaded?.clearFeaturedImage ? undefined : withCacheBust(featured_image));
      setClearFeaturedImage(Boolean(draftLoaded?.clearFeaturedImage));
      hydrationRef.current = true;
      return;
    }

    form.reset({
      ...defaultValues,
      ...(draftLoaded?.values ?? {}),
    });
    setExistingImageUrl(undefined);
    setClearFeaturedImage(Boolean(draftLoaded?.clearFeaturedImage));
    hydrationRef.current = true;
  }, [data?.data, draftLoaded, form, isEditMode]);

  // ── Auto-generate slug from title (create mode only) ─────────────────────
  useEffect(() => {
    if (!isEditMode && titleValue) {
      setValue("slug", generateSlug(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isEditMode, setValue]);

  useEffect(() => {
    if (!hydrationRef.current) return;

    const subscription = watch((values) => {
      saveQualificationDraft(draftKey, {
        values: values as QualificationMainFormValues,
        clearFeaturedImage,
      });
    });

    return () => subscription.unsubscribe();
  }, [clearFeaturedImage, draftKey, watch]);

  useEffect(() => {
    if (!hydrationRef.current) return;
    saveQualificationDraft(draftKey, {
      values: form.getValues(),
      clearFeaturedImage,
    });
  }, [clearFeaturedImage, draftKey, form]);

  const uploadFeaturedImage = async (file: File): Promise<string> => {
    const presignResult = await presignQualificationImageUpload({
      file_name: file.name,
      content_type: file.type,
    }).unwrap();

    const presign = presignResult?.data as PresignResponse;
    const formData = new FormData();

    Object.entries(presign.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    const uploadResponse = await fetch(presign.upload_url, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Direct image upload to S3 failed.");
    }

    return presign.key;
  };

  const buildPayload = async (
    values: QualificationMainFormValues,
  ): Promise<QualificationPayload> => {
    const payload: QualificationPayload = { ...values };
    delete (payload as { featured_image?: File | null }).featured_image;

    if (clearFeaturedImage) {
      payload.clear_featured_image = true;
    }

    if (values.featured_image instanceof File) {
      payload.featured_image_key = await uploadFeaturedImage(values.featured_image);
    }

    return payload;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: QualificationMainFormValues) => {
    const payload = await buildPayload(values);

    if (isEditMode) {
      const [data, error] = await TryCatch(
        updateQualificationMain({
          id: qualificationId,
          payload,
        }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Qualification updated successfully",
      });

      if (result.type === "success") {
        const updatedImage = data?.data?.featured_image;
        setExistingImageUrl(withCacheBust(updatedImage));
        setClearFeaturedImage(false);
        form.setValue("featured_image", null);
        clearQualificationDraft(draftKey);
      }

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });
    } else {
      const [data, error] = await TryCatch(
        createQualificationMain(payload).unwrap(),
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
        clearQualificationDraft(draftKey);
      if (result.type === "success")
        navigate(`/admin/qualifications/${data?.data?.id}/edit?step=2`);
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
                      Auto-generated from the title. Only update this if a specific URL slug is required.
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
                  <FormLabel>Qualification Code *</FormLabel>
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
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {categories?.data?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="awarding_body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Awarding Body</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select awarding body" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {awardingBodiesData?.data?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {levels?.data?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualification_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification Type</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {types?.data?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Mode</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery mode" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {deliveryModes?.data?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                      onChange={(file) => {
                        if (file) {
                          setClearFeaturedImage(false);
                        }
                        field.onChange(file);
                      }}
                      onClearExisting={() => {
                        setExistingImageUrl(undefined);
                        setClearFeaturedImage(true);
                      }}
                      existingUrl={existingImageUrl}
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
