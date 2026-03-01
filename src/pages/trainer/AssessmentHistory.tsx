import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { recentAssessments } from "@/data/trainerMockData";
import TablePagination from "@/components/admin/TablePagination";

const outcomeColors: Record<string, string> = {
  "Competent": "bg-green-600 text-white",
  "Resubmission Required": "bg-secondary text-secondary-foreground",
  "Not Yet Competent": "bg-destructive text-destructive-foreground",
};

const ITEMS_PER_PAGE = 10;

const AssessmentHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div>
      <Link to="/trainer/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
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
              <TableHead>Outcome</TableHead>
              <TableHead>Assessed Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAssessments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium text-primary">{a.learnerName}</TableCell>
                <TableCell className="text-sm">{a.unitCode}: {a.unitTitle}</TableCell>
                <TableCell>
                  <Badge className={outcomeColors[a.outcome]}>{a.outcome}</Badge>
                </TableCell>
                <TableCell className="text-sm">{a.assessedDate}</TableCell>
                <TableCell>
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link to={`/trainer/record/${a.id}`}>
                      <FileText className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination currentPage={currentPage} totalItems={recentAssessments.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
};

export default AssessmentHistory;
