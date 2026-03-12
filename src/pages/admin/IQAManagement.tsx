import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, Shield, Eye, Power } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminQualifications } from "@/data/adminMockData";
import TablePagination from "@/components/admin/TablePagination";

interface IQAUser {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  assignedQualifications: string[]; // qualification IDs
  createdDate: string;
}

const STORAGE_KEY = "admin_iqa_users";

const loadIQAs = (): IQAUser[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    {
      id: "iqa1",
      name: "Claire Morgan",
      email: "iqa@primecollege.edu",
      status: "active",
      assignedQualifications: ["q1", "q2", "q4"],
      createdDate: "01/09/2024",
    },
  ];
};

const saveIQAs = (iqas: IQAUser[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(iqas));
};

const ITEMS_PER_PAGE = 10;

const IQAManagement = () => {
  const [iqas, setIqas] = useState<IQAUser[]>(loadIQAs);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [selectedQual, setSelectedQual] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const filtered = iqas.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCreate = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast({ title: "Name and Email are required", variant: "destructive" });
      return;
    }
    const newIqa: IQAUser = {
      id: `iqa-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      status: "active",
      assignedQualifications: [],
      createdDate: new Date().toLocaleDateString("en-GB"),
    };
    const updated = [newIqa, ...iqas];
    setIqas(updated);
    saveIQAs(updated);
    setNewName("");
    setNewEmail("");
    setCreateOpen(false);
    toast({ title: "IQA account created" });
  };

  const toggleStatus = (id: string) => {
    const updated = iqas.map((i) =>
      i.id === id ? { ...i, status: (i.status === "active" ? "inactive" : "active") as IQAUser["status"] } : i
    );
    setIqas(updated);
    saveIQAs(updated);
    const iqa = updated.find((i) => i.id === id);
    toast({ title: `${iqa?.name} ${iqa?.status === "active" ? "activated" : "deactivated"}` });
  };

  const assignQualification = (iqaId: string) => {
    if (!selectedQual) return;
    const updated = iqas.map((i) => {
      if (i.id !== iqaId) return i;
      if (i.assignedQualifications.includes(selectedQual)) return i;
      return { ...i, assignedQualifications: [...i.assignedQualifications, selectedQual] };
    });
    setIqas(updated);
    saveIQAs(updated);
    setSelectedQual("");
    setAssignOpen(null);
    toast({ title: "Qualification assigned to IQA" });
  };

  const removeAssignment = (iqaId: string, qualId: string) => {
    const updated = iqas.map((i) =>
      i.id === iqaId ? { ...i, assignedQualifications: i.assignedQualifications.filter((q) => q !== qualId) } : i
    );
    setIqas(updated);
    saveIQAs(updated);
  };

  const getQualTitle = (id: string) => adminQualifications.find((q) => q.id === id)?.title || id;

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">IQA Management</h1>
          <p className="text-sm text-muted-foreground">Create IQA accounts and assign qualifications for quality assurance</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add IQA</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create IQA Account</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Claire Morgan" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="iqa@primecollege.edu" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search IQAs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4">
        {paginated.map((iqa) => (
          <Card key={iqa.id}>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{iqa.name}</h3>
                    <p className="text-sm text-muted-foreground">{iqa.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Created: {iqa.createdDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{iqa.assignedQualifications.length}</p>
                    <p className="text-xs text-muted-foreground">Qualifications</p>
                  </div>
                  <Badge variant={iqa.status === "active" ? "default" : "secondary"}>
                    {iqa.status.charAt(0).toUpperCase() + iqa.status.slice(1)}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleStatus(iqa.id)} title={iqa.status === "active" ? "Deactivate" : "Activate"}>
                    <Power className={`w-4 h-4 ${iqa.status === "active" ? "text-destructive" : "text-green-600"}`} />
                  </Button>
                </div>
              </div>

              {/* Assigned Qualifications */}
              <div className="mt-4 border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Qualifications</p>
                  <Dialog open={assignOpen === iqa.id} onOpenChange={(o) => setAssignOpen(o ? iqa.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" /> Assign</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Assign Qualification to {iqa.name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <Label>Qualification</Label>
                          <Select value={selectedQual} onValueChange={setSelectedQual}>
                            <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
                            <SelectContent>
                              {adminQualifications
                                .filter((q) => q.status === "active" && !iqa.assignedQualifications.includes(q.id))
                                .map((q) => (
                                  <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignOpen(null)}>Cancel</Button>
                        <Button onClick={() => assignQualification(iqa.id)}>Assign</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                {iqa.assignedQualifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No qualifications assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {iqa.assignedQualifications.map((qId) => (
                      <Badge key={qId} variant="outline" className="text-xs pr-1">
                        {getQualTitle(qId)}
                        <button className="ml-1.5 hover:text-destructive" onClick={() => removeAssignment(iqa.id, qId)}>
                          <span className="text-[10px]">✕</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default IQAManagement;
