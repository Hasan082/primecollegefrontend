import { UserCircle, Mail, Phone, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateMeMutation, useGetMeQuery } from "@/redux/apis/authApi";
import { useEffect, useState } from "react";

const Profile = () => {
  const { toast } = useToast();
  const { data: userData, isLoading: isFetchingUser } = useGetMeQuery(undefined);
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (userData?.data?.user) {
      const user = userData.data.user;
      setForm((prev) => ({
        ...prev,
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [userData]);

  const handleSave = async () => {
    try {
      await updateMe({
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        phone: form.phone,
      }).unwrap();
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    } catch (error) {
      toast({ title: "Update Failed", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const fullName = `${form.first_name} ${form.middle_name ? form.middle_name + " " : ""}${form.last_name}`.trim();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">My Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your personal information</p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">{fullName || 'User'}</p>
            <p className="text-sm text-muted-foreground">Trainer</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <div className="relative mt-1.5">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="middle_name">Middle Name (Optional)</Label>
              <div className="relative mt-1.5">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="middle_name" value={form.middle_name || ""} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <div className="relative mt-1.5">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="pl-10" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" value={form.email} readOnly disabled className="pl-10 opacity-60 cursor-not-allowed" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contact support to change your email address</p>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="pl-10" />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isUpdating || isFetchingUser} className="gap-2">
          <Save className="w-4 h-4" /> {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
