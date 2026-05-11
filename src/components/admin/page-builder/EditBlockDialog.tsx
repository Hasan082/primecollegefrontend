import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BlockEditorForm from "./BlockEditorForm";
import { ContentBlock, TextAlignment, BlockStyle } from "@/types/pageBuilder";

interface EditBlockDialogProps {
  block: ContentBlock | null;
  open: boolean;
  isUploading: boolean;
  setIsUploading: (v: boolean) => void;
  onSave: (
    id: string,
    data: Record<string, unknown>,
    meta: { alignment?: TextAlignment; style?: BlockStyle; label?: string }
  ) => void;
  onClose: () => void;
  isGenericStaticPage?: boolean;
}

const EditBlockDialog = ({
  block,
  open,
  isUploading,
  setIsUploading,
  onSave,
  onClose,
  isGenericStaticPage,
}: EditBlockDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && isUploading) return;
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="pr-8 truncate">Edit: {block?.label}</DialogTitle>
        </DialogHeader>
        {block && (
          <BlockEditorForm
            block={block}
            onSave={(data, meta) => onSave(block.id, data, meta)}
            onClose={onClose}
            onUploadingChange={setIsUploading}
            isGenericStaticPage={isGenericStaticPage}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditBlockDialog;
