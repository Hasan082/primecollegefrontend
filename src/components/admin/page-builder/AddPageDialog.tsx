import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPage: { title: string; slug: string; type: "static" | "qualification" | "blog-post" };
  setNewPage: React.Dispatch<React.SetStateAction<{ title: string; slug: string; type: "static" | "qualification" | "blog-post" }>>;
  onAdd: () => void;
}

const AddPageDialog = ({
  open,
  onOpenChange,
  newPage,
  setNewPage,
  onAdd,
}: AddPageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Page Title</Label>
            <Input
              value={newPage.title}
              onChange={(e) => setNewPage((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Our Team"
            />
          </div>
          <div>
            <Label>Custom Slug (Optional)</Label>
            <Input
              value={newPage.slug}
              onChange={(e) => setNewPage((p) => ({ ...p, slug: e.target.value }))}
              placeholder="e.g. our-team"
            />
          </div>
          
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onAdd}>Create Page</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPageDialog;
