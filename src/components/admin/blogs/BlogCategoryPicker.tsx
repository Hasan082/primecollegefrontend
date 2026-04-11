import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BlogCategorySummary } from "@/redux/apis/blogs/blogApi";

interface BlogCategoryPickerProps {
  categories: BlogCategorySummary[];
  value: string;
  onChange: (value: string) => void;
  onCreateCategory: (name: string) => Promise<void>;
  isCreatingCategory: boolean;
}

const BlogCategoryPicker = ({
  categories,
  value,
  onChange,
  onCreateCategory,
  isCreatingCategory,
}: BlogCategoryPickerProps) => {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const selectedCategory = categories.find((category) => category.id === value);

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    try {
      await onCreateCategory(trimmedName);
      setNewCategoryName("");
      setCreateCategoryOpen(false);
    } catch {
      // Keep the popover open so the user can correct and retry.
    }
  };

  return (
    <div className="space-y-2">
      <Label>Category</Label>
      <div className="flex items-center gap-2">
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
              className="flex-1 justify-between font-normal"
            >
              <span className="truncate">
                {selectedCategory
                  ? `${selectedCategory.name} (${selectedCategory.blog_count})`
                  : "Select category"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandList className="max-h-64">
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={`${category.name} ${category.category_slug} ${category.blog_count}`}
                      onSelect={() => {
                        onChange(category.id);
                        setCategoryOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === category.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {category.name} ({category.blog_count})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Create category">
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-3" align="end">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Add Category</h4>
              <p className="text-xs text-muted-foreground">
                Create a new category without leaving this modal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-blog-category">Category Name</Label>
              <Input
                id="new-blog-category"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Enter category name"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCreateCategoryOpen(false);
                  setNewCategoryName("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
              >
                {isCreatingCategory ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default BlogCategoryPicker;
