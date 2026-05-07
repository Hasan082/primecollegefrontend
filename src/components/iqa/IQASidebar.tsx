import {
  LayoutDashboard,
  ClipboardCheck,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
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
  { title: "My Verifications", url: "/iqa/checklists", icon: ClipboardList },
  { title: "Trainer Performance", url: "/iqa/trainers", icon: Users },
  { title: "Reports", url: "/iqa/reports", icon: BarChart3 },
];

const toolsNavItems = [
  { title: "Sampling Settings", url: "/iqa/settings", icon: Settings },
];

interface IQASidebarProps {
  canManageSamplingSettings?: boolean;
}

const IQASidebar = ({ canManageSamplingSettings = false }: IQASidebarProps) => {
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
            className="hover:bg-sidebar-accent/50 py-2.5"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  const visibleTools = canManageSamplingSettings ? toolsNavItems : [];

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-sidebar-border top-14 h-[calc(100vh-3.5rem)]"
    >
      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {visibleTools.length > 0 ? (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Configuration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(visibleTools)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
};

export default IQASidebar;
