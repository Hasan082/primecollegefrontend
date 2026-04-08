import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useEnrollLearnerMutation,
  useGetQualificationOnlyQuery,
} from "@/redux/apis/admin/learnerManagementApi";
import { cleanObject } from "@/utils/cleanObject";

const enrollLearnerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  billing_address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  qualification_id: z.string().min(1, "Qualification is required"),
  qualification_session_id: z.string().optional(),
});

type EnrollLearnerFormValues = z.infer<typeof enrollLearnerSchema>;

type QualificationDate = {
  id: string;
  label: string;
};

type QualificationSessionLocation = {
  id: string;
  name: string;
  dates: QualificationDate[];
};

type QualificationOption = {
  id: string;
  name: string;
  slug: string;
  is_session: boolean;
  session_locations: QualificationSessionLocation[];
};

type QualificationOnlyResponse = {
  success: boolean;
  message: string;
  data: QualificationOption[];
};

interface EnrollLearnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getErrorMessage = (error: any) => {
  if (typeof error?.data?.message === "string") return error.data.message;
  if (typeof error?.data?.detail === "string") return error.data.detail;
  if (typeof error?.message === "string") return error.message;
  return "Something went wrong.";
};
// TODO: need to work here after api changes
export default function EnrollLearnerModal({
  open,
  onOpenChange,
}: EnrollLearnerModalProps) {
  const { toast } = useToast();
  const [enrollLearner, { isLoading: isSubmitting }] =
    useEnrollLearnerMutation();
  const { data: qualificationResponse, isLoading: isLoadingQualifications } =
    useGetQualificationOnlyQuery(undefined, { skip: !open });

  const qualifications =
    (qualificationResponse as QualificationOnlyResponse | undefined)?.data ||
    [];

  const form = useForm<EnrollLearnerFormValues>({
    resolver: zodResolver(enrollLearnerSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone: "",
      billing_address: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
      qualification_id: "",
      qualification_session_id: "",
    },
  });

  const selectedQualificationId = form.watch("qualification_id");
  const selectedQualification = useMemo(
    () =>
      qualifications.find(
        (qualification) => qualification.id === selectedQualificationId,
      ),
    [qualifications, selectedQualificationId],
  );

  const sessionOptions = useMemo(() => {
    if (!selectedQualification?.is_session) return [];

    return selectedQualification.session_locations.flatMap((location) =>
      location.dates.map((date) => ({
        id: date.id,
        label: `${location.name} - ${date.label}`,
      })),
    );
  }, [selectedQualification]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  useEffect(() => {
    form.setValue("qualification_session_id", "");
    form.clearErrors("qualification_session_id");
  }, [form, selectedQualificationId]);

  const handleSubmit = async (values: EnrollLearnerFormValues) => {
    if (selectedQualification?.is_session && !values.qualification_session_id) {
      form.setError("qualification_session_id", {
        type: "manual",
        message: "Session date is required for this qualification",
      });
      return;
    }

    const payload = cleanObject({
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      billing_address: values.billing_address,
      city: values.city,
      postcode: values.postcode,
      country: values.country,
      items: [
        cleanObject({
          qualification_id: values.qualification_id,
          qualification_session_id: selectedQualification?.is_session
            ? values.qualification_session_id
            : undefined,
        }),
      ],
    });

    try {
      const response = await enrollLearner(payload).unwrap();
      toast({
        title: "Learner enrolled successfully",
        description:
          response?.message || "The learner has been enrolled successfully.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Enrollment failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manual Learner Enrolment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-2"
          >
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
                      <Input placeholder="Smith" {...field} />
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
                      <Input
                        type="email"
                        placeholder="learner@example.com"
                        {...field}
                      />
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
                      <Input placeholder="+44 7700 000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="United Kingdom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Input placeholder="221B Baker Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input placeholder="SW1A 1AA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualification_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Qualification *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingQualifications}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingQualifications
                                ? "Loading qualifications..."
                                : "Select qualification"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {qualifications.map((qualification) => (
                          <SelectItem
                            key={qualification.id}
                            value={qualification.id}
                          >
                            {qualification.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedQualification?.is_session ? (
                <FormField
                  control={form.control}
                  name="qualification_session_id"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Session Date *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={sessionOptions.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sessionOptions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enrolling learner...
                </>
              ) : (
                "Enrol Learner"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
