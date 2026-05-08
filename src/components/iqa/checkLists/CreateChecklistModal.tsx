import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateChecklistTemplateMutation,
  useGetQualificationOptionsQuery,
  useGetUnitOptionsByQualificationQuery,
} from "@/redux/apis/qualification/qualificationApi";
import {
  type AdminChecklistTemplate,
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

type CreateChecklistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  duplicateFrom?: AdminChecklistTemplate | null;
};

const CreateChecklistModal = ({
  open,
  onOpenChange,
  onSuccess,
  duplicateFrom,
}: CreateChecklistModalProps) => {
  const { toast } = useToast();
  const [qualificationId, setQualificationId] = useState("");
  const [unitId, setUnitId] = useState("__qual__");
  const [status, setStatus] = useState("active");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [itemLabel, setItemLabel] = useState("");
  const [itemType, setItemType] = useState<CheckResponseType>("yes-no");
  const [errors, setErrors] = useState<FormErrors>({});

  const [createChecklistTemplate, { isLoading }] =
    useCreateChecklistTemplateMutation();
  const { data: qualificationOptionsResponse } =
    useGetQualificationOptionsQuery(undefined);
  const { data: unitOptionsResponse } =
    useGetUnitOptionsByQualificationQuery(qualificationId, {
      skip: !qualificationId,
    });

  const qualificationOptions = qualificationOptionsResponse?.data ?? [];
  const unitOptions = unitOptionsResponse?.data ?? [];

  const resetForm = () => {
    setQualificationId("");
    setUnitId("__qual__");
    setStatus("active");
    setTitle("");
    setItems([]);
    setItemLabel("");
    setItemType("yes-no");
    setErrors({});
  };

  useEffect(() => {
    if (open && duplicateFrom) {
      setQualificationId(duplicateFrom.qualificationId);
      setUnitId(duplicateFrom.unitId ?? "__qual__");
      setStatus(duplicateFrom.isActive ? "active" : "inactive");
      setTitle(`${duplicateFrom.title} (Copy)`);
      setItems(
        duplicateFrom.items.map((item, index) => ({
          id: `ci-${Date.now()}-${index}`,
          label: item.label,
          responseType: item.responseType,
        })),
      );
      setErrors({});
    }
  }, [open, duplicateFrom]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!qualificationId) nextErrors.qualification = "Qualification is required";
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
    if (!validateForm()) return;

    try {
      await createChecklistTemplate({
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
      toast({ title: "Checklist created" });
      onSuccess?.();
    } catch {
      toast({
        title: "Failed to create checklist",
        variant: "destructive",
      });
    }
  };

  return (
    <ChecklistFormModal
      mode="create"
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

export default CreateChecklistModal;
