import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import {
  AdminQualificationUpsell,
  AdminQualificationUpsellPayload,
  useCreateAdminQualificationUpsellMutation,
  useDeleteAdminQualificationUpsellMutation,
  useGetAdminQualificationUpsellsQuery,
  useGetQualificationsAdminQuery,
  useUpdateAdminQualificationUpsellMutation,
} from "@/redux/apis/qualification/qualificationApi";

type DiscountMode = "amount" | "percent";

type UpsellFormState = {
  source_qualification: string;
  target_qualification: string;
  title_override: string;
  message: string;
  discount_mode: DiscountMode;
  discount_value: string;
  sort_order: string;
  is_active: boolean;
};

type QualificationOption = {
  id: string;
  title: string;
  current_price: string | null;
  currency: string;
  status?: string;
};

const emptyForm: UpsellFormState = {
  source_qualification: "",
  target_qualification: "",
  title_override: "",
  message: "",
  discount_mode: "percent",
  discount_value: "10.00",
  sort_order: "0",
  is_active: true,
};

const getReferenceId = (
  reference: AdminQualificationUpsell["source_qualification"],
) => (typeof reference === "string" ? reference : reference?.id || "");

const getReferenceLabel = (
  reference: AdminQualificationUpsell["source_qualification"],
  qualificationMap: Map<string, QualificationOption>,
) => {
  const id = getReferenceId(reference);
  if (typeof reference !== "string") {
    return reference?.title || reference?.name || qualificationMap.get(id)?.title || id;
  }

  return qualificationMap.get(id)?.title || id;
};

const extractErrorMessage = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractErrorMessage).filter(Boolean).join(" ");
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      extractErrorMessage(record.message) ||
      extractErrorMessage(record.detail) ||
      extractErrorMessage(record.error) ||
      Object.values(record).map(extractErrorMessage).filter(Boolean).join(" ")
    );
  }
  return "";
};

const formatDiscount = (
  upsell: AdminQualificationUpsell,
  qualificationMap: Map<string, QualificationOption>,
) => {
  const amount = Number(upsell.discount_amount || 0);
  const percent = Number(upsell.discount_percent || 0);
  const targetId = getReferenceId(upsell.target_qualification);
  const currency = qualificationMap.get(targetId)?.currency || "GBP";

  if (percent > 0) {
    return `${percent.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}%`;
  }

  return formatPrice(amount, currency);
};

const buildPayload = (
  form: UpsellFormState,
): AdminQualificationUpsellPayload => {
  const value = Number(form.discount_value || 0);
  const formattedValue = Number.isFinite(value) ? value.toFixed(2) : "0.00";

  return {
    source_qualification: form.source_qualification,
    target_qualification: form.target_qualification,
    title_override: form.title_override.trim(),
    message: form.message.trim(),
    discount_amount: form.discount_mode === "amount" ? formattedValue : "0.00",
    discount_percent: form.discount_mode === "percent" ? formattedValue : "0.00",
    sort_order: Number(form.sort_order || 0),
    is_active: form.is_active,
  };
};

const UpsellManagement = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpsell, setEditingUpsell] =
    useState<AdminQualificationUpsell | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminQualificationUpsell | null>(null);
  const [form, setForm] = useState<UpsellFormState>(emptyForm);

  const { data: upsells = [], isLoading: isLoadingUpsells } =
    useGetAdminQualificationUpsellsQuery();
  const { data: qualificationsData, isLoading: isLoadingQualifications } =
    useGetQualificationsAdminQuery({ page_size: 500 });

  const [createUpsell, { isLoading: isCreating }] =
    useCreateAdminQualificationUpsellMutation();
  const [updateUpsell, { isLoading: isUpdating }] =
    useUpdateAdminQualificationUpsellMutation();
  const [deleteUpsell, { isLoading: isDeleting }] =
    useDeleteAdminQualificationUpsellMutation();

  const qualificationOptions = useMemo<QualificationOption[]>(() => {
    const rows = qualificationsData?.data?.results || [];
    return rows
      .map((qualification: any) => ({
        id: qualification.id,
        title: qualification.title || qualification.name || qualification.id,
        current_price: qualification.current_price || null,
        currency: qualification.currency || "GBP",
        status: qualification.status,
      }))
      .filter((qualification: QualificationOption) => Boolean(qualification.id));
  }, [qualificationsData?.data?.results]);

  const qualificationMap = useMemo(
    () =>
      new Map(
        qualificationOptions.map((qualification) => [
          qualification.id,
          qualification,
        ]),
      ),
    [qualificationOptions],
  );

  const sourceActiveCount = useMemo(() => {
    const counts = new Map<string, number>();
    upsells.forEach((upsell) => {
      if (!upsell.is_active) return;
      const sourceId = getReferenceId(upsell.source_qualification);
      counts.set(sourceId, (counts.get(sourceId) || 0) + 1);
    });
    return counts;
  }, [upsells]);

  const filteredUpsells = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...upsells]
      .filter((upsell) => {
        const sourceId = getReferenceId(upsell.source_qualification);
        const targetId = getReferenceId(upsell.target_qualification);
        const sourceLabel = getReferenceLabel(
          upsell.source_qualification,
          qualificationMap,
        );
        const targetLabel = getReferenceLabel(
          upsell.target_qualification,
          qualificationMap,
        );

        const matchesSearch =
          !term ||
          sourceLabel.toLowerCase().includes(term) ||
          targetLabel.toLowerCase().includes(term) ||
          (upsell.title_override || "").toLowerCase().includes(term) ||
          (upsell.message || "").toLowerCase().includes(term);
        const matchesSource =
          sourceFilter === "all" || sourceFilter === sourceId;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && upsell.is_active) ||
          (statusFilter === "inactive" && !upsell.is_active);

        return matchesSearch && matchesSource && matchesStatus;
      })
      .sort((left, right) => {
        const leftSource = getReferenceLabel(
          left.source_qualification,
          qualificationMap,
        );
        const rightSource = getReferenceLabel(
          right.source_qualification,
          qualificationMap,
        );
        if (leftSource !== rightSource) return leftSource.localeCompare(rightSource);
        return (left.sort_order || 0) - (right.sort_order || 0);
      });
  }, [qualificationMap, search, sourceFilter, statusFilter, upsells]);

  const activeSourceCount = form.source_qualification
    ? upsells.filter(
        (upsell) =>
          upsell.is_active &&
          getReferenceId(upsell.source_qualification) ===
            form.source_qualification &&
          upsell.id !== editingUpsell?.id,
      ).length
    : 0;
  const sourceLimitReached = form.is_active && activeSourceCount >= 2;
  const isSubmitting = isCreating || isUpdating;

  const resetDialog = () => {
    setEditingUpsell(null);
    setForm(emptyForm);
  };

  const openCreateDialog = () => {
    resetDialog();
    setDialogOpen(true);
  };

  const openEditDialog = (upsell: AdminQualificationUpsell) => {
    const amount = Number(upsell.discount_amount || 0);
    const percent = Number(upsell.discount_percent || 0);
    setEditingUpsell(upsell);
    setForm({
      source_qualification: getReferenceId(upsell.source_qualification),
      target_qualification: getReferenceId(upsell.target_qualification),
      title_override: upsell.title_override || "",
      message: upsell.message || "",
      discount_mode: percent > 0 ? "percent" : "amount",
      discount_value: String(percent > 0 ? percent : amount || 0),
      sort_order: String(upsell.sort_order || 0),
      is_active: upsell.is_active,
    });
    setDialogOpen(true);
  };

  const validateForm = () => {
    if (!form.source_qualification) {
      return "Select the main qualification.";
    }

    if (!form.target_qualification) {
      return "Select the upsell qualification.";
    }

    if (form.source_qualification === form.target_qualification) {
      return "Source and target qualifications cannot be the same.";
    }

    const discountValue = Number(form.discount_value);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return "Enter a discount greater than zero.";
    }

    if (form.discount_mode === "percent" && discountValue > 100) {
      return "Percentage discount cannot be more than 100.";
    }

    if (form.discount_mode === "amount") {
      const targetQualification = qualificationMap.get(form.target_qualification);
      const targetPrice = Number(targetQualification?.current_price ?? Number.NaN);
      if (Number.isFinite(targetPrice) && discountValue > targetPrice) {
        return `Discount amount cannot exceed the upsell price of ${formatPrice(
          targetPrice,
          targetQualification?.currency,
        )}.`;
      }
    }

    if (sourceLimitReached) {
      return "This main qualification already has 2 active upsells.";
    }

    // Check if discount matches existing upsells from the same source
    const existingUpsellsFromSource = upsells.filter(
      (upsell) =>
        getReferenceId(upsell.source_qualification) === form.source_qualification &&
        upsell.id !== editingUpsell?.id, // Exclude the upsell being edited
    );

    if (existingUpsellsFromSource.length > 0) {
      const existingUpsell = existingUpsellsFromSource[0];
      const existingDiscountPercent = Number(existingUpsell.discount_percent || 0);
      const existingDiscountAmount = Number(existingUpsell.discount_amount || 0);
      const newDiscountValue = Number(form.discount_value);

      const existingDiscountText =
        existingDiscountPercent > 0
          ? `${existingDiscountPercent.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}%`
          : `£${existingDiscountAmount.toFixed(2)}`;

      const formDiscountMismatch =
        form.discount_mode === "percent"
          ? existingDiscountPercent !== newDiscountValue
          : existingDiscountAmount !== newDiscountValue;

      if (formDiscountMismatch) {
        const sourceName = qualificationMap.get(form.source_qualification)?.title || form.source_qualification;
        return `All upsells from '${sourceName}' must use the same discount. Existing upsells use: ${existingDiscountText}`;
      }
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      toast({
        title: "Cannot save upsell",
        description: validationMessage,
        variant: "destructive",
      });
      return;
    }

    const payload = buildPayload(form);

    try {
      if (editingUpsell) {
        await updateUpsell({ id: editingUpsell.id, body: payload }).unwrap();
      } else {
        await createUpsell(payload).unwrap();
      }

      toast({
        title: editingUpsell ? "Upsell updated" : "Upsell created",
        description: "The qualification upsell configuration has been saved.",
      });
      setDialogOpen(false);
      resetDialog();
    } catch (error: any) {
      toast({
        title: "Unable to save upsell",
        description:
          extractErrorMessage(error?.data) ||
          "Please review the values and try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (upsell: AdminQualificationUpsell) => {
    const sourceId = getReferenceId(upsell.source_qualification);
    const activeCount = upsells.filter(
      (item) =>
        item.is_active &&
        item.id !== upsell.id &&
        getReferenceId(item.source_qualification) === sourceId,
    ).length;

    if (!upsell.is_active && activeCount >= 2) {
      toast({
        title: "Cannot activate upsell",
        description: "This main qualification already has 2 active upsells.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUpsell({
        id: upsell.id,
        body: { is_active: !upsell.is_active },
      }).unwrap();
      toast({
        title: !upsell.is_active ? "Upsell activated" : "Upsell paused",
      });
    } catch (error: any) {
      toast({
        title: "Unable to update status",
        description:
          extractErrorMessage(error?.data) ||
          "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUpsell(deleteTarget.id).unwrap();
      toast({
        title: "Upsell deleted",
        description: "The upsell offer has been removed.",
      });
      setDeleteTarget(null);
    } catch (error: any) {
      toast({
        title: "Unable to delete upsell",
        description:
          extractErrorMessage(error?.data) ||
          "Please try again in a moment.",
        variant: "destructive",
      });
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upsell & Discount Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure which qualification is offered as an upsell and the
            discount applied at checkout.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Upsell
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Active Offers
            </p>
            <p className="mt-2 text-2xl font-bold">
              {upsells.filter((upsell) => upsell.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Main Qualifications
            </p>
            <p className="mt-2 text-2xl font-bold">
              {
                new Set(
                  upsells
                    .filter((upsell) => upsell.is_active)
                    .map((upsell) => getReferenceId(upsell.source_qualification)),
                ).size
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Rule
            </p>
            <p className="mt-2 text-sm font-semibold">
              Max 2 active upsells per main qualification
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Checkout rule</AlertTitle>
        <AlertDescription>
          Each offer uses one main qualification and one upsell qualification.
          Use either a fixed amount or percentage discount; the backend
          calculates the final checkout discount.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">Configured Upsells</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search source or upsell..."
                  className="pl-9"
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="sm:w-64">
                  <SelectValue placeholder="Main qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All main qualifications</SelectItem>
                  {qualificationOptions.map((qualification) => (
                    <SelectItem key={qualification.id} value={qualification.id}>
                      {qualification.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Main Qualification</TableHead>
                <TableHead>Upsell Qualification</TableHead>
                <TableHead className="hidden lg:table-cell">Discount</TableHead>
                <TableHead className="hidden md:table-cell">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUpsells || isLoadingQualifications ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading upsells...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUpsells.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    No upsell offers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUpsells.map((upsell) => {
                  const sourceId = getReferenceId(upsell.source_qualification);
                  const targetId = getReferenceId(upsell.target_qualification);
                  const targetQualification = qualificationMap.get(targetId);
                  return (
                    <TableRow key={upsell.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {getReferenceLabel(
                              upsell.source_qualification,
                              qualificationMap,
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sourceActiveCount.get(sourceId) || 0}/2 active
                            upsells
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {getReferenceLabel(
                              upsell.target_qualification,
                              qualificationMap,
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {upsell.title_override ||
                              formatPrice(
                                targetQualification?.current_price,
                                targetQualification?.currency,
                              )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">
                          {formatDiscount(upsell, qualificationMap)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {upsell.sort_order || 0}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(upsell)}
                          className="text-left"
                        >
                          <Badge
                            variant={upsell.is_active ? "default" : "secondary"}
                            className="cursor-pointer"
                          >
                            {upsell.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Edit upsell"
                            onClick={() => openEditDialog(upsell)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Delete upsell"
                            onClick={() => setDeleteTarget(upsell)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialog();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUpsell ? "Edit Upsell Offer" : "Create Upsell Offer"}
            </DialogTitle>
            <DialogDescription>
              Select one main qualification and one discounted upsell
              qualification.
            </DialogDescription>
          </DialogHeader>

          <form id="upsell-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Main qualification</Label>
                <Select
                  value={form.source_qualification}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      source_qualification: value,
                      target_qualification:
                        current.target_qualification === value
                          ? ""
                          : current.target_qualification,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select main qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualificationOptions.map((qualification) => (
                      <SelectItem key={qualification.id} value={qualification.id}>
                        {qualification.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.source_qualification ? (
                  <p className="text-xs text-muted-foreground">
                    {activeSourceCount}/2 active upsells already configured for
                    this main qualification.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Upsell qualification</Label>
                <Select
                  value={form.target_qualification}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      target_qualification: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select upsell qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualificationOptions
                      .filter(
                        (qualification) =>
                          qualification.id !== form.source_qualification,
                      )
                      .map((qualification) => (
                        <SelectItem
                          key={qualification.id}
                          value={qualification.id}
                        >
                          {qualification.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {sourceLimitReached ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Limit reached</AlertTitle>
                <AlertDescription>
                  This main qualification already has 2 active upsells. Pause
                  one before adding another active offer.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <div className="space-y-2">
                <Label htmlFor="title_override">Title override</Label>
                <Input
                  id="title_override"
                  value={form.title_override}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title_override: event.target.value,
                    }))
                  }
                  placeholder="Bundle with Advanced Course"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sort_order: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Save when bought together"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_1fr_140px]">
              <div className="space-y-2">
                <Label>Discount type</Label>
                <Select
                  value={form.discount_mode}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      discount_mode: value as DiscountMode,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="amount">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  {form.discount_mode === "percent"
                    ? "Discount percent"
                    : "Discount amount"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={form.discount_mode === "percent" ? 100 : undefined}
                  step="0.01"
                  value={form.discount_value}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      discount_value: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex h-10 items-center gap-3 rounded-md border border-input px-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        is_active: checked,
                      }))
                    }
                  />
                  <span className="text-sm">
                    {form.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="upsell-form"
              disabled={isSubmitting || sourceLimitReached}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {editingUpsell ? "Update Upsell" : "Create Upsell"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete upsell offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the upsell configuration. It will no longer be shown
              on the public qualification page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UpsellManagement;
