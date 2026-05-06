import { UserCircle, Mail, Phone, MapPin, Save, Camera, Briefcase, GraduationCap, Calendar, Link as LinkIcon, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useGetMeQuery,
  usePresignProfilePictureMutation,
  useUpdateMeMutation,
  UpdateMeRequest,
} from "@/redux/apis/authApi";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadFileToS3 } from "@/lib/s3Upload";

const Profile = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: userData, isLoading: isFetchingUser } = useGetMeQuery(undefined);
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [presignProfilePicture] = usePresignProfilePictureMutation();

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    date_of_birth: "",
    staff_profile: {
      staff_role: "",
      qualification_held: "",
      specialisms: "",
      centre_registration_number: "",
      standardisation_last_attended: "",
      cpd_record_url: "",
    },
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clearProfilePicture, setClearProfilePicture] = useState(false);

  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  useEffect(() => {
    if (userData?.data?.user) {
      const user = userData.data.user;
      setForm({
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        date_of_birth: formatDateForInput(user.date_of_birth),
        staff_profile: {
          staff_role: user.staff_profile?.staff_role || "",
          qualification_held: user.staff_profile?.qualification_held || "",
          specialisms: user.staff_profile?.specialisms || "",
          centre_registration_number: user.staff_profile?.centre_registration_number || "",
          standardisation_last_attended: formatDateForInput(user.staff_profile?.standardisation_last_attended),
          cpd_record_url: user.staff_profile?.cpd_record_url || "",
        },
      });
      if (user.profile_picture) {
        setPreviewUrl(user.profile_picture);
      }
    }
  }, [userData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setClearProfilePicture(false);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    setClearProfilePicture(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      let profilePictureKey: string | null = null;

      if (profilePicture) {
        const presign = await presignProfilePicture({
          file_name: profilePicture.name,
          content_type: profilePicture.type || "application/octet-stream",
        }).unwrap();
        profilePictureKey = await uploadFileToS3(presign.data, profilePicture);
      }

      const payload: UpdateMeRequest = {
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        phone: form.phone,
        bio: form.bio,
        date_of_birth: form.date_of_birth || undefined,
        staff_profile: {
          qualification_held: form.staff_profile.qualification_held,
          specialisms: form.staff_profile.specialisms,
          centre_registration_number: form.staff_profile.centre_registration_number,
          standardisation_last_attended: form.staff_profile.standardisation_last_attended || undefined,
          cpd_record_url: form.staff_profile.cpd_record_url,
        },
        profile_picture_key: profilePictureKey || undefined,
        clear_profile_picture: clearProfilePicture,
        address: form.address,
      };

      // Filter out empty strings to avoid validation errors
      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== "")
      );

      // Also clean staff_profile
      if (filteredPayload.staff_profile) {
        filteredPayload.staff_profile = Object.fromEntries(
          Object.entries(filteredPayload.staff_profile).filter(([_, v]) => v !== "")
        );
      }

      await updateMe(filteredPayload as UpdateMeRequest).unwrap();
      setProfilePicture(null);
      setClearProfilePicture(false);
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    } catch {
      toast({ title: "Update Failed", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const fullName = `${form.first_name} ${form.middle_name ? form.middle_name + " " : ""}${form.last_name}`.trim();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">My Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your personal and professional information</p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              <AvatarImage src={previewUrl || ""} alt={fullName} className="object-cover" />
              <AvatarFallback className="bg-primary/10">
                <UserCircle className="w-12 h-12 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 right-0 flex gap-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              {previewUrl && (
                <button 
                  onClick={handleRemovePicture}
                  className="p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{fullName || 'User Name'}</h2>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{form.staff_profile.staff_role || 'IQA'}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" /> Personal Information
            </h3>
            <div className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                  <Input id="middle_name" value={form.middle_name} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="mt-1.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={form.email} readOnly disabled className="mt-1.5 opacity-60 cursor-not-allowed bg-muted" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1.5" placeholder="Short description about yourself..." />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5" placeholder="Your full address..." />
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Professional Information
            </h3>
            <div className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qualification_held">Qualifications Held</Label>
                  <div className="relative mt-1.5">
                    <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea id="qualification_held" value={form.staff_profile.qualification_held} onChange={(e) => setForm({ ...form, staff_profile: { ...form.staff_profile, qualification_held: e.target.value } })} className="pl-10 min-h-[80px]" placeholder="List your relevant qualifications..." />
                  </div>
                </div>
                <div>
                  <Label htmlFor="specialisms">Specialisms</Label>
                  <div className="relative mt-1.5">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea id="specialisms" value={form.staff_profile.specialisms} onChange={(e) => setForm({ ...form, staff_profile: { ...form.staff_profile, specialisms: e.target.value } })} className="pl-10 min-h-[80px]" placeholder="Your areas of expertise..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="centre_reg">Centre Registration Number</Label>
                  <Input id="centre_reg" value={form.staff_profile.centre_registration_number} onChange={(e) => setForm({ ...form, staff_profile: { ...form.staff_profile, centre_registration_number: e.target.value } })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="standardisation">Standardisation Last Attended</Label>
                  <Input id="standardisation" type="date" value={form.staff_profile.standardisation_last_attended} onChange={(e) => setForm({ ...form, staff_profile: { ...form.staff_profile, standardisation_last_attended: e.target.value } })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cpd_url">CPD Record URL</Label>
                  <div className="relative mt-1.5">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="cpd_url" value={form.staff_profile.cpd_record_url} onChange={(e) => setForm({ ...form, staff_profile: { ...form.staff_profile, cpd_record_url: e.target.value } })} className="pl-10" placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <Button onClick={handleSave} disabled={isUpdating || isFetchingUser} className="gap-2 px-8">
            {isUpdating ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
