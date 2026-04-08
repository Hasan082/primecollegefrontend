import { useMemo, useState } from "react";
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
import {
  Search,
  Plus,
  Edit,
  Eye,
  Archive,
  ArrowLeft,
  ArchiveRestore,
  Settings2,
} from "lucide-react";
import { Link } from "react-router-dom";
import QualificationQuickView from "@/components/admin/QualificationQuickView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TablePagination from "@/components/admin/TablePagination";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useGetQualificationsAdminQuery } from "@/redux/apis/qualification/qualificationApi";
import { useUpdateQualificationMainMutation } from "@/redux/apis/qualification/qualificationMainApi";
import { cn, formatPrice } from "@/lib/utils";

type AdminQualificationRow = {
  id: string;
  title: string;
  qualification_code: string;
  level: string;
  category: string;
  current_price: string | null;
  currency: string;
  awarding_body: string;
  access_duration: string;
  total_units: number;
  is_cpd: boolean;
  active_enrolments_count: number;
  status: "active" | "draft" | "archived" | "inactive";
  created_at?: string;
};


const QualificationManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: qualificationsData } = useGetQualificationsAdminQuery({});
  const [updateQualification] = useUpdateQualificationMainMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const qualifications = useMemo<AdminQualificationRow[]>(
    () =>
      qualificationsData?.data?.results?.map((q) => ({
        id: q.id,
        title: q.title,
        qualification_code: q.qualification_code,
        level: q.level_detail?.name || q.level || "",
        category: q.category_detail?.name || q.category || "Uncategorised",
        current_price: q.current_price,
        currency: q.currency || "GBP",
        awarding_body: q.awarding_body_detail?.name || q.awarding_body || "Not set",
        access_duration: q.course_duration_text || "Not set",
        total_units: q.total_units || 0,
        active_enrolments_count: q.active_enrolments_count || 0,
        status: q.status,
        created_at: q.created_at,
        is_cpd: q.is_cpd,
      })) || [],
    [qualificationsData?.data?.results],
  );

  const filtered = qualifications.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.qualification_code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status color/style map
  const statusBadge = (status: AdminQualificationRow["status"]) => {
    const styles = {
      active: "bg-primary text-primary-foreground border-transparent",
      draft: "bg-amber-50 text-amber-700 border-amber-200",
      archived: "bg-slate-100 text-slate-600 border-slate-300",
      inactive: "bg-muted text-muted-foreground border-transparent",
    } as const;

    return (
      <Badge
        variant="outline"
        className={`capitalize px-2.5 py-0.5 text-[11px] font-bold shadow-sm ${styles[status] || styles.inactive}`}
      >
        {status}
      </Badge>
    );
  };

  const handleView = (id: string) => {
    setSelectedId(id);
    setViewOpen(true);
  };

  const handleArchiveToggle = async (q: AdminQualificationRow) => {
    try {
      const newStatus = q.status === "archived" ? "active" : "archived";
      await updateQualification({
        id: q.id,
        payload: { status: newStatus },
      }).unwrap();

      toast({
        title: "Success",
        description: `Qualification ${newStatus === "archived" ? "archived" : "restored"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update qualification status.",
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Qualification Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage qualifications and units
          </p>
        </div>

        <Link to="/admin/qualifications/create">
          <Button>
            <Plus className="w-4 h-4 mr-1" /> Add Qualification
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search qualifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Qualification</TableHead>
                <TableHead className="hidden md:table-cell">Code</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead>Learners</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{q.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.awarding_body} • {q.total_units} units • {q.is_cpd && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                              CPD Enabled
                            </Badge>
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {q.qualification_code}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{q.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {formatPrice(q.current_price, q.currency)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {q.active_enrolments_count}
                    </TableCell>
                    <TableCell>{statusBadge(q.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View"
                          onClick={() => handleView(q.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" title="Unit Config">
                          <Link to={`/admin/qualifications/${q.id}`}>
                            <Settings2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" title="Edit">
                          <Link to={`/admin/qualifications/${q.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={q.status === "archived" ? "Restore" : "Archive"}
                          onClick={() => handleArchiveToggle(q)}
                          className={`h-8 w-8 transition-colors ${q.status === "archived"
                            ? "bg-slate-50 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200"
                            : ""
                            } border`}
                        >
                          {q.status === "archived" ? (
                            <ArchiveRestore className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Archive className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Quick View Modal */}
      <QualificationQuickView
        qualificationId={selectedId}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
    </div>
  );
};

export default QualificationManagement;
