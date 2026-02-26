import { LayoutDashboard, BookOpen, UserCircle, KeyRound, LogOut, GraduationCap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { learnerQualifications } from "@/data/learnerMockData";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const LearnerSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const mainNav = [
    { title: "Dashboard", url: "/learner/dashboard", icon: LayoutDashboard },
    { title: "My Profile", url: "/learner/profile", icon: UserCircle },
    { title: "Change Password", url: "/learner/change-password", icon: KeyRound },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={item.title}>
                    <NavLink to={item.url} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Qualifications */}
        <SidebarGroup>
          <SidebarGroupLabel>My Qualifications</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learnerQualifications.map((q) => (
                <SidebarMenuItem key={q.id}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname.includes(`/learner/qualification/${q.id}`)}
                        tooltip={q.title}
                      >
                        <NavLink
                          to={`/learner/qualification/${q.id}`}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <GraduationCap className="h-4 w-4" />
                          <span className="truncate">{collapsed ? q.category[0] : q.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] text-xs">
                      {q.title}
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout" className="text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default LearnerSidebar;
