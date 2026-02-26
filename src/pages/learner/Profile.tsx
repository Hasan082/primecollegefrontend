import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserCircle, Mail, Phone, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "07700 900123",
    address: "123 Learning Lane, London, SE1 2AB",
  });

  const handleSave = () => {
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">My Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your personal information</p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">{form.name}</p>
            <p className="text-sm text-muted-foreground">Learner</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1.5">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="pl-10" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10" />
            </div>
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

        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
