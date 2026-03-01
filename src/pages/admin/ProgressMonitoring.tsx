import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminLearners } from "@/data/adminMockData";
import { Search, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TablePagination from "@/components/admin/TablePagination";

const ProgressMonitoring = () => {
  const [search, setSearch] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = adminLearners.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase());
    if (progressFilter === "at-risk") return matchesSearch && l.progress < 30;
    if (progressFilter === "on-track") return matchesSearch && l.progress >= 30 && l.progress < 80;
    if (progressFilter === "completing") return matchesSearch && l.progress >= 80;
    return matchesSearch;
  });

  const atRisk = adminLearners.filter(l => l.progress < 30 && l.status === "active").length;
  const onTrack = adminLearners.filter(l => l.progress >= 30 && l.progress < 80 && l.status === "active").length;
  const completing = adminLearners.filter(l => l.progress >= 80).length;
  const avgProgress = Math.round(adminLearners.reduce((sum, l) => sum + l.progress, 0) / adminLearners.length);

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Progress Monitoring</h1>
        <p className="text-sm text-muted-foreground">Track learner progress across all qualifications</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div><p className="text-xl font-bold">{avgProgress}%</p><p className="text-xs text-muted-foreground">Avg Progress</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div><p className="text-xl font-bold">{atRisk}</p><p className="text-xs text-muted-foreground">At Risk (&lt;30%)</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div><p className="text-xl font-bold">{onTrack}</p><p className="text-xs text-muted-foreground">On Track</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div><p className="text-xl font-bold">{completing}</p><p className="text-xs text-muted-foreground">Completing (≥80%)</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search learners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={progressFilter} onValueChange={setProgressFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Learners</SelectItem>
            <SelectItem value="at-risk">At Risk (&lt;30%)</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="completing">Completing (≥80%)</SelectItem>
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
                <TableHead>Risk</TableHead>
                <TableHead className="hidden md:table-cell">Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.learnerId}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm max-w-[180px] truncate">{l.qualification}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{l.assignedTrainer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={l.progress} className="flex-1 h-2" />
                      <span className="text-xs font-medium w-8">{l.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {l.progress < 30 ? (
                      <Badge variant="destructive" className="text-xs">At Risk</Badge>
                    ) : l.progress >= 80 ? (
                      <Badge className="text-xs">On Track</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Progressing</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{l.enrolledDate}</TableCell>
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
    </div>
  );
};

export default ProgressMonitoring;
