import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { format, setHours, setMinutes } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Loader2,
  Trash2,
  Edit,
  Plus,
  X,
} from "lucide-react";

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateQualificationPriceMutation,
  useGetQualificationPricesQuery,
  useUpdateQualificationPriceMutation,
  useDeleteQualificationPriceMutation,
} from "@/redux/apis/qualification/qualificationPriceApi";
import { useGetQualificationMainQuery } from "@/redux/apis/qualification/qualificationMainApi";
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

    effective_to: z.date().optional(),

    is_active: z.boolean().default(true),
  })
  .refine((data) => !data.effective_to || data.effective_to > data.effective_from, {
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

interface QualificationPriceData extends QualificationPriceFormValues {
  id: string;
}

const QualificationPrice = () => {
  const { qualificationId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

  const { data: pricesData, isLoading: isLoadingPrices } =
    useGetQualificationPricesQuery(qualificationId, {
      skip: !qualificationId,
    });
  const { data: qualificationMainData } = useGetQualificationMainQuery(qualificationId, {
    skip: !qualificationId,
  });

  const [createQualificationPrice] = useCreateQualificationPriceMutation();
  const [updateQualificationPrice] = useUpdateQualificationPriceMutation();
  const [deleteQualificationPrice] = useDeleteQualificationPriceMutation();
  const isSessionBased = Boolean(qualificationMainData?.data?.is_session);

  const form = useForm<QualificationPriceFormValues>({
    resolver: zodResolver(qualificationPriceSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEdit = (price: QualificationPriceData) => {
    setEditingPriceId(price.id);
    reset({
      amount: String(price.amount),
      currency: price.currency,
      effective_from: new Date(price.effective_from),
      effective_to: price.effective_to ? new Date(price.effective_to) : undefined,
      is_active: price.is_active,
    });
    setIsFormOpen(true);
    // Use requestAnimationFrame to ensure the form is rendered before scrolling
    window.requestAnimationFrame(() => {
      const formElement = document.getElementById("qualification-price-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const handleAddNew = () => {
    setEditingPriceId(null);
    reset(defaultValues);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const [data, error] = await TryCatch(deleteQualificationPrice(id).unwrap());
    const result = handleResponse({
      data,
      error,
      successMessage: "Price deleted successfully",
    });

    toast({
      title: result.type === "success" ? "Success" : "Error",
      description: result.message,
      variant: result.type === "error" ? "destructive" : "default",
    });
  };

  const onSubmit = async (values: QualificationPriceFormValues) => {
    const payload: Record<string, unknown> = {
      ...values,
      effective_from: values.effective_from.toISOString(),
    };

    if (values.effective_to) {
      payload.effective_to = values.effective_to.toISOString();
    }

    if (editingPriceId) {
      const [data, error] = await TryCatch(
        updateQualificationPrice({
          id: editingPriceId,
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

      if (result.type === "success") {
        setIsFormOpen(false);
        setEditingPriceId(null);
        reset(defaultValues);
      }
    } else {
      const [data, error] = await TryCatch(
        createQualificationPrice({ id: qualificationId, payload }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Price created successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });

      if (result.type === "success") {
        setIsFormOpen(false);
        reset(defaultValues);
      }
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Qualification Prices</h2>
        {!isFormOpen && (
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add New Price
          </Button>
        )}
      </div>

      {isFormOpen && (
      <Card id="qualification-price-form" className="border-primary/20 shadow-none scroll-mt-24">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                {editingPriceId ? "Edit Price" : "Add New Price"}
              </CardTitle>
              <CardDescription>
                {editingPriceId
                  ? "Update the existing pricing details"
                  : "Configure a new price point for this qualification"}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFormOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            <Input
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                            />
                          </div>
                        </FormControl>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                            placeholder="Optional end date & time"
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank to keep this price active until a newer price replaces it.
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
                              Only active prices will be shown to learners
                              during enrollment
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-36"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting
                      ? editingPriceId
                        ? "Updating…"
                        : "Creating…"
                      : editingPriceId
                        ? "Update Price"
                        : "Create Price"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Prices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPrices ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pricesData?.data?.results?.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricesData.data?.results?.map(
                    (price: QualificationPriceData) => (
                      <TableRow key={price.id}>
                        <TableCell className="font-medium">
                          {price.amount}
                        </TableCell>
                        <TableCell>{price.currency}</TableCell>
                        <TableCell>
                          {format(new Date(price.effective_from), "PPP, HH:mm")}
                        </TableCell>
                        <TableCell>
                          {price.effective_to
                            ? format(new Date(price.effective_to), "PPP, HH:mm")
                            : "Until replaced"}
                        </TableCell>
                        <TableCell>
                          {price.is_active ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(price)}
                              title="Edit Price"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete Price"
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
                                    permanently delete the price
                                    {price.amount} {price.currency} from the
                                    records.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(price.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">No prices configured yet.</p>
              <Button variant="link" onClick={handleAddNew}>
                Click here to add your first price
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualificationPrice;
