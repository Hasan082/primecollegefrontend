import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  FileCheck,
  Award,
  ArrowLeft,
  Lock,
  Users,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/prime-logo-white-notext.png";
import { useLoginMutation, useGetCsrfTokenQuery } from "@/redux/apis/authApi";
import { TryCatch } from "@/utils/apiTryCatch";
import { appConfig } from "@/app.config";

type StaffRole = "trainer" | "admin" | "iqa";

const ROLE_CONFIG = {
  trainer: {
    icon: Users,
    label: "Trainer",
    description:
      "Review submissions, provide feedback, and assess learner evidence",
    features: [
      "Review pending submissions",
      "Provide detailed feedback",
      "Track learner progress",
    ],
    cardTitle: "Trainer / Assessor Portal",
    signInLabel: "Sign In to Trainer Portal",
    demoRedirect: "/trainer/dashboard",
    placeholder: "trainer@primecollege.edu",
  },
  admin: {
    icon: Settings,
    label: "Admin",
    description:
      "Manage qualifications, learners, trainers, and platform settings",
    features: [
      "Manage qualifications & units",
      "Enrol learners & assign trainers",
      "Monitor progress & reporting",
    ],
    cardTitle: "Administration Portal",
    signInLabel: "Sign In to Admin Portal",
    redirect: appConfig.ADMIN_REDIRECT, // Replaced hardcoded path
    placeholder: "admin@primecollege.edu",
  },
  iqa: {
    icon: Shield,
    label: "IQA",
    description: "Monitor assessment quality and ensure regulatory compliance",
    features: [
      "Review sampled assessments",
      "Monitor trainer quality",
      "Generate compliance reports",
    ],
    cardTitle: "IQA Portal",
    signInLabel: "Sign In to IQA Portal",
    demoRedirect: "/iqa/dashboard",
    placeholder: "iqa@primecollege.edu",
  },
} as const;

const redirects = {
  iqa: appConfig.IQA_REDIRECT,
  admin: appConfig.ADMIN_REDIRECT,
  trainer: appConfig.TRAINER_REDIRECT,
};

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<StaffRole>("trainer");

  const [login, { isLoading: loading }] = useLoginMutation();
  const { data: csrfData } = useGetCsrfTokenQuery(undefined);
  const { toast } = useToast();

  const navigate = useNavigate();

  const config = ROLE_CONFIG[selectedRole];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const [result, error] = await TryCatch(
      login({
        email,
        password,
        role: selectedRole,
      }).unwrap(),
    );

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    if (result?.message || result?.data?.user) {
      toast({
        title: "Success",
        description: result.message || "Logged in successfully",
      });

      const role = result?.data?.user?.role;
      if (role === "admin") navigate(appConfig.ADMIN_REDIRECT);
      else if (role === "trainer") navigate(appConfig.TRAINER_REDIRECT);
      else if (role === "iqa") navigate(appConfig.IQA_REDIRECT);
      else navigate(appConfig.LERNER_REDIRECT);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/90" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border border-primary-foreground/30 p-0.5">
              <img
                src={logo}
                alt="Prime College"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-foreground">
                The Prime College
              </h2>
              <p className="text-primary-foreground/60 text-sm">
                Learning Platform
              </p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight mb-4">
            Professional
            <br />
            Qualification
            <br />
            Assessment System
          </h1>
          <p className="text-primary-foreground/70 text-base max-w-lg mb-12">
            Secure, regulated, and compliant qualification management for
            learners, trainers, and administrators.
          </p>

          {/* Dynamic role card */}
          <div className="border border-primary-foreground/20 rounded-xl p-6 bg-primary-foreground/5 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <config.icon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-sm">
                  {config.cardTitle}
                </h3>
                <p className="text-primary-foreground/60 text-xs">
                  {config.description}
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              {config.features.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-primary-foreground/80 text-sm">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12">
          <div className="border-t border-primary-foreground/15 pt-5">
            <p className="text-primary-foreground/40 text-xs uppercase tracking-widest mb-3">
              Regulatory Compliance
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/70 text-sm">
                  Ofqual Aligned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/70 text-sm">
                  Ofsted Ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/70 text-sm">
                  Quality Assured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <img
                  src={logo}
                  alt="Prime College"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-foreground">
                The Prime College
              </span>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Lock className="w-5 h-5 text-foreground" />
                <h2 className="text-2xl font-bold text-foreground">
                  Secure Access
                </h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Select your role and sign in to continue
              </p>
            </div>

            {/* Role Tabs - Trainer & Admin only */}
            <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
              {(["trainer", "iqa", "admin"] as StaffRole[]).map((role) => {
                const Icon = ROLE_CONFIG[role].icon;
                const isActive = selectedRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {ROLE_CONFIG[role].label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="staff-email">Email Address</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder={config.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-password">Password</Label>
                <div className="relative">
                  <Input
                    id="staff-password"
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? "Signing in..." : config.signInLabel}
                {!loading && <span>→</span>}
              </button>
            </form>


            <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              Encrypted Connection • Secure Authentication
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
