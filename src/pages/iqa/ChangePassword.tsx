import { useState } from "react";
import { KeyRound, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChangePasswordMutation } from "@/redux/apis/authApi";

const PasswordInput = ({
  id, label, value, show, onToggle, onChange,
}: { id: string; label: string; value: string; show: boolean; onToggle: () => void; onChange: (v: string) => void }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <div className="relative mt-1.5">
      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
        placeholder="••••••••"
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const ChangePassword = () => {
  const { toast } = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changePassword, { isLoading: isUpdating }] = useChangePasswordMutation();

  const [form, setForm] = useState({ 
    current_password: "", 
    new_password: "", 
    confirm_password: "" 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current_password || !form.new_password || !form.confirm_password) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (form.new_password.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (form.new_password !== form.confirm_password) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    try {
      await changePassword(form).unwrap();
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      toast({ 
        title: "Update Failed", 
        description: error?.data?.message || "Failed to update password.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Change Password</h1>
      <p className="text-muted-foreground mb-8">Update your account password</p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <PasswordInput id="current" label="Current Password" value={form.current_password} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} onChange={(v) => setForm(p => ({ ...p, current_password: v }))} />
        <PasswordInput id="new" label="New Password" value={form.new_password} show={showNew} onToggle={() => setShowNew(!showNew)} onChange={(v) => setForm(p => ({ ...p, new_password: v }))} />
        <PasswordInput id="confirm" label="Confirm New Password" value={form.confirm_password} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} onChange={(v) => setForm(p => ({ ...p, confirm_password: v }))} />

        <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>

        <Button type="submit" disabled={isUpdating} className="gap-2">
          <Save className="w-4 h-4" /> {isUpdating ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
