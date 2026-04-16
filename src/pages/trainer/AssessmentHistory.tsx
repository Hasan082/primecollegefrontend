import { useState } from "react";
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
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TablePagination from "@/components/admin/TablePagination";
import { useGetTrainerDashboardQuery } from "@/redux/apis/trainer/trainerReviewApi";
import { getSubmissionOutcomeLabel, getSubmissionTypeLabel } from "@/lib/iqaStatus";

const outcomeColors: Record<string, string> = {
  competent: "bg-green-600 text-white",
  resubmit: "bg-secondary text-secondary-foreground",
  not_competent: "bg-destructive text-destructive-foreground",
};

const ITEMS_PER_PAGE = 10;

const AssessmentHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError } = useGetTrainerDashboardQuery();

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading history...</div>;
  }

  if (isError || !data?.data) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load assessment history.</div>;
  }

  const records = data.data.recent_assessments;

  return (
    <div>
      <Link
        to="/trainer/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-1">Assessment History</h1>
      <p className="text-muted-foreground mb-8">View your past assessment decisions</p>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Assessed Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium text-primary">{record.learner.name}</TableCell>
                  <TableCell className="text-sm">
                    {record.unit.unit_code}: {record.unit.title}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {getSubmissionTypeLabel(record.submission_type)}
                  </TableCell>
                  <TableCell>
                    <Badge className={outcomeColors[record.status] || "bg-muted text-muted-foreground"}>
                      {getSubmissionOutcomeLabel(record.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {record.assessed_at ? new Date(record.assessed_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/trainer/record/${record.id}`}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalItems={records.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
};

export default AssessmentHistory;
