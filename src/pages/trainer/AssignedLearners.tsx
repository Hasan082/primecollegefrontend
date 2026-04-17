import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ArrowLeft, AlertTriangle, Loader2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/admin/TablePagination";
import { useGetTrainerEnrolmentsQuery } from "@/redux/apis/trainer/assignedLearnersApi";
import { useDebounce } from "@/hooks/use-debounce";

const ITEMS_PER_PAGE = 10;

const AssignedLearners = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = {
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch.trim() || undefined,
  };

  const {
    data: enrolmentsResponse,
    isLoading,
    isFetching,
    error,
  } = useGetTrainerEnrolmentsQuery(queryParams);

  const data = enrolmentsResponse?.data;
  const learners = data?.results || [];
  const totalItems = data?.count || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading assigned learners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20 max-w-2xl mx-auto">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-bold text-destructive mb-2">
          Failed to load assigned learners
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          There was an error connecting to the server. Please check your
          connection and try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/trainer/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-1">
        Assigned Learners
      </h1>
      <p className="text-muted-foreground mb-8">
        View all learners under your assessment
      </p>

      <div className="mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner Name</TableHead>
              <TableHead>Learner ID</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : learners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  No assigned learners found.
                </TableCell>
              </TableRow>
            ) : (
              learners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell>
                    <div className="font-medium text-primary">
                      {learner.learner.name}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">
                    {learner.learner.learner_id}
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{learner.qualification.title}</div>
                    <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">
                      {learner.qualification.category}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm">
                    {learner.progress.completed_units}/
                    {learner.progress.total_units} (
                    {learner.progress.progress_percent}%)
                  </TableCell>

                  <TableCell className="text-sm">
                    {learner.pending_count > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        {learner.pending_count}
                      </Badge>
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell>
                    {learner?.learner?.email}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link to={`/trainer/learner/${learner.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
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
      </Card>
    </div>
  );
};

export default AssignedLearners;
