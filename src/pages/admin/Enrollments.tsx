import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TablePagination from "@/components/admin/TablePagination";
import { useGetRecentEnrolmentsQuery } from "@/redux/apis/adminDashboardApi";

const Enrollments = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset to first page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading } = useGetRecentEnrolmentsQuery({
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const paymentBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive"> = { 
      paid: "default", 
      pending: "secondary", 
      overdue: "destructive",
      failed: "destructive"
    };
    return <Badge variant={map[status.toLowerCase()] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = { 
      active: "default", 
      completed: "secondary", 
      withdrawn: "destructive",
      on_hold: "outline"
    };
    return <Badge variant={map[status.toLowerCase()] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const enrollments = response?.data?.results || [];
  const totalItems = response?.data?.count || 0;

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Enrollment Management</h1>
          <p className="text-sm text-muted-foreground">View and manage all learner enrollments</p>
        </div>
       
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by enrollment number or learner name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9" 
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enrollment #</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-12 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                ) : enrollments.length > 0 ? (
                  enrollments.map((env) => (
                    <TableRow key={env.id}>
                      <TableCell className="font-medium">{env.enrolment_number}</TableCell>
                      <TableCell>{env.learner_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={env.qualification_title}>
                        {env.qualification_title}
                      </TableCell>
                      <TableCell className="text-center">{statusBadge(env.status)}</TableCell>
                      <TableCell className="text-center">{paymentBadge(env.payment_status)}</TableCell>
                      <TableCell className="text-center">
                        {env.currency}{env.amount}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(env.enrolled_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No enrollments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={10} // Assuming backend default is 10
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Enrollments;
