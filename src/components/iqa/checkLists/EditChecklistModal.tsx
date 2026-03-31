import { useEffect, useState } from "react";
import { adminQualifications } from "@/data/adminMockData";
import { useToast } from "@/hooks/use-toast";
import {
  useGetQualificationOptionsQuery,
  useGetUnitOptionsByQualificationQuery,
  useUpdateChecklistTemplateMutation,
} from "@/redux/apis/qualification/qualificationApi";
import {
  type CheckResponseType,
  type ChecklistItem,
} from "@/lib/checklists";
import ChecklistFormModal from "./ChecklistFormModal";

type FormErrors = {
  qualification?: string;
  unit?: string;
  title?: string;
  items?: string;
};

type ChecklistRow = {
  id: string;
  qualificationId: string;
  unitId: string | null;
  isActive: boolean;
  title: string;
  items: ChecklistItem[];
};

const serializeResponseType = (responseType: CheckResponseType) => {
  switch (responseType) {
    case "yes-no":
      return "yes_no";
    case "yes-no-na":
      return "yes_no_na";
    case "met-notmet-na":
      return "met_notmet_na";
    default:
      return "yes_no";
  }
};

type EditChecklistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ChecklistRow | null;
  onSuccess?: () => void;
};

const EditChecklistModal = ({
  open,
  onOpenChange,
  template,
  onSuccess,
}: EditChecklistModalProps) => {
  const { toast } = useToast();
  const [qualificationId, setQualificationId] = useState("");
  const [unitId, setUnitId] = useState("__qual__");
  const [status, setStatus] = useState("active");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [itemLabel, setItemLabel] = useState("");
  const [itemType, setItemType] = useState<CheckResponseType>("yes-no");
  const [errors, setErrors] = useState<FormErrors>({});

  const [updateChecklistTemplate, { isLoading }] =
    useUpdateChecklistTemplateMutation();
  const { data: qualificationOptionsResponse } =
    useGetQualificationOptionsQuery(undefined);
  const { data: unitOptionsResponse } =
    useGetUnitOptionsByQualificationQuery(qualificationId, {
      skip: !qualificationId,
    });

  useEffect(() => {
    if (!template || !open) return;

    setQualificationId(template.qualificationId);
    setUnitId(template.unitId ?? "__qual__");
    setStatus(template.isActive ? "active" : "inactive");
    setTitle(template.title);
    setItems(template.items);
    setItemLabel("");
    setItemType("yes-no");
    setErrors({});
  }, [template, open]);

  const qualificationOptions = qualificationOptionsResponse?.data?.length
    ? qualificationOptionsResponse.data
    : adminQualifications;

  const getMockUnits = (qualificationValue: string) =>
    adminQualifications.find(
      (qualification) => qualification.id === qualificationValue,
    )?.units || [];

  const unitOptions = unitOptionsResponse?.data?.length
    ? unitOptionsResponse.data
    : getMockUnits(qualificationId);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setErrors({});
      setItemLabel("");
      setItemType("yes-no");
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!qualificationId) nextErrors.qualification = "Qualification is required";
    if (!unitId || unitId === "__qual__") nextErrors.unit = "Unit is required";
    if (!title.trim()) nextErrors.title = "Title is required";
    if (items.length === 0) nextErrors.items = "At least one item is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const addItem = () => {
    if (!itemLabel.trim()) return;

    setItems((prev) => [
      ...prev,
      {
        id: `ci-${Date.now()}`,
        label: itemLabel.trim(),
        responseType: itemType,
      },
    ]);
    setItemLabel("");
    setErrors((prev) => ({ ...prev, items: undefined }));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!template || !validateForm()) return;

    try {
      await updateChecklistTemplate({
        id: template.id,
        qualification_id: qualificationId,
        unit_id: unitId === "__qual__" ? null : unitId,
        title: title.trim(),
        is_active: status === "active",
        items: items.map((item, index) => ({
          label: item.label,
          response_type: serializeResponseType(item.responseType),
          order: index + 1,
        })),
      }).unwrap();

      handleOpenChange(false);
      toast({ title: "Checklist updated" });
      onSuccess?.();
    } catch {
      toast({
        title: "Failed to update checklist",
        variant: "destructive",
      });
    }
  };

  return (
    <ChecklistFormModal
      mode="edit"
      open={open}
      onOpenChange={handleOpenChange}
      qualificationId={qualificationId}
      unitId={unitId}
      status={status}
      title={title}
      items={items}
      itemLabel={itemLabel}
      itemType={itemType}
      qualificationOptions={qualificationOptions}
      unitOptions={unitOptions}
      errors={errors}
      isSubmitting={isLoading}
      onQualificationChange={(value) => {
        setQualificationId(value);
        setUnitId("__qual__");
        setErrors((prev) => ({
          ...prev,
          qualification: undefined,
          unit: undefined,
        }));
      }}
      onUnitChange={(value) => {
        setUnitId(value);
        setErrors((prev) => ({ ...prev, unit: undefined }));
      }}
      onStatusChange={setStatus}
      onTitleChange={(value) => {
        setTitle(value);
        setErrors((prev) => ({ ...prev, title: undefined }));
      }}
      onItemLabelChange={setItemLabel}
      onItemTypeChange={setItemType}
      onAddItem={addItem}
      onRemoveItem={removeItem}
      onSubmit={handleSubmit}
    />
  );
};

export default EditChecklistModal;
