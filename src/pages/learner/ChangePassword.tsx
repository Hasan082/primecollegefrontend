import { useState } from "react";
import { KeyRound, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ChangePassword = () => {
  const { toast } = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current || !form.newPass || !form.confirm) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (form.newPass.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (form.newPass !== form.confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    toast({ title: "Password Changed", description: "Your password has been updated successfully." });
    setForm({ current: "", newPass: "", confirm: "" });
  };

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Change Password</h1>
      <p className="text-muted-foreground mb-8">Update your account password</p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <PasswordInput id="current" label="Current Password" value={form.current} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} onChange={(v) => setForm({ ...form, current: v })} />
        <PasswordInput id="new" label="New Password" value={form.newPass} show={showNew} onToggle={() => setShowNew(!showNew)} onChange={(v) => setForm({ ...form, newPass: v })} />
        <PasswordInput id="confirm" label="Confirm New Password" value={form.confirm} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} onChange={(v) => setForm({ ...form, confirm: v })} />

        <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>

        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" /> Update Password
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
