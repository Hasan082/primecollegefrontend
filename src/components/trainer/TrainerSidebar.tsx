import {
  LayoutDashboard,
  Users,
  History,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
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

const navItems = [
  { title: "Dashboard", url: "/trainer/dashboard", icon: LayoutDashboard },
  { title: "Assigned Learners", url: "/trainer/learners", icon: Users },
  { title: "Assessment History", url: "/trainer/history", icon: History },
];

const assessmentNavItems = [
  { title: "Question Bank", url: "/trainer/question-bank", icon: BookOpen },
  {
    title: "Final Assessments",
    url: "/trainer/final-assessments",
    icon: ClipboardCheck,
  },
];

const TrainerSidebar = () => {
  const location = useLocation();

  const renderNavItems = (items: typeof navItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={
            location.pathname === item.url ||
            location.pathname.startsWith(item.url + "/")
          }
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
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-sidebar-border top-14"
    >
      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel>General Routes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Assessment</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(assessmentNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default TrainerSidebar;
