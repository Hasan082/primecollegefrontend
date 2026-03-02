import { LayoutDashboard, GraduationCap, Users, UserCheck, BarChart3, FileText, Blocks } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Qualifications", url: "/admin/qualifications", icon: GraduationCap },
  { title: "Learners", url: "/admin/learners", icon: Users },
  { title: "Trainers", url: "/admin/trainers", icon: UserCheck },
  { title: "Progress", url: "/admin/progress", icon: BarChart3 },
  { title: "Reports", url: "/admin/reports", icon: FileText },
];

const toolsNavItems = [
  { title: "Page Builder", url: "/admin/pages", icon: Blocks },
];

const AdminSidebar = () => {
  const location = useLocation();

  const renderNavItems = (items: typeof mainNavItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={location.pathname === item.url || location.pathname.startsWith(item.url + "/")}
          tooltip={item.title}
        >
          <NavLink
            to={item.url}
            className="hover:bg-sidebar-accent/50"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border top-14">
      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(mainNavItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(toolsNavItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
