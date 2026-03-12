import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminQualifications as initialData, AdminQualification } from "@/data/adminMockData";
import { Search, Plus, Edit, Eye, Archive, ArrowLeft, ArchiveRestore, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TablePagination from "@/components/admin/TablePagination";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const emptyForm = {
  title: "", code: "", level: "", category: "", price: "", awardingBody: "", accessDuration: "",
};

const QualificationManagement = () => {
  const [qualifications, setQualifications] = useState<AdminQualification[]>([...initialData]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedQ, setSelectedQ] = useState<AdminQualification | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const filtered = qualifications.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: AdminQualification["status"]) => {
    const map = { active: "default", draft: "secondary", archived: "outline" } as const;
    return <Badge variant={map[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const handleCreate = () => {
    if (!form.title || !form.code) {
      toast({ title: "Please fill in Title and Code", variant: "destructive" });
      return;
    }
    const newQ: AdminQualification = {
      id: `q${Date.now()}`,
      title: form.title,
      code: form.code,
      level: form.level || "Level 3",
      category: form.category || "Business",
      awardingBody: form.awardingBody || "VTCT",
      status: "draft",
      price: Number(form.price) || 0,
      accessDuration: form.accessDuration || "12 months",
      totalUnits: 0,
      enrolledLearners: 0,
      createdDate: new Date().toLocaleDateString("en-GB"),
    };
    setQualifications(prev => [newQ, ...prev]);
    setForm(emptyForm);
    setCreateOpen(false);
    toast({ title: "Qualification created successfully" });
  };

  const handleView = (q: AdminQualification) => {
    setSelectedQ(q);
    setViewOpen(true);
  };

  const handleEditOpen = (q: AdminQualification) => {
    setSelectedQ(q);
    setEditForm({
      title: q.title,
      code: q.code,
      level: q.level,
      category: q.category,
      price: String(q.price),
      awardingBody: q.awardingBody,
      accessDuration: q.accessDuration,
    });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!selectedQ || !editForm.title || !editForm.code) {
      toast({ title: "Please fill in Title and Code", variant: "destructive" });
      return;
    }
    setQualifications(prev =>
      prev.map(q =>
        q.id === selectedQ.id
          ? {
              ...q,
              title: editForm.title,
              code: editForm.code,
              level: editForm.level || q.level,
              category: editForm.category || q.category,
              price: Number(editForm.price) || q.price,
              awardingBody: editForm.awardingBody || q.awardingBody,
              accessDuration: editForm.accessDuration || q.accessDuration,
            }
          : q
      )
    );
    setEditOpen(false);
    toast({ title: "Qualification updated successfully" });
  };

  const handleArchiveToggle = (q: AdminQualification) => {
    const newStatus = q.status === "archived" ? "active" : "archived";
    setQualifications(prev =>
      prev.map(item => item.id === q.id ? { ...item, status: newStatus as AdminQualification["status"] } : item)
    );
    toast({ title: `${q.title} ${newStatus === "archived" ? "archived" : "restored"}` });
  };

  const FormFields = ({ data, setData }: { data: typeof emptyForm; setData: (d: typeof emptyForm) => void }) => (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="e.g. Level 3 Diploma in Business Administration" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Code *</Label>
          <Input value={data.code} onChange={e => setData({ ...data, code: e.target.value })} placeholder="e.g. BUS-L3-DIP" />
        </div>
        <div className="space-y-1.5">
          <Label>Level</Label>
          <Select value={data.level} onValueChange={v => setData({ ...data, level: v })}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={data.category} onValueChange={v => setData({ ...data, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["Business", "Care", "Management", "First Aid"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Price (£)</Label>
          <Input type="number" value={data.price} onChange={e => setData({ ...data, price: e.target.value })} placeholder="0" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Awarding Body</Label>
          <Input value={data.awardingBody} onChange={e => setData({ ...data, awardingBody: e.target.value })} placeholder="e.g. VTCT" />
        </div>
        <div className="space-y-1.5">
          <Label>Access Duration</Label>
          <Select value={data.accessDuration} onValueChange={v => setData({ ...data, accessDuration: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {["3 months", "6 months", "12 months", "18 months", "24 months"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Qualification Management</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and manage qualifications and units</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add Qualification</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Qualification</DialogTitle>
            </DialogHeader>
            <FormFields data={form} setData={setForm} />
            <DialogFooter>
              <Button className="w-full" onClick={handleCreate}>Create Qualification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search qualifications..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Qualification</TableHead>
                <TableHead className="hidden md:table-cell">Code</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead>Learners</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.awardingBody} • {q.totalUnits} units</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{q.code}</TableCell>
                  <TableCell className="hidden lg:table-cell"><Badge variant="outline">{q.category}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-sm">£{q.price.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{q.enrolledLearners}</TableCell>
                  <TableCell>{statusBadge(q.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="View" onClick={() => handleView(q)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditOpen(q)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" title={q.status === "archived" ? "Restore" : "Archive"} onClick={() => handleArchiveToggle(q)}>
                        {q.status === "archived" ? <ArchiveRestore className="w-4 h-4 text-green-600" /> : <Archive className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
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

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qualification Details</DialogTitle>
          </DialogHeader>
          {selectedQ && (
            <div className="space-y-3 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="font-medium">{selectedQ.title}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Code</p>
                  <p className="text-sm font-medium">{selectedQ.code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="text-sm font-medium">{selectedQ.level}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{selectedQ.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Awarding Body</p>
                  <p className="text-sm font-medium">{selectedQ.awardingBody}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-sm font-medium">£{selectedQ.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Access Duration</p>
                  <p className="text-sm font-medium">{selectedQ.accessDuration}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Units</p>
                  <p className="text-sm font-medium">{selectedQ.totalUnits}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enrolled Learners</p>
                  <p className="text-sm font-medium">{selectedQ.enrolledLearners}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {statusBadge(selectedQ.status)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{selectedQ.createdDate}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Qualification</DialogTitle>
          </DialogHeader>
          <FormFields data={editForm} setData={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualificationManagement;
