import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Menu } from "lucide-react";
import logo from "@/assets/prime-logo-white-notext.png";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import LearnerSidebar from "@/components/learner/LearnerSidebar";
import NotificationBell from "@/components/learner/NotificationBell";

const LearnerLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LearnerSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-primary text-primary-foreground sticky top-0 z-30">
            <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-primary-foreground hover:bg-sidebar-accent rounded-md p-1.5">
                  <Menu className="w-5 h-5" />
                </SidebarTrigger>
                <div className="w-8 h-8 rounded-full border border-primary-foreground/30 p-0.5">
                  <img src={logo} alt="Prime College" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-bold hidden sm:inline">Learner Portal</span>
              </div>

              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LearnerLayout;
