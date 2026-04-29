import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import logo from "@/assets/prime-logo-white-notext.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForgotPasswordConfirmMutation } from "@/redux/apis/authApi";

const ForgotPasswordReset = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [forgotPasswordConfirm, { isLoading }] =
    useForgotPasswordConfirmMutation();

  const hasValidLinkParams = Boolean(uid && token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasValidLinkParams) {
      toast({
        title: "Invalid reset link",
        description:
          "Please open the full reset link from your email or request a new one.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      await forgotPasswordConfirm({
        uid,
        token,
        new_password: password,
        re_new_password: confirmPassword,
        password,
        confirm_password: confirmPassword,
      }).unwrap();

      setPassword("");
      setConfirmPassword("");
      setIsSuccess(true);
    } catch (err: any) {
      toast({
        title: "Unable to reset password",
        description:
          err?.data?.message ||
          "This reset link is invalid or expired. Please request a new one.",
        variant: "destructive",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-lg text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center p-0.5">
              <img
                src={logo}
                alt="The Prime College"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-foreground">
              The Prime College
            </span>
          </Link>

          <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Password Reset Successful
            </h1>
            <p className="text-muted-foreground text-sm mt-3">
              Your password has been updated. You can now sign in with your new
              password.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mt-8">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Continue to Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center p-0.5">
              <img
                src={logo}
                alt="The Prime College"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-foreground">
              The Prime College
            </span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter a new password for your account.
            </p>
          </div>

          {!hasValidLinkParams && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-start gap-3 mb-6 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                This reset link is invalid or expired. Please open the full link
                from your email or request a new password reset.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="reset-password">New Password</Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  className="h-11 pr-10"
                  disabled={!hasValidLinkParams}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  disabled={!hasValidLinkParams}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  className="h-11 pr-10"
                  disabled={!hasValidLinkParams}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  disabled={!hasValidLinkParams}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !hasValidLinkParams}
              className="w-full bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Saving..." : "Reset Password"}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Request New Link
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
          >
            Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordReset;
