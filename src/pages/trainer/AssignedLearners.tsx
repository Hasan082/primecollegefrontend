import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trainerLearners } from "@/data/trainerMockData";
import TablePagination from "@/components/admin/TablePagination";

const ITEMS_PER_PAGE = 10;

const AssignedLearners = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div>
      <Link to="/trainer/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-1">Assigned Learners</h1>
      <p className="text-muted-foreground mb-8">View all learners under your assessment</p>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainerLearners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium text-primary">{l.name}</TableCell>
                <TableCell className="text-sm">{l.learnerId}</TableCell>
                <TableCell>
                  <div className="text-sm">{l.qualification}</div>
                  <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">{l.qualificationCategory}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {l.unitsCompleted}/{l.totalUnits} ({l.progress}%)
                </TableCell>
                <TableCell>
                  {l.pendingSubmissions > 0 ? (
                    <Badge className="bg-secondary text-secondary-foreground text-xs">{l.pendingSubmissions}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link to={`/trainer/learner/${l.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination currentPage={currentPage} totalItems={trainerLearners.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
};

export default AssignedLearners;
