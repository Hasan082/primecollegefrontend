import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { adminLearners, adminQualifications, adminTrainers } from "@/data/adminMockData";
import { Search, Plus, ArrowLeft, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const LearnerManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const filtered = adminLearners.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.learnerId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paymentBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive"> = { paid: "default", pending: "secondary", overdue: "destructive" };
    return <Badge variant={map[status] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learner Management</h1>
          <p className="text-sm text-muted-foreground">Enrol, manage, and monitor learners</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-1" /> Enrol Learner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Learner Enrolment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>First Name</Label><Input placeholder="John" /></div>
                <div className="space-y-1.5"><Label>Last Name</Label><Input placeholder="Smith" /></div>
              </div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="learner@example.com" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+44 7700 000000" /></div>
              <div className="space-y-1.5">
                <Label>Qualification</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
                  <SelectContent>
                    {adminQualifications.filter(q => q.status === "active").map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign Trainer</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select trainer" /></SelectTrigger>
                  <SelectContent>
                    {adminTrainers.filter(t => t.status === "active").map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual / Invoice</SelectItem>
                    <SelectItem value="employer">Employer Funded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => { setDialogOpen(false); toast({ title: "Learner enrolled (demo)" }); }}>
                Enrol Learner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search learners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
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
                <TableHead className="hidden md:table-cell">Qualification</TableHead>
                <TableHead className="hidden lg:table-cell">Trainer</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.learnerId} • {l.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{l.qualification}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{l.assignedTrainer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={l.progress} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground">{l.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{paymentBadge(l.paymentStatus)}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === "active" ? "default" : l.status === "completed" ? "secondary" : "destructive"}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnerManagement;
