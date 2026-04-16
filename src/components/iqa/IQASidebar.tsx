import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  FolderTree,
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

const mainNavItems = [
  { title: "Dashboard", url: "/iqa/dashboard", icon: LayoutDashboard },
  {
    title: "Qualification Overview",
    url: "/iqa/qualifications",
    icon: FolderTree,
  },
  { title: "IQA Inbox", url: "/iqa/sampling", icon: ClipboardCheck },
  // { title: "Checklists", url: "/iqa/checklists", icon: ClipboardList },
  { title: "Trainer Performance", url: "/iqa/trainers", icon: Users },
  { title: "Reports", url: "/iqa/reports", icon: BarChart3 },
];

const toolsNavItems = [
  { title: "Sampling Settings", url: "/iqa/settings", icon: Settings },
];

const IQASidebar = () => {
  const location = useLocation();

  const renderNavItems = (items: typeof mainNavItems) =>
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
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(toolsNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default IQASidebar;
