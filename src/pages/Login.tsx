import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, CheckCircle2, Shield, FileCheck, Award, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/prime-logo-white-notext.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Login functionality coming soon", description: "Backend authentication is not yet configured." });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0 bg-primary/90" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border border-primary-foreground/30 p-0.5">
              <img src={logo} alt="Prime College" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-foreground">The Prime College</h2>
              <p className="text-primary-foreground/60 text-sm">Learning Platform</p>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight mb-4">
            Professional<br />Qualification<br />Assessment System
          </h1>
          <p className="text-primary-foreground/70 text-base max-w-lg mb-12">
            Secure, regulated, and compliant qualification management for learners.
          </p>

          {/* Learner Portal card */}
          <div className="border border-primary-foreground/20 rounded-xl p-6 bg-primary-foreground/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Mail className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-sm">Learner Portal</h3>
                <p className="text-primary-foreground/60 text-xs">Access your qualifications, submit evidence, and track your progress</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {["View enrolled qualifications", "Submit evidence for assessment", "Track unit completion"].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-primary-foreground/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regulatory compliance footer */}
        <div className="relative z-10 mt-12">
          <div className="border-t border-primary-foreground/15 pt-5">
            <p className="text-primary-foreground/40 text-xs uppercase tracking-widest mb-3">Regulatory Compliance</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/70 text-sm">Ofqual Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/70 text-sm">Ofsted Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/70 text-sm">Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <img src={logo} alt="Prime College" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-xl font-bold text-foreground">The Prime College</span>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground text-sm mt-1">Sign in to access your learning dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:underline font-medium">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>


          </div>

          <Link to="/" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
