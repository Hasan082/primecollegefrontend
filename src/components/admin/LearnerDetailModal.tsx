import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Users,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import type { AdminLearner } from "@/data/adminMockData";
import {
  useGetEnrolledLearnerActionModalDataQuery,
  useUpdateEnrolmentStatusMutation,
  useUpdateLearnerPersonalInfoMutation,
} from "@/redux/apis/admin/learnerManagementApi";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  learner: AdminLearner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updated: AdminLearner) => void;
}

type LearnerActionTab =
  | "personal_info"
  | "unit_progress"
  | "staff_assignment"
  | "payment";

type HeaderData = {
  learner_name: string;
  qualification_learner_id: string;
  status: string;
};

type PersonalInfoContent = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  enrolled_at: string;
  access_expires_at: string;
  qualification: {
    id: string;
    title: string;
  } | null;
  assigned_trainer: {
    id: string;
    name: string;
  } | null;
  assigned_iqa: {
    id: string;
    name: string;
  } | null;
  progress: {
    completed_units: number;
    total_units: number;
    progress_percent: number;
  } | null;
};

type StaffMember = {
  id: string;
  name: string;
};

type StaffOptionComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: StaffMember[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
};

type StaffAssignmentContent = {
  current: {
    trainer: StaffMember | null;
    iqa: StaffMember | null;
  };
  options: {
    trainers: StaffMember[];
    iqas: StaffMember[];
  };
};

type UnitTimelineItem = {
  type: string;
  label: string;
  date: string;
};

type UnitProgressItem = {
  unit_id: string;
  unit_code: string;
  title: string;
  status: string;
  last_activity_at: string | null;
  timeline: UnitTimelineItem[];
};

type PaymentHistoryItem = {
  id: string;
  label: string;
  amount: string;
  currency: string;
  status: string;
  paid_at: string | null;
};

type PaymentContent = {
  payment_method: string;
  payment_status: string;
  history: PaymentHistoryItem[];
};

type LearnerActionResponse = {
  success: boolean;
  message: string;
  data: {
    header: HeaderData;
    tab: LearnerActionTab;
    content:
      | PersonalInfoContent
      | StaffAssignmentContent
      | UnitProgressItem[]
      | PaymentContent;
  };
};

const DEFAULT_TAB: LearnerActionTab = "personal_info";
const UNASSIGNED_VALUE = "__unassigned__";

const formatLabel = (value?: string | null) => {
  if (!value) return "N/A";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string | null, includeTime = false) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
};

const formatCurrency = (amount: string, currency: string) => {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return `${currency} ${amount}`;
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(numericAmount);
};

const paymentBadge = (status: string) => {
  const map: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    paid: "default",
    pending: "secondary",
    overdue: "destructive",
  };

  return (
    <Badge variant={map[status] || "outline"}>{formatLabel(status)}</Badge>
  );
};

const unitStatusBadge = (status: string) => {
  if (status === "completed" || status === "competent") {
    return (
      <Badge variant="default" className="text-[10px]">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completed
      </Badge>
    );
  }

  if (status === "in_progress") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        <Clock className="mr-1 h-3 w-3" />
        In Progress
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-[10px]">
      {formatLabel(status)}
    </Badge>
  );
};

const timelineIcon = (type: string) => {
  if (type.includes("submitted")) {
    return <FileText className="h-3 w-3 text-primary" />;
  }

  if (type === "competent") {
    return <CheckCircle2 className="h-3 w-3 text-green-600" />;
  }

  if (type.includes("required")) {
    return <AlertTriangle className="h-3 w-3 text-amber-500" />;
  }

  return <Calendar className="h-3 w-3 text-muted-foreground" />;
};

const LoadingState = () => (
  <div className="space-y-3 pr-3">
    <Skeleton className="h-28 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const ErrorState = () => (
  <Card>
    <CardContent className="py-10 text-center">
      <p className="text-sm font-medium text-destructive">
        Failed to load tab data
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Please try again by reopening the modal or selecting the tab again.
      </p>
    </CardContent>
  </Card>
);

const EmptyState = ({ message }: { message: string }) => (
  <Card>
    <CardContent className="py-10 text-center text-sm text-muted-foreground">
      {message}
    </CardContent>
  </Card>
);

const getSafeStaffAssignmentContent = (
  value: LearnerActionResponse["data"]["content"] | undefined,
): StaffAssignmentContent | undefined => {
  if (!value || Array.isArray(value) || !("current" in value)) {
    return undefined;
  }

  return {
    current: {
      trainer: value.current?.trainer ?? null,
      iqa: value.current?.iqa ?? null,
    },
    options: {
      trainers: Array.isArray(value.options?.trainers)
        ? value.options.trainers
        : [],
      iqas: Array.isArray(value.options?.iqas) ? value.options.iqas : [],
    },
  };
};

const StaffOptionCombobox = ({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
}: StaffOptionComboboxProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption =
    value === UNASSIGNED_VALUE
      ? { id: UNASSIGNED_VALUE, name: "Unassigned" }
      : options.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedOption?.name || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-60">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="unassigned"
                onSelect={() => {
                  onChange(UNASSIGNED_VALUE);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === UNASSIGNED_VALUE ? "opacity-100" : "opacity-0",
                  )}
                />
                Unassigned
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.name} ${option.id}`}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// TODO: need to work here for unit assignment
const LearnerDetailModal = ({ learner, open, onOpenChange, onUpdate }: Props) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<LearnerActionTab>(DEFAULT_TAB);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [selectedTrainer, setSelectedTrainer] = useState(UNASSIGNED_VALUE);
  const [selectedIqa, setSelectedIqa] = useState(UNASSIGNED_VALUE);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLearnerPersonalInfo, { isLoading: isUpdatingPersonalInfo }] =
    useUpdateLearnerPersonalInfoMutation();
  const [updateEnrolmentStatus, { isLoading: isUpdatingStatus }] =
    useUpdateEnrolmentStatusMutation();
  const [editData, setEditData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active" as AdminLearner["status"],
  });

  useEffect(() => {
    if (open) {
      setActiveTab(DEFAULT_TAB);
      setExpandedUnits(new Set());
      setIsEditing(false);
    }
  }, [open, learner?.id]);

  const {
    data,
    isFetching,
    error,
    refetch,
  } = useGetEnrolledLearnerActionModalDataQuery(
    {
      enrolmentId: learner?.id,
      tab: activeTab,
    },
    {
      skip: !open || !learner?.id,
      refetchOnMountOrArgChange: true,
    },
  );

  const modalData = data as LearnerActionResponse | undefined;
  const header = modalData?.data?.header;
  const content = modalData?.data?.content;
  const responseTab = modalData?.data?.tab;

  const personalInfo = useMemo(
    () =>
      activeTab === "personal_info" && responseTab === "personal_info"
        ? (content as PersonalInfoContent | undefined)
        : undefined,
    [activeTab, content, responseTab],
  );

  const staffAssignment = useMemo(
    () =>
      activeTab === "staff_assignment" && responseTab === "staff_assignment"
        ? getSafeStaffAssignmentContent(content)
        : undefined,
    [activeTab, content, responseTab],
  );

  const unitProgress = useMemo(
    () =>
      activeTab === "unit_progress" && responseTab === "unit_progress"
        ? ((content as UnitProgressItem[] | undefined) ?? [])
        : [],
    [activeTab, content, responseTab],
  );

  const paymentInfo = useMemo(
    () =>
      activeTab === "payment" && responseTab === "payment"
        ? (content as PaymentContent | undefined)
        : undefined,
    [activeTab, content, responseTab],
  );

  useEffect(() => {
    if (staffAssignment) {
      setSelectedTrainer(
        staffAssignment.current.trainer?.id || UNASSIGNED_VALUE,
      );
      setSelectedIqa(staffAssignment.current.iqa?.id || UNASSIGNED_VALUE);
    } else {
      setSelectedTrainer(UNASSIGNED_VALUE);
      setSelectedIqa(UNASSIGNED_VALUE);
    }
  }, [staffAssignment]);

  useEffect(() => {
    if (header || personalInfo) {
      setEditData({
        firstName: personalInfo?.first_name || "",
        middleName: personalInfo?.middle_name || "",
        lastName: personalInfo?.last_name || "",
        email: personalInfo?.email || learner?.email || "",
        phone: personalInfo?.phone || learner?.phone || "",
        status: (header?.status ||
          learner?.status ||
          "active") as AdminLearner["status"],
      });
    }
  }, [header, personalInfo, learner]);

  if (!learner) return null;

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const startEditing = () => {
    setEditData({
      firstName: personalInfo?.first_name || "",
      middleName: personalInfo?.middle_name || "",
      lastName: personalInfo?.last_name || "",
      email: personalInfo?.email || learner.email || "",
      phone: personalInfo?.phone || learner.phone || "",
      status: (header?.status || learner.status) as AdminLearner["status"],
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!personalInfo) return;

    const personalInfoPayload = {
      first_name: editData.firstName.trim(),
      middle_name: editData.middleName.trim(),
      last_name: editData.lastName.trim(),
      phone: editData.phone.trim(),
    };
    const personalInfoChanged =
      personalInfoPayload.first_name !== (personalInfo.first_name || "") ||
      personalInfoPayload.middle_name !== (personalInfo.middle_name || "") ||
      personalInfoPayload.last_name !== (personalInfo.last_name || "") ||
      personalInfoPayload.phone !== (personalInfo.phone || "");
    const statusChanged = editData.status !== (header?.status || learner.status);

    if (!personalInfoChanged && !statusChanged) {
      setIsEditing(false);
      return;
    }

    if (personalInfoChanged && !learner.learnerUserId) {
      toast({
        title: "Unable to update learner",
        description: "Learner id is missing for the personal info update.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (personalInfoChanged) {
        await updateLearnerPersonalInfo({
          learnerId: learner.learnerUserId,
          body: personalInfoPayload,
        }).unwrap();
      }

      if (statusChanged) {
        await updateEnrolmentStatus({
          enrolmentId: learner.id,
          body: { status: editData.status },
        }).unwrap();
      }

      await refetch();

      const updatedName = [
        personalInfoPayload.first_name,
        personalInfoPayload.middle_name,
        personalInfoPayload.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      const updated: AdminLearner = {
        ...learner,
        name: updatedName || learner.name,
        email: editData.email.trim(),
        phone: personalInfoPayload.phone,
        status: editData.status,
      };

      onUpdate?.(updated);
      setIsEditing(false);
      toast({
        title: "Learner updated",
        description: "Personal info and status were saved successfully.",
      });
    } catch (saveError: unknown) {
      const errorMessage =
        typeof saveError === "object" &&
        saveError !== null &&
        "data" in saveError &&
        typeof saveError.data === "object" &&
        saveError.data !== null
          ? ("detail" in saveError.data &&
              typeof saveError.data.detail === "string" &&
              saveError.data.detail) ||
            ("message" in saveError.data &&
              typeof saveError.data.message === "string" &&
              saveError.data.message) ||
            "Please try again."
          : "Please try again.";

      toast({
        title: "Failed to update learner",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isSaving = isUpdatingPersonalInfo || isUpdatingStatus;

  const titleName = header?.learner_name || learner.name;
  const titleLearnerId = header?.qualification_learner_id || learner.learnerId;
  const titleStatus = header?.status || learner.status;

  const displayFullName = [
    personalInfo?.first_name,
    personalInfo?.middle_name,
    personalInfo?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const displayStatus = titleStatus === "on_hold" ? "On Hold" : formatLabel(titleStatus);

  const statusVariant =
    titleStatus === "active"
      ? "default"
      : titleStatus === "completed"
        ? "secondary"
        : titleStatus === "suspended"
          ? "destructive"
          : "outline";

  const editStatusValue =
    editData.status === "suspended" ? "on_hold" : editData.status;

  const titleDisplayName = displayFullName || titleName;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setExpandedUnits(new Set());
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span>{titleDisplayName}</span>
              <p className="text-xs font-normal text-muted-foreground">
                {titleLearnerId}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant={statusVariant}>{displayStatus}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as LearnerActionTab)}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal_info" className="text-xs">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="unit_progress" className="text-xs">
              Unit Progress
            </TabsTrigger>
            <TabsTrigger value="staff_assignment" className="text-xs">
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">
              Payment
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="mt-3 h-[400px]">
            <TabsContent value="personal_info" className="mt-0 pr-3">
              {isFetching ? <LoadingState /> : null}
              {!isFetching && error ? <ErrorState /> : null}
              {!isFetching && !error && personalInfo ? (
                <div className="space-y-4">
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSaving}
                          onClick={cancelEditing}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Cancel
                        </Button>
                        <Button size="sm" disabled={isSaving} onClick={saveChanges}>
                          <Save className="mr-1 h-3.5 w-3.5" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startEditing}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">First Name</Label>
                              <Input
                                value={editData.firstName}
                                onChange={(e) =>
                                  setEditData((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Middle Name</Label>
                              <Input
                                value={editData.middleName}
                                onChange={(e) =>
                                  setEditData((prev) => ({
                                    ...prev,
                                    middleName: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs">Last Name</Label>
                            <Input
                              value={editData.lastName}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Email</Label>
                              <Input
                                type="email"
                                value={editData.email}
                                disabled
                                className="cursor-not-allowed bg-muted/50"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Phone</Label>
                              <Input
                                value={editData.phone}
                                onChange={(e) =>
                                  setEditData((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs">Status</Label>
                            <Select
                              value={editStatusValue}
                              onValueChange={(value) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  status: value as AdminLearner["status"],
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Email
                              </p>
                              <p className="font-medium">
                                {personalInfo.email || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Phone
                              </p>
                              <p className="font-medium">
                                {personalInfo.phone || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Enrolled Date
                              </p>
                              <p className="font-medium">
                                {formatDate(personalInfo.enrolled_at, true)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Access Expiry
                              </p>
                              <p className="font-medium">
                                {formatDate(
                                  personalInfo.access_expires_at,
                                  true,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {!isEditing && (
                    <Card>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Qualification
                            </p>
                            <p className="font-medium">
                              {personalInfo.qualification?.title || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Assigned Trainer
                            </p>
                            <p className="font-medium">
                              {personalInfo.assigned_trainer?.name ||
                                "Unassigned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Assigned IQA
                            </p>
                            <p className="font-medium">
                              {personalInfo.assigned_iqa?.name || "Unassigned"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <Progress
                            value={personalInfo.progress?.progress_percent || 0}
                            className="h-2 flex-1"
                          />
                          <span className="text-sm font-bold">
                            {personalInfo.progress?.progress_percent || 0}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {personalInfo.progress?.completed_units || 0} of{" "}
                          {personalInfo.progress?.total_units || 0} units
                          completed
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="unit_progress" className="mt-0 space-y-2 pr-3">
              {isFetching ? <LoadingState /> : null}
              {!isFetching && error ? <ErrorState /> : null}
              {!isFetching && !error && unitProgress.length === 0 ? (
                <EmptyState message="No unit progress found for this learner." />
              ) : null}
              {!isFetching && !error
                ? unitProgress.map((unit) => {
                    const isExpanded = expandedUnits.has(unit.unit_id);
                    const hasTimeline = unit.timeline.length > 0;

                    return (
                      <Card key={unit.unit_id}>
                        <CardContent className="p-0">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/30"
                            onClick={() => toggleUnit(unit.unit_id)}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {unit.unit_code ? `${unit.unit_code} - ` : ""}
                                {unit.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last activity:{" "}
                                {formatDate(unit.last_activity_at, true)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {unitStatusBadge(unit.status)}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="space-y-3 border-t border-border px-4 pb-3 pt-1">
                              {hasTimeline ? (
                                <div>
                                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Activity Timeline
                                  </p>
                                  <div className="relative space-y-3 pl-5">
                                    <div className="absolute bottom-1 left-[7px] top-1 w-px bg-border" />
                                    {unit.timeline.map((item, index) => (
                                      <div
                                        key={`${unit.unit_id}-${index}`}
                                        className="relative flex items-start gap-2.5"
                                      >
                                        <div className="absolute -left-5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background">
                                          {timelineIcon(item.type)}
                                        </div>
                                        <div>
                                          <p className="text-xs">
                                            {item.label}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">
                                            {formatDate(item.date, true)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No activity timeline available for this unit.
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                : null}
            </TabsContent>

            <TabsContent
              value="staff_assignment"
              className="mt-0 space-y-3 pr-3"
            >
              {isFetching ? <LoadingState /> : null}
              {!isFetching && error ? <ErrorState /> : null}
              {!isFetching && !error && staffAssignment ? (
                <>
                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <Users className="h-4 w-4" />
                        Current Assignment
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-md bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground">
                            Trainer
                          </p>
                          <p className="mt-1 font-medium">
                            {staffAssignment.current.trainer?.name ||
                              "Unassigned"}
                          </p>
                        </div>
                        <div className="rounded-md bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground">IQA</p>
                          <p className="mt-1 font-medium">
                            {staffAssignment.current.iqa?.name || "Unassigned"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <ShieldCheck className="h-4 w-4" />
                        Staff Management
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            Trainer Options
                          </p>
                          <StaffOptionCombobox
                            value={selectedTrainer}
                            onChange={setSelectedTrainer}
                            options={staffAssignment.options.trainers}
                            placeholder="Select trainer"
                            searchPlaceholder="Search trainers..."
                            emptyText="No trainer found."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            IQA Options
                          </p>
                          <StaffOptionCombobox
                            value={selectedIqa}
                            onChange={setSelectedIqa}
                            options={staffAssignment.options.iqas}
                            placeholder="Select IQA"
                            searchPlaceholder="Search IQAs..."
                            emptyText="No IQA found."
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Staff options are loaded from the enrolment action modal
                        API for this learner.
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="payment" className="mt-0 space-y-4 pr-3">
              {isFetching ? <LoadingState /> : null}
              {!isFetching && error ? <ErrorState /> : null}
              {!isFetching && !error && paymentInfo ? (
                <>
                  <Card>
                    <CardContent className="space-y-3 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-sm">
                          <p className="text-xs text-muted-foreground">
                            Payment Method
                          </p>
                          <p className="font-medium capitalize">
                            {formatLabel(paymentInfo.payment_method)}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-xs text-muted-foreground">
                            Payment Status
                          </p>
                          <div className="mt-0.5">
                            {paymentBadge(paymentInfo.payment_status)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        Payment History
                      </h4>

                      <div className="space-y-2 text-sm">
                        {paymentInfo.history.length === 0 ? (
                          <p className="text-muted-foreground">
                            No payment history available.
                          </p>
                        ) : (
                          paymentInfo.history.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
                            >
                              <div>
                                <p>{item.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(item.paid_at, true)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {formatCurrency(item.amount, item.currency)}
                                </span>
                                {paymentBadge(item.status)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LearnerDetailModal;
