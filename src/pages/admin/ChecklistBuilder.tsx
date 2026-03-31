import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminQualifications } from "@/data/adminMockData";
import {
  useGetChecklistTemplatesQuery,
  useGetQualificationOptionsQuery,
} from "@/redux/apis/qualification/qualificationApi";
import {
  type CheckResponseType,
  type ChecklistTemplate,
  loadTemplates,
} from "@/lib/checklists";
import CreateChecklistModal from "../../components/iqa/checkLists/CreateChecklistModal";
import EditChecklistModal from "../../components/iqa/checkLists/EditChecklistModal";
import ChecklistViewModal from "../../components/iqa/checkLists/ChecklistViewModal";

type QualificationOption = {
  id: string;
  title: string;
};

type ChecklistRow = ChecklistTemplate & {
  unitId: string | null;
  isActive: boolean;
};

const normalizeResponseType = (responseType: string): CheckResponseType => {
  switch (responseType) {
    case "yes_no":
      return "yes-no";
    case "yes_no_na":
      return "yes-no-na";
    case "met_notmet_na":
      return "met-notmet-na";
    default:
      return "yes-no";
  }
};

const formatChecklistDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB");

const ChecklistBuilder = () => {
  const [templates, setTemplates] = useState<ChecklistRow[]>(
    loadTemplates().map((template) => ({
      ...template,
      unitId: template.unitCode,
      isActive: true,
    })),
  );
  const [qualFilter, setQualFilter] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistRow | null>(
    null,
  );

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<ChecklistRow | null>(
    null,
  );

  const { data: qualificationOptionsResponse } =
    useGetQualificationOptionsQuery(undefined);
  const { data: checklistTemplatesResponse } =
    useGetChecklistTemplatesQuery(undefined);

  const qualificationOptions: QualificationOption[] =
    qualificationOptionsResponse?.data?.length
      ? qualificationOptionsResponse.data
      : adminQualifications;

  useEffect(() => {
    const apiTemplates = checklistTemplatesResponse?.data?.results?.map(
      (template: {
        id: string;
        qualification_id: string;
        unit_id: string | null;
        title: string;
        is_active: boolean;
        items: Array<{
          id: string;
          label: string;
          response_type: string;
        }>;
        created_at: string;
        updated_at: string;
      }) => ({
        id: template.id,
        qualificationId: template.qualification_id,
        unitCode: template.unit_id,
        unitId: template.unit_id,
        isActive: template.is_active,
        title: template.title,
        items: template.items.map((item) => ({
          id: item.id,
          label: item.label,
          responseType: normalizeResponseType(item.response_type),
        })),
        createdDate: formatChecklistDate(template.created_at),
        updatedDate: formatChecklistDate(template.updated_at),
      }),
    );

    if (apiTemplates?.length) {
      setTemplates(apiTemplates);
    }
  }, [checklistTemplatesResponse]);

  const filtered = templates.filter(
    (template) =>
      qualFilter === "all" || template.qualificationId === qualFilter,
  );

  const getQualTitle = (qualificationId: string) =>
    qualificationOptions.find(
      (qualification) => qualification.id === qualificationId,
    )?.title || qualificationId;

  const getUnitLabel = (unitId: string | null) => {
    if (!unitId) return "Qualification-level";
    return unitId;
  };

  const startEdit = (template: ChecklistRow) => {
    setEditingTemplate(template);
    setEditOpen(true);
  };

  const openView = (template: ChecklistRow) => {
    setViewingTemplate(template);
    setViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6" /> IQA Verification Checklists
          </h1>
          <p className="text-sm text-muted-foreground">
            Build dynamic check-lists per qualification or per unit. IQAs use
            these when verifying learner work.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Create Checklist
        </Button>
      </div>

      <Select value={qualFilter} onValueChange={setQualFilter}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="All Qualifications" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Qualifications</SelectItem>
          {qualificationOptions.map((qualification) => (
            <SelectItem key={qualification.id} value={qualification.id}>
              {qualification.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No checklists created yet. Click "Create Checklist" to get started.
          </p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checks</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.title}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {getQualTitle(template.qualificationId)}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate">
                      {getUnitLabel(template.unitId)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.items.length}</TableCell>
                    <TableCell>{template.updatedDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => openView(template)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startEdit(template)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreateChecklistModal open={createOpen} onOpenChange={setCreateOpen} />

      <ChecklistViewModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        template={viewingTemplate}
        qualificationTitle={
          viewingTemplate ? getQualTitle(viewingTemplate.qualificationId) : ""
        }
        unitLabel={viewingTemplate ? getUnitLabel(viewingTemplate.unitId) : ""}
      />

      <EditChecklistModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingTemplate(null);
        }}
        template={editingTemplate}
      />
    </div>
  );
};

export default ChecklistBuilder;
