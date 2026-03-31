import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PanelTop, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useGetNavbarPublicQuery,
  useUpdateNavbarSettingsMutation,
  useCreateNavbarSettingsMutation,
  NavbarSettings,
  NavLinkItem,
} from "@/redux/apis/navbarApi";
import HeaderLogoSettings from "@/components/admin/settings/header/HeaderLogoSettings";
import NavigationList from "@/components/admin/settings/header/NavigationList";
import NavItemForm from "@/components/admin/settings/header/NavItemForm";

const HeaderSettings = () => {
  const { toast } = useToast();
  const { data: navbarResponse, isLoading, isError } = useGetNavbarPublicQuery();
  const [updateNavbar, { isLoading: isUpdating }] = useUpdateNavbarSettingsMutation();
  const [createNavbar, { isLoading: isCreating }] = useCreateNavbarSettingsMutation();

  const [settings, setSettings] = useState<{
    id?: string;
    dynamicNavLinks: NavLinkItem[];
    header_logo: string | File | null;
    header_logo_alt_text: string;
    is_active: boolean;
  }>({
    dynamicNavLinks: [],
    header_logo: null,
    header_logo_alt_text: "Prime College",
    is_active: true,
  });

  const [formConfig, setFormConfig] = useState<{
    show: boolean;
    index: number | null;
    initialData?: NavLinkItem;
  }>({
    show: false,
    index: null,
  });

  useEffect(() => {
    if (navbarResponse?.data) {
      setSettings(navbarResponse.data);
    }
  }, [navbarResponse]);

  const handleUpdateLogo = (field: string, value: string | File | null) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleReorder = (newItems: NavLinkItem[]) => {
    setSettings((prev) => ({ ...prev, dynamicNavLinks: newItems }));
  };

  const handleSaveItem = (item: NavLinkItem) => {
    setSettings((prev) => {
      const newLinks = [...prev.dynamicNavLinks];
      if (formConfig.index !== null) {
        newLinks[formConfig.index] = { ...item, order: formConfig.index + 1 };
      } else {
        newLinks.push({ ...item, order: newLinks.length + 1 });
      }
      return { ...prev, dynamicNavLinks: newLinks };
    });
    setFormConfig({ show: false, index: null });
  };

  const handleDeleteItem = (index: number) => {
    setSettings((prev) => {
      const newLinks = prev.dynamicNavLinks
        .filter((_, i) => i !== index)
        .map((link, idx) => ({ ...link, order: idx + 1 }));
      return { ...prev, dynamicNavLinks: newLinks };
    });
    toast({ title: "Item deleted locally. Click save to persist." });
  };

  const handleSaveAll = async () => {
    try {
      const formData = new FormData();
      if (settings.id) formData.append("id", settings.id);
      
      // Append logo only if it is a File (new upload) or if we want to send the existing path
      if (settings.header_logo instanceof File) {
        formData.append("header_logo", settings.header_logo);
      } else if (typeof settings.header_logo === "string") {
        // If it's a string, it's the existing path. 
        // Some backends might not need this if patching, but we'll include it for completeness.
        formData.append("header_logo", settings.header_logo);
      }
      
      formData.append("header_logo_alt_text", settings.header_logo_alt_text);
      formData.append("is_active", String(settings.is_active));
      
      // Stringify complex objects for FormData
      formData.append("dynamicNavLinks", JSON.stringify(settings.dynamicNavLinks));

      if (settings.id) {
        await updateNavbar(formData).unwrap();
      } else {
        await createNavbar(formData).unwrap();
      }

      toast({ title: "Header settings saved successfully!" });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please check your network and try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <PanelTop className="h-6 w-6 text-primary" /> Header Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your navigation menu and global header appearance
          </p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={isUpdating || isCreating}
          className="shadow-lg shadow-primary/20"
        >
          {isUpdating || isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <HeaderLogoSettings
        logo={settings.header_logo}
        altText={settings.header_logo_alt_text}
        onUpdate={handleUpdateLogo}
      />

      {formConfig.show ? (
        <NavItemForm
          onSave={handleSaveItem}
          onCancel={() => setFormConfig({ show: false, index: null })}
          initialData={formConfig.initialData}
          title={formConfig.index !== null ? "Edit Navigation Item" : "Add Navigation Item"}
        />
      ) : (
        <NavigationList
          items={settings.dynamicNavLinks}
          onReorder={handleReorder}
          onAdd={() => setFormConfig({ show: true, index: null })}
          onEdit={(idx) => setFormConfig({ show: true, index: idx, initialData: settings.dynamicNavLinks[idx] })}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
};

export default HeaderSettings;
