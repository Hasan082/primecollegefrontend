import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserCircle, KeyRound, LogOut, ChevronDown } from "lucide-react";
import logo from "@/assets/prime-logo-white-notext.png";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import TrainerSidebar from "@/components/trainer/TrainerSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMeQuery } from "@/redux/apis/authApi";

const TrainerLayout = () => {
  const { data: userData } = useGetMeQuery(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!user || user.role !== "trainer")
  //     navigate("/staff-login", { replace: true });
  // }, [user, navigate]);

  // if (!user || user.role !== "trainer") return null;

  const handleLogout = () => {
    // logout();
    navigate("/staff-login", { replace: true });
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex flex-col w-full">
        <header className="bg-primary text-primary-foreground sticky top-0 z-30">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10 rounded-md p-1.5" />
              <div className="w-8 h-8 rounded-full border border-primary-foreground/30 p-0.5">
                <img
                  src={logo}
                  alt="Prime College"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold hidden sm:inline">
                Trainer / Assessor Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {/* {user.name} */}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/trainer/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <TrainerSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-5xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TrainerLayout;
