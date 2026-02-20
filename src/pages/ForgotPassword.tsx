import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/prime-logo-white-notext.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast({
        title: "Reset Link Sent",
        description: "Please check your email for further instructions to reset your password.",
      });
    }, 1200);
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
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="h-11"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
