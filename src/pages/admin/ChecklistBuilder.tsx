/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
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
import TablePagination from "@/components/admin/TablePagination";
import {
  useGetChecklistTemplatesQuery,
  useGetQualificationOptionsQuery,
} from "@/redux/apis/qualification/qualificationApi";
import {
  mapChecklistTemplateFromApi,
  type ChecklistApiTemplate,
} from "@/lib/checklists";
import CreateChecklistModal from "../../components/iqa/checkLists/CreateChecklistModal";
import EditChecklistModal from "../../components/iqa/checkLists/EditChecklistModal";
import ChecklistViewModal from "../../components/iqa/checkLists/ChecklistViewModal";

const ITEMS_PER_PAGE = 10;

const ChecklistBuilder = () => {
  const [qualFilter, setQualFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<any | null>(null);

  const { data: qualificationOptionsResponse } =
    useGetQualificationOptionsQuery(undefined);

  const {
    data: checklistTemplatesResponse,
    isLoading,
    isFetching,
  } = useGetChecklistTemplatesQuery({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    qualification_id: qualFilter === "all" ? undefined : qualFilter,
  });

  const qualificationOptions = qualificationOptionsResponse?.data || [];
  const templates = (
    (checklistTemplatesResponse?.data?.results as ChecklistApiTemplate[]) || []
  ).map(mapChecklistTemplateFromApi);
  const totalItems = checklistTemplatesResponse?.data?.count || 0;

  const getQualTitle = (template: any) =>
    template?.qualificationTitle ||
    qualificationOptions.find((q: any) => q.id === template?.qualificationId)
      ?.title ||
    "-";

  const getUnitLabel = (template: any) =>
    template?.unitTitle || "Qualification-level";

  const startEdit = (template: any) => {
    setEditingTemplate(template);
    setEditOpen(true);
  };

  const openView = (template: any) => {
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

      <Select
        value={qualFilter}
        onValueChange={(value) => {
          setQualFilter(value);
          setCurrentPage(1);
        }}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="All Qualifications" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Qualifications</SelectItem>
          {qualificationOptions.map((qualification: any) => (
            <SelectItem key={qualification.id} value={qualification.id}>
              {qualification.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading || isFetching ? (
        <Card className="p-8 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading checklists...</p>
        </Card>
      ) : templates.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No checklists found for the selected qualification.
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
                {templates.map((template: any) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.title}
                    </TableCell>

                    <TableCell className="max-w-[280px] truncate">
                      {template.qualificationTitle || "-"}
                    </TableCell>

                    <TableCell className="max-w-[260px] truncate">
                      {template.unitTitle}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>{template.items?.length || 0}</TableCell>

                    <TableCell>
                      {template.updatedDate}
                    </TableCell>

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

            <TablePagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      )}

      <CreateChecklistModal open={createOpen} onOpenChange={setCreateOpen} />

      <ChecklistViewModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        template={viewingTemplate}
        qualificationTitle={
          viewingTemplate ? getQualTitle(viewingTemplate) : ""
        }
        unitLabel={viewingTemplate ? getUnitLabel(viewingTemplate) : ""}
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
