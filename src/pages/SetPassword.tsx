import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/prime-logo-white-notext.png";
import { useConfirmPasswordSetupMutation } from "@/redux/apis/authApi";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const uid = searchParams.get("uid") || "";
  
  const [confirmPasswordSetup, { isLoading }] = useConfirmPasswordSetupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters long", variant: "destructive" });
      return;
    }
    if (!uid || !token) {
      toast({ title: "Invalid Link", description: "The password setup link is missing the token or uid.", variant: "destructive" });
      return;
    }
    
    try {
      // Send both new_password and password for compatibility with various Django auth endpoints
      // Djoser uses new_password and re_new_password; generic ones might just use password
      await confirmPasswordSetup({ 
        uid, 
        token, 
        new_password: password, 
        re_new_password: confirmPassword,
        password: password,
        confirm_password: confirmPassword
      }).unwrap();
      
      toast({
        title: "Password Set Successfully",
        description: "You can now login with your new password.",
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Failed to set password",
        description: err?.data?.detail || err?.data?.non_field_errors?.[0] || "An error occurred while setting your password. The link might be invalid or expired.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center p-0.5">
              <img src={logo} alt="The Prime College" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">The Prime College</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Set Password</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Saving..." : "Set Password"}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
