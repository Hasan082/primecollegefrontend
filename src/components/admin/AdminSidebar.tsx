import { LayoutDashboard, GraduationCap, Users, UserCheck, BarChart3, FileText, Blocks, BookOpen, ClipboardCheck, Download, Shield, ClipboardList, PanelTop, PanelBottom, Mail } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  {
    title: "Qualifications",
    url: "/admin/qualifications",
    icon: GraduationCap,
  },
  { title: "Learners", url: "/admin/learners", icon: Users },
  { title: "Trainers", url: "/admin/trainers", icon: UserCheck },
  { title: "IQA", url: "/admin/iqa", icon: Shield },
  { title: "IQA Checklists", url: "/admin/checklists", icon: ClipboardList },
  { title: "Progress", url: "/admin/progress", icon: BarChart3 },
];

const assessmentNavItems = [
  { title: "Question Bank", url: "/admin/question-bank", icon: BookOpen },
  {
    title: "Final Assessments",
    url: "/admin/final-assessments",
    icon: ClipboardCheck,
  },
];

const toolsNavItems = [
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "EQA Export", url: "/admin/eqa-export", icon: Download },
  { title: "Page Builder", url: "/admin/pages", icon: Blocks },
];

const siteSettingsItems = [
  { title: "Header", url: "/admin/settings/header", icon: PanelTop },
  { title: "Footer", url: "/admin/settings/footer", icon: PanelBottom },
  { title: "Blogs", url: "/admin/settings/blogs", icon: BookText },
  {
    title: "Email Logs",
    url: "/admin/settings/email-delivery-monitor",
    icon: Mail,
  },
  {
    title: "Extension Plans",
    url: "/admin/extension-plans",
    icon: CalendarPlus,
  },
];

const AdminSidebar = () => {
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
          <SidebarGroupLabel>General Routes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Assessment</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(assessmentNavItems)}
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

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Site Setting</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(siteSettingsItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
