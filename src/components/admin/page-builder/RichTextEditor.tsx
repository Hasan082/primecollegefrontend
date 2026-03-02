import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table/row";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Minus,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  TableIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const BRAND_COLORS = [
  { label: "Primary", value: "#043868" },
  { label: "Secondary", value: "#eec21e" },
  { label: "Dark", value: "#1a1a1a" },
  { label: "Grey", value: "#6b7280" },
  { label: "White", value: "#ffffff" },
  { label: "Red", value: "#dc2626" },
  { label: "Green", value: "#16a34a" },
];

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [colorOpen, setColorOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const customColorRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: "tiptap-table" },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[120px] p-3 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_p]:my-1 [&_hr]:my-3 [&_.tiptap-table]:w-full [&_.tiptap-table]:border-collapse [&_.tiptap-table_td]:border [&_.tiptap-table_td]:border-border [&_.tiptap-table_td]:p-2 [&_.tiptap-table_td]:text-sm [&_.tiptap-table_th]:border [&_.tiptap-table_th]:border-border [&_.tiptap-table_th]:p-2 [&_.tiptap-table_th]:text-sm [&_.tiptap-table_th]:bg-muted [&_.tiptap-table_th]:font-semibold",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setColorOpen(false);
  };

  const unsetColor = () => {
    editor.chain().focus().unsetColor().run();
    setColorOpen(false);
  };

  const currentColor = editor.getAttributes("textStyle").color || null;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), label: "Bold" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), label: "Italic" },
    { type: "separator" as const },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), label: "H2" },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), label: "H3" },
    { icon: Pilcrow, action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive("paragraph"), label: "Paragraph" },
    { type: "separator" as const },
    { icon: AlignLeft, action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }), label: "Align Left" },
    { icon: AlignCenter, action: () => editor.chain().focus().setTextAlign("center").run(), active: editor.isActive({ textAlign: "center" }), label: "Align Center" },
    { icon: AlignRight, action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }), label: "Align Right" },
    { type: "separator" as const },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), label: "Bullet List" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), label: "Ordered List" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), label: "Quote" },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, label: "Divider" },
    { type: "separator" as const },
    { type: "color" as const },
    { type: "table" as const },
    { type: "separator" as const },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false, label: "Undo" },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false, label: "Redo" },
  ];

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5 bg-muted/30 rounded-t-md">
        {tools.map((tool, i) => {
          if ("type" in tool && tool.type === "separator") {
            return <div key={i} className="w-px h-5 bg-border mx-1" />;
          }

          if ("type" in tool && tool.type === "color") {
            return (
              <Popover key={i} open={colorOpen} onOpenChange={setColorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 relative"
                    title="Text Color"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    {currentColor && (
                      <div
                        className="absolute bottom-0.5 left-1 right-1 h-0.5 rounded-full"
                        style={{ backgroundColor: currentColor }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Text Color</p>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {BRAND_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-md border-2 transition-all hover:scale-110",
                          currentColor === c.value ? "border-primary ring-1 ring-primary" : "border-border"
                        )}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setColor(c.value)}
                        title={c.label}
                      />
                    ))}
                    <button
                      type="button"
                      className="w-8 h-8 rounded-md border-2 border-border flex items-center justify-center hover:scale-110 transition-all overflow-hidden relative"
                      onClick={() => customColorRef.current?.click()}
                      title="Custom Color"
                    >
                      <span className="text-[9px] font-bold text-muted-foreground">+</span>
                      <input
                        ref={customColorRef}
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={unsetColor}
                  >
                    Remove Color
                  </Button>
                </PopoverContent>
              </Popover>
            );
          }

          if ("type" in tool && tool.type === "table") {
            return (
              <Popover key={i} open={tableOpen} onOpenChange={setTableOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn("h-7 w-7 p-0", editor.isActive("table") && "bg-primary/10 text-primary")}
                    title="Table"
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-2" align="start">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Table</p>
                  <div className="space-y-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-7 text-xs"
                      onClick={() => {
                        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                        setTableOpen(false);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1.5" /> Insert 3×3 Table
                    </Button>
                    {editor.isActive("table") && (
                      <>
                        <Button type="button" variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableOpen(false); }}>
                          Add Column
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => { editor.chain().focus().addRowAfter().run(); setTableOpen(false); }}>
                          Add Row
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => { editor.chain().focus().deleteColumn().run(); setTableOpen(false); }}>
                          Delete Column
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => { editor.chain().focus().deleteRow().run(); setTableOpen(false); }}>
                          Delete Row
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="w-full justify-start h-7 text-xs text-destructive" onClick={() => { editor.chain().focus().deleteTable().run(); setTableOpen(false); }}>
                          <Trash2 className="h-3 w-3 mr-1.5" /> Delete Table
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          return (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 w-7 p-0",
                "active" in tool && tool.active && "bg-primary/10 text-primary"
              )}
              onClick={"action" in tool ? tool.action : undefined}
              title={"label" in tool ? (tool.label as string) : ""}
            >
              {"icon" in tool && <tool.icon className="h-3.5 w-3.5" />}
            </Button>
          );
        })}
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
