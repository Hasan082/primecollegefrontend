/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, ArrowLeft, UserPlus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "@/components/admin/TablePagination";
import LearnerDetailModal from "@/components/admin/LearnerDetailModal";
import { type AdminLearner } from "@/data/adminMockData";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetEnrolledLearnersQuery } from "@/redux/apis/admin/learnerManagementApi";
import { useGetQualificationOnlyListQuery } from "@/redux/apis/qualification/qualificationApi";
import { useCreateOfficeAdmissionMutation } from "@/redux/apis/orderApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;
type QualificationSessionDateOption = {
  id: string;
  label: string;
};

type QualificationSessionLocationOption = {
  id: string;
  name: string;
  dates: QualificationSessionDateOption[];
};

type QualificationOnlyOption = {
  id: string;
  name: string;
  slug: string;
  is_session: boolean;
  session_locations: QualificationSessionLocationOption[];
};

type EnrolLearnerFormState = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  qualification_id: string;
  location_id: string;
  qualification_session_id: string;
  payment_method: "bank_transfer" | "cash" | "invoice" | "employer" | "";
  amount_received: string;
};

const LearnerManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [enrolForm, setEnrolForm] = useState<EnrolLearnerFormState>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    qualification_id: "",
    location_id: "",
    qualification_session_id: "",
    payment_method: "",
    amount_received: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedLearner, setSelectedLearner] = useState<AdminLearner | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast()

  const debouncedSearch = useDebounce(search, 500);

  const queryParams = {
    search: debouncedSearch?.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  };

  const {
    data: enrolledLearnersResponse,
    isLoading,
    isFetching,
    error,
  } = useGetEnrolledLearnersQuery(queryParams);
  const { data: qualificationOnlyResponse } =
    useGetQualificationOnlyListQuery(undefined);
  const [createOfficeAdmission, { isLoading: isSubmittingAdmission }] =
    useCreateOfficeAdmissionMutation();

  const learners = enrolledLearnersResponse?.data?.results || [];
  const totalItems = enrolledLearnersResponse?.data?.count || 0;
  const qualificationOptions: QualificationOnlyOption[] = Array.isArray(
    qualificationOnlyResponse,
  )
    ? qualificationOnlyResponse
    : qualificationOnlyResponse?.data || [];
  const selectedQualification = qualificationOptions.find(
    (qualification) => qualification.id === enrolForm.qualification_id,
  );
  const selectedLocation = selectedQualification?.session_locations.find(
    (location) => location.id === enrolForm.location_id,
  );
  const isSessionQualification = Boolean(selectedQualification?.is_session);
  const hasBookableSessions = Boolean(
    selectedQualification?.session_locations?.some((location) => location.dates.length > 0),
  );

  const handleLearnerUpdate = (updated: AdminLearner) => {
    setSelectedLearner(updated);
  };

  const resetEnrolForm = () => {
    setEnrolForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone: "",
      qualification_id: "",
      location_id: "",
      qualification_session_id: "",
      payment_method: "",
      amount_received: "",
    });
    setFormErrors({});
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetEnrolForm();
    }
  };

  const updateEnrolForm = (
    field: keyof EnrolLearnerFormState,
    value: string,
  ) => {
    setEnrolForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateEnrolForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!enrolForm.first_name.trim()) {
      nextErrors.first_name = "First name is required";
    }
    if (!enrolForm.last_name.trim()) {
      nextErrors.last_name = "Last name is required";
    }
    if (!enrolForm.email.trim()) {
      nextErrors.email = "Email is required";
    }
    if (!enrolForm.qualification_id) {
      nextErrors.qualification_id = "Qualification is required";
    }
    if (isSessionQualification && !hasBookableSessions) {
      nextErrors.qualification_id = "No upcoming session dates are available for this qualification";
    }
    if (isSessionQualification && hasBookableSessions && !enrolForm.location_id) {
      nextErrors.location_id = "Location is required";
    }
    if (
      isSessionQualification &&
      hasBookableSessions &&
      !enrolForm.qualification_session_id
    ) {
      nextErrors.qualification_session_id = "Date is required";
    }
    if (!enrolForm.payment_method) {
      nextErrors.payment_method = "Payment method is required";
    }
    if (!enrolForm.amount_received.trim()) {
      nextErrors.amount_received = "Amount received is required";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleEnrolLearner = async () => {
    if (!validateEnrolForm()) {
      return;
    }

    try {
      await createOfficeAdmission({
        first_name: enrolForm.first_name.trim(),
        middle_name: enrolForm.middle_name.trim(),
        last_name: enrolForm.last_name.trim(),
        email: enrolForm.email.trim(),
        phone: enrolForm.phone.trim(),
        items: [
          {
            qualification_id: enrolForm.qualification_id,
            qualification_session_id:
              enrolForm.qualification_session_id || null,
          },
        ],
        payment_method: enrolForm.payment_method as
          | "bank_transfer"
          | "cash"
          | "invoice"
          | "employer",
        amount_received: enrolForm.amount_received.trim(),
      }).unwrap();

      handleDialogOpenChange(false);
      toast({ title: "Learner enrolled successfully" });
    } catch (submissionError: any) {
      toast({
        title: "Failed to enrol learner",
        description:
          submissionError?.data?.detail ||
          submissionError?.data?.message ||
          "Please check the form and try again.",
        variant: "destructive",
      });
    }
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
      <Badge variant={map[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const statusBadge = (status: string) => {
    const variant =
      status === "active"
        ? "default"
        : status === "completed"
          ? "secondary"
          : "destructive";

    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const mapLearnerForModal = (l: any): AdminLearner =>
    ({
      id: l.id,
      learnerUserId: l.learner?.id,
      name: l.learner.name,
      learnerId: l.learner.learner_id,
      email: l.learner.email,
      phone: l.learner.phone || "",
      qualification: l.qualification.title,
      qualificationId: l.qualification.id,
      assignedTrainer: l.trainer?.name || "Unassigned",
      enrolledDate: l.enrolled_at || "",
      paymentMethod: l.payment.method || "manual",
      progress: l.progress.progress_percent,
      paymentStatus: l.payment.status,
      status: l.status,
      accessExpiry: l.access_expires_at || "",
    }) as AdminLearner;

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-destructive font-medium mb-2">
              Failed to load learners
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading enrolled learners.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learner Management</h1>
          <p className="text-sm text-muted-foreground">
            Enrol, manage, and monitor learners
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-1" /> Enrol Learner
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Learner Enrolment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    placeholder="John"
                    value={enrolForm.first_name}
                    onChange={(e) => updateEnrolForm("first_name", e.target.value)}
                  />
                  {formErrors.first_name ? (
                    <p className="text-xs text-destructive">
                      {formErrors.first_name}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label>Middle Name</Label>
                  <Input
                    placeholder="Michael"
                    value={enrolForm.middle_name}
                    onChange={(e) => updateEnrolForm("middle_name", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  placeholder="Smith"
                  value={enrolForm.last_name}
                  onChange={(e) => updateEnrolForm("last_name", e.target.value)}
                />
                {formErrors.last_name ? (
                  <p className="text-xs text-destructive">
                    {formErrors.last_name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="learner@example.com"
                  value={enrolForm.email}
                  onChange={(e) => updateEnrolForm("email", e.target.value)}
                />
                {formErrors.email ? (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  placeholder="+44 7700 000000"
                  value={enrolForm.phone}
                  onChange={(e) => updateEnrolForm("phone", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Qualification</Label>
                <Select
                  value={enrolForm.qualification_id}
                  onValueChange={(value) => {
                    setEnrolForm((prev) => ({
                      ...prev,
                      qualification_id: value,
                      location_id: "",
                      qualification_session_id: "",
                    }));
                    setFormErrors((prev) => ({
                      ...prev,
                      qualification_id: "",
                      location_id: "",
                      qualification_session_id: "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualificationOptions.map((qualification) => (
                      <SelectItem
                        key={qualification.id}
                        value={qualification.id}
                      >
                        {qualification.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.qualification_id ? (
                  <p className="text-xs text-destructive">
                    {formErrors.qualification_id}
                  </p>
                ) : null}
              </div>

              {isSessionQualification && !hasBookableSessions ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  No upcoming session dates are available for this qualification.
                </div>
              ) : null}

              {isSessionQualification && hasBookableSessions ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Select
                      value={enrolForm.location_id}
                      onValueChange={(value) => {
                        setEnrolForm((prev) => ({
                          ...prev,
                          location_id: value,
                          qualification_session_id: "",
                        }));
                        setFormErrors((prev) => ({
                          ...prev,
                          location_id: "",
                          qualification_session_id: "",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedQualification?.session_locations.map(
                          (location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.location_id ? (
                      <p className="text-xs text-destructive">
                        {formErrors.location_id}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Select
                      value={enrolForm.qualification_session_id}
                      onValueChange={(value) =>
                        updateEnrolForm("qualification_session_id", value)
                      }
                      disabled={!selectedLocation}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedLocation?.dates.map((dateOption) => (
                          <SelectItem
                            key={dateOption.id}
                            value={dateOption.id}
                          >
                            {dateOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.qualification_session_id ? (
                      <p className="text-xs text-destructive">
                        {formErrors.qualification_session_id}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null}

              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select
                  value={enrolForm.payment_method}
                  onValueChange={(value) =>
                    updateEnrolForm("payment_method", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="employer">Employer Funded</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.payment_method ? (
                  <p className="text-xs text-destructive">
                    {formErrors.payment_method}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>Amount Received</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={enrolForm.amount_received}
                  onChange={(e) =>
                    updateEnrolForm("amount_received", e.target.value)
                  }
                />
                {formErrors.amount_received ? (
                  <p className="text-xs text-destructive">
                    {formErrors.amount_received}
                  </p>
                ) : null}
              </div>

              <Button
                className="w-full"
                disabled={
                  isSubmittingAdmission || (isSessionQualification && !hasBookableSessions)
                }
                onClick={handleEnrolLearner}
              >
                {isSubmittingAdmission ? "Enrolling..." : "Enrol Learner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search learners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead className="hidden md:table-cell">
                  Qualification
                </TableHead>
                <TableHead className="hidden lg:table-cell">Trainer</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading learners...
                  </TableCell>
                </TableRow>
              ) : learners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No learners found.
                  </TableCell>
                </TableRow>
              ) : (
                learners.map((l: any) => (
                  <TableRow
                    key={l.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedLearner(mapLearnerForModal(l));
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{l.learner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.learner.learner_id} • {l.learner.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">
                      {l.qualification.title}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm">
                      {l.trainer?.name || "Unassigned"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={l.progress.progress_percent}
                          className="w-16 h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {l.progress.progress_percent}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {paymentBadge(l.payment.status)}
                    </TableCell>

                    <TableCell>{statusBadge(l.status)}</TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLearner(mapLearnerForModal(l));
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <LearnerDetailModal
        learner={selectedLearner}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={handleLearnerUpdate}
      />
    </div>
  );
};

export default LearnerManagement;
