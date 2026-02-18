import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, BookOpen, Users, Award, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/prime-logo-white-notext.png";

const features = [
  { icon: BookOpen, title: "Interactive Learning", description: "Access engaging course materials anytime, anywhere" },
  { icon: Users, title: "Collaborative Environment", description: "Connect with peers and tutors seamlessly" },
  { icon: Award, title: "Accredited Qualifications", description: "Earn recognised professional qualifications" },
  { icon: GraduationCap, title: "Expert Tutors", description: "Learn from experienced industry professionals" },
];

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
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 2px, transparent 0)", backgroundSize: "50px 50px" }} />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-foreground/10 rounded-full flex items-center justify-center border-2 border-primary-foreground/20">
              <img src={logo} alt="Prime College" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">Prime College</h1>
            <p className="text-primary-foreground/70 text-sm">Empowering education through innovative learning management</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {features.map((feature) => (
              <div key={feature.title} className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 text-left border border-primary-foreground/10">
                <feature.icon className="w-8 h-8 text-secondary mb-3" strokeWidth={1.5} />
                <h3 className="font-semibold text-primary-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-primary-foreground/60 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
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
              <span className="text-xl font-bold text-foreground">Prime College</span>
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

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <button type="button" className="text-primary font-semibold hover:underline">
                Register
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
