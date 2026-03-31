import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const ITEMS_PER_PAGE = 10;
const STATIC_PROGRESS_TEXT = "3/10 (30%)";
const STATIC_QUALIFICATION_TYPE = "General";

const AssignedLearners = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: enrolmentsResponse,
    isLoading,
    error,
  } = useGetTrainerEnrolmentsQuery();

  const learners = enrolmentsResponse?.data ?? [];
  const paginatedLearners = learners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLearners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No assigned learners found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLearners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell>
                    <div className="font-medium text-primary">
                      {learner.learner.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {learner.learner.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {learner.enrolment_number}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{learner.qualification.title}</div>
                    <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">
                      {learner.qualification.is_cpd ? "CPD" : STATIC_QUALIFICATION_TYPE}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {/* TODO: we will implement real learner progress data later */}
                    {STATIC_PROGRESS_TEXT}
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
          totalItems={learners.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
};

export default AssignedLearners;
