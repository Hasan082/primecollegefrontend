import { useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCreateStaffMutation, StaffCreateRequest } from "@/redux/apis/staffApi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus } from "lucide-react";

const staffSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum(["trainer", "iqa"]),
  qualification_held: z.string().optional(),
  specialisms: z.array(z.string()).optional(),
  centre_registration_number: z.string().optional(),
  standardisation_last_attended: z.string().optional(),
  cpd_record_url: z
    .string()
    .url("Invalid URL")
    .or(z.literal(""))
    .optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffCreateFormProps {
  role: "trainer" | "iqa";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StaffCreateForm({ role, onSuccess, onCancel }: StaffCreateFormProps) {
  const { toast } = useToast();
  const [createStaff, { isLoading: isSubmitting }] = useCreateStaffMutation();

  // Specialism tag management
  const [specialismInput, setSpecialismInput] = useState("");

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      role: role,
      qualification_held: "",
      specialisms: [],
      centre_registration_number: "",
      standardisation_last_attended: "",
      cpd_record_url: "",
    },
  });

  const specialisms = form.watch("specialisms") ?? [];

  const addSpecialism = () => {
    const trimmed = specialismInput.trim();
    if (!trimmed || specialisms.includes(trimmed)) return;
    form.setValue("specialisms", [...specialisms, trimmed]);
    setSpecialismInput("");
  };

  const removeSpecialism = (item: string) => {
    form.setValue("specialisms", specialisms.filter((s) => s !== item));
  };

  const handleSpecialismKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSpecialism();
    }
  };

  async function onSubmit(values: StaffFormValues) {
    try {
      // Build payload — omit empty optional strings so API stays clean
      const payload: StaffCreateRequest = {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role,
        ...(values.middle_name ? { middle_name: values.middle_name } : {}),
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.qualification_held ? { qualification_held: values.qualification_held } : {}),
        ...(values.specialisms && values.specialisms.length > 0
          ? { specialisms: values.specialisms }
          : {}),
        ...(values.centre_registration_number
          ? { centre_registration_number: values.centre_registration_number }
          : {}),
        ...(values.standardisation_last_attended
          ? { standardisation_last_attended: values.standardisation_last_attended }
          : {}),
        ...(values.cpd_record_url ? { cpd_record_url: values.cpd_record_url } : {}),
      };

      const response = await createStaff(payload).unwrap();

      if (response.success) {
        toast({
          title: "Staff created successfully",
          description: `${values.first_name} ${values.last_name} has been added as a ${role}.`,
        });
        form.reset();
        setSpecialismInput("");
        onSuccess?.();
      } else {
        toast({
          title: "Error creating staff",
          description: response.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errMsg =
        error?.data?.detail ||
        error?.data?.message ||
        (typeof error?.data === "object"
          ? Object.values(error.data).flat().join(", ")
          : null) ||
        "Something went wrong.";
      toast({
        title: "Error creating staff",
        description: errMsg,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        {/* Row 1 – Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middle_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Quincy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2 – Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+44 123 456 7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3 – Professional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="qualification_held"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualification Held</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Level 3 Award in Education" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="centre_registration_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Centre Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder="REG12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4 – Specialisms tag input */}
        <div className="space-y-1.5">
          <FormLabel>Specialisms</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Add a specialism and press Enter"
              value={specialismInput}
              onChange={(e) => setSpecialismInput(e.target.value)}
              onKeyDown={handleSpecialismKeyDown}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addSpecialism}
              disabled={!specialismInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {specialisms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specialisms.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 pr-1">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSpecialism(s)}
                    className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Row 5 – Date + CPD URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="standardisation_last_attended"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Standardisation Attended</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpd_record_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPD Record URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/cpd-record" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        </div>
      </form>
    </Form>
  );
}
