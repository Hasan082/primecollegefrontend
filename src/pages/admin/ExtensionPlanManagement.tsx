import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, BadgePoundSterling, Edit, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import TablePagination from "@/components/admin/TablePagination";
import { useToast } from "@/hooks/use-toast";
import {
  type ExtensionPlanPayload,
  type ExtensionPlanRecord,
  useCreateExtensionPlanMutation,
  useDeleteExtensionPlanMutation,
  useGetExtensionPlansQuery,
  useUpdateExtensionPlanMutation,
} from "@/redux/apis/enrolmentExtensionPlanApi";
import { TryCatch } from "@/utils/apiTryCatch";

const planSchema = z.object({
  label: z.string().min(1, "Label is required"),
  duration_mode: z.enum(["preset", "custom"]),
  duration_months: z.coerce.number().int().min(1, "Minimum 1 month"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Use a valid price like 120 or 120.00"),
  currency: z.string().min(1, "Currency is required"),
  sort_order: z.coerce.number().int().min(0, "Sort order cannot be negative"),
  is_active: z.boolean().default(true),
});

type ExtensionPlanFormValues = z.infer<typeof planSchema>;

const presetOptions = [
  { value: "1", label: "1 Month" },
  { value: "2", label: "2 Months" },
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "9", label: "9 Months" },
  { value: "12", label: "1 Year" },
];

const presetLabelMap = new Map(presetOptions.map((option) => [Number(option.value), option.label]));

const defaultValues: ExtensionPlanFormValues = {
  label: "",
  duration_mode: "preset",
  duration_months: 1,
  amount: "",
  currency: "GBP",
  sort_order: 0,
  is_active: true,
};

const ExtensionPlanManagement = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const { data, isLoading } = useGetExtensionPlansQuery();
  const [createPlan] = useCreateExtensionPlanMutation();
  const [updatePlan] = useUpdateExtensionPlanMutation();
  const [deletePlan] = useDeleteExtensionPlanMutation();

  const form = useForm<ExtensionPlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  const durationMode = form.watch("duration_mode");
  const itemsPerPage = 10;

  const plans = useMemo<ExtensionPlanRecord[]>(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data?.data],
  );

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) => {
        const haystack = `${plan.label} ${plan.duration_mode} ${plan.duration_months} ${plan.amount}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [plans, search],
  );

  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const resetForm = () => {
    form.reset(defaultValues);
    setEditingPlanId(null);
  };

  const handleEdit = (plan: ExtensionPlanRecord) => {
    setEditingPlanId(plan.id);
    form.reset({
      label: plan.label,
      duration_mode: plan.duration_mode,
      duration_months: plan.duration_months,
      amount: String(plan.amount),
      currency: plan.currency,
      sort_order: plan.sort_order,
      is_active: plan.is_active,
    });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const onSubmit = async (values: ExtensionPlanFormValues) => {
    const payload: ExtensionPlanPayload = {
      ...values,
      label:
        values.duration_mode === "preset"
          ? presetLabelMap.get(values.duration_months) || values.label
          : values.label,
    };

    const [, error] = await TryCatch(
      editingPlanId
        ? updatePlan({ id: editingPlanId, payload }).unwrap()
        : createPlan(payload).unwrap(),
    );

    if (error) {
      toast({
        title: "Unable to save plan",
        description: "Please review the form and try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: editingPlanId ? "Plan updated" : "Plan created",
      description: editingPlanId
        ? "Extension plan updated successfully."
        : "Extension plan created successfully.",
    });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const [, error] = await TryCatch(deletePlan(id).unwrap());
    if (error) {
      toast({
        title: "Unable to delete plan",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Plan deleted",
      description: "Extension plan deleted successfully.",
    });
    if (editingPlanId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Extension Plan Management</h1>
          <p className="text-sm text-muted-foreground">
            Control learner extension durations and prices from the backend.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BadgePoundSterling className="h-4 w-4 text-primary" />
          Pricing is now admin-managed, not hard-coded.
        </div>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            {editingPlanId ? "Edit Extension Plan" : "Create Extension Plan"}
          </CardTitle>
          <CardDescription>
            Use preset durations for standard plans or switch to custom for any month count your team needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField
                  control={form.control}
                  name="duration_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "preset") {
                            const months = 1;
                            form.setValue("duration_months", months);
                            form.setValue("label", presetLabelMap.get(months) || "1 Month");
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="preset">Preset</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {durationMode === "preset" ? (
                  <FormField
                    control={form.control}
                    name="duration_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => {
                            const months = Number(value);
                            field.onChange(months);
                            form.setValue("label", presetLabelMap.get(months) || "");
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {presetOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="duration_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Months</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Enter months"
                            {...field}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 15 Months Special Extension"
                          {...field}
                          disabled={durationMode === "preset"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 120.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="0"
                          {...field}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex h-full flex-row items-center justify-between rounded-lg border border-border px-3 py-3 md:col-span-2 xl:col-span-1">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Active</FormLabel>
                        <p className="text-xs text-muted-foreground">Only active plans appear in learner payment flow.</p>
                      </div>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">
                  {editingPlanId ? (
                    <>
                      <Edit className="mr-1.5 h-4 w-4" /> Update Plan
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1.5 h-4 w-4" /> Create Plan
                    </>
                  )}
                </Button>
                {editingPlanId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Available Plans</CardTitle>
              <CardDescription>Manage preset and custom extension pricing for learners.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search plans..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Loading extension plans...
                  </TableCell>
                </TableRow>
              ) : paginatedPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No extension plans found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{plan.label}</p>
                        <p className="text-xs text-muted-foreground">{plan.currency}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          plan.duration_mode === "preset"
                            ? "border-primary/20 bg-primary/5 text-primary"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {plan.duration_mode}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.duration_months} month{plan.duration_months === 1 ? "" : "s"}</TableCell>
                    <TableCell className="font-medium">
                      {plan.currency} {plan.amount}
                    </TableCell>
                    <TableCell>{plan.sort_order}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          plan.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }
                      >
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete extension plan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove <strong>{plan.label}</strong> from admin and learner plan selection.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(plan.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalItems={filteredPlans.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionPlanManagement;
