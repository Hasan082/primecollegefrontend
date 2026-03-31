import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetAwardingBodiesQuery } from "@/redux/apis/qualification/qualificationSupportApi";
import { useCreateStaffMutation, StaffCreateRequest } from "@/redux/apis/staffApi";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const staffSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum(["trainer", "iqa"]),
  qualification_held: z.string().optional(),
  awarding_bodies: z.array(z.string()).optional(),
  centre_registration_number: z.string().optional(),
  standardisation_last_attended: z.string().optional(),
  cpd_record_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
  send_setup_email: z.boolean().default(true),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffCreateFormProps {
  role: "trainer" | "iqa";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StaffCreateForm({ role, onSuccess, onCancel }: StaffCreateFormProps) {
  const { toast } = useToast();
  const { data: awardingBodiesData, isLoading: isLoadingAwardingBodies } = useGetAwardingBodiesQuery();
  const [createStaff, { isLoading: isSubmitting }] = useCreateStaffMutation();

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
      awarding_bodies: [],
      centre_registration_number: "",
      standardisation_last_attended: "",
      cpd_record_url: "",
      send_setup_email: true,
    },
  });

  async function onSubmit(values: StaffFormValues) {
    try {
      const response = await createStaff(values as any as StaffCreateRequest).unwrap();
      if (response.success) {
        toast({
          title: "Staff created successfully",
          description: `${values.first_name} ${values.last_name} has been added as a ${role}.`,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error creating staff",
          description: response.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating staff",
        description: error?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
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
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
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
              <FormItem className="md:col-span-2">
                <FormLabel>CPD Record URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/cpd-record" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="awarding_bodies"
          render={() => (
            <FormItem>
              <FormLabel>Awarding Bodies</FormLabel>
              <div className="border rounded-md p-2">
                <ScrollArea className="h-32">
                  {isLoadingAwardingBodies ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Loading awarding bodies...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {awardingBodiesData?.data?.map((body: any) => (
                        <FormField
                          key={body.id}
                          control={form.control}
                          name="awarding_bodies"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={body.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(body.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), body.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== body.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-xs cursor-pointer">
                                  {body.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="send_setup_email"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Send setup email
                </FormLabel>
                <FormDescription>
                  This will send an email to the staff member to set up their account.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

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
