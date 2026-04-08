import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "@/components/admin/TablePagination";
import { useGetEnrollmentAdminProgressQuery } from "@/redux/apis/enrolmentApi";
import { useDebounce } from "@/hooks/use-debounce";

const ProgressMonitoring = () => {
  const [search, setSearch] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const debouncedSearch = useDebounce(search, 500);

  const queryParams = {
    search: debouncedSearch?.trim() || undefined,
    risk_status: progressFilter === "all" ? undefined : progressFilter,
    page: currentPage,
    page_size: itemsPerPage,
  };

  const {
    data: progressApiData,
    isLoading,
    isFetching,
  } = useGetEnrollmentAdminProgressQuery(queryParams);

  const learners = progressApiData?.results || [];
  const summary = progressApiData?.summary;
  const totalItems = progressApiData?.count || 0;

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Progress Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Track learner progress across all qualifications
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xl font-bold">{summary?.avg_progress ?? 0}%</p>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-xl font-bold">{summary?.at_risk_count ?? 0}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xl font-bold">
                {summary?.on_track_count ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">On Track</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xl font-bold">
                {summary?.completing_count ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Completing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search learners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset page instantly
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={progressFilter}
          onValueChange={(value) => {
            setProgressFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Learners</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="progressing">Progressing</SelectItem>
            <SelectItem value="on_track">On Track</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
                <TableHead>Risk</TableHead>
                <TableHead className="hidden md:table-cell">Enrolled</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : learners.length > 0 ? (
                learners.map((l) => (
                  <TableRow key={l.enrolment_id}>
                    <TableCell>
                      <p className="font-medium text-sm">{l.learner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.enrolment_number}
                      </p>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm max-w-[180px] truncate">
                      {l.qualification.title}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm">
                      {l.trainer.name || "Unassigned"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress
                          value={l.progress.progress_percent}
                          className="flex-1 h-2"
                        />
                        <span className="text-xs font-medium w-8">
                          {l.progress.progress_percent}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {l.risk_status === "at_risk" ? (
                        <Badge variant="destructive" className="text-xs">
                          At Risk
                        </Badge>
                      ) : l.risk_status === "on_track" ? (
                        <Badge className="text-xs">On Track</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Progressing
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(l.enrolled_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No learners found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressMonitoring;
