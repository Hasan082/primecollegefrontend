import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PanelBottom, Save, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useGetFooterPublicQuery,
  useUpdateFooterSettingsMutation,
  usePresignFooterLogoMutation,
  FooterSettings as IFooterSettings,
  LinkGroup,
  SocialLink,
  UpdateFooterRequest,
} from "@/redux/apis/footerApi";
import FooterLogoSettings from "@/components/admin/settings/footer/FooterLogoSettings";
import BasicInfoSettings from "@/components/admin/settings/footer/BasicInfoSettings";
import LinkGroupManager from "@/components/admin/settings/footer/LinkGroupManager";
import LinkGroupForm from "@/components/admin/settings/footer/LinkGroupForm";
import SocialLinksManager from "@/components/admin/settings/footer/SocialLinksManager";
import { uploadFileToS3 } from "@/lib/s3Upload";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FooterSettings = () => {
  const { toast } = useToast();
  const { data: footerResponse, isLoading, refetch } = useGetFooterPublicQuery();
  const [updateFooter, { isLoading: isUpdating }] = useUpdateFooterSettingsMutation();
  const [presignFooterLogo] = usePresignFooterLogoMutation();

  const [clearFooterLogo, setClearFooterLogo] = useState(false);

  const [settings, setSettings] = useState<IFooterSettings>({
    footer_logo: null,
    footer_logo_alt_text: "Prime College",
    description: "",
    address: "",
    email: "",
    phone: "",
    link_groups: [],
    social_links: [],
    copyright_name: "Prime College",
    copyright_year: new Date().getFullYear(),
  });

  const [groupFormConfig, setGroupFormConfig] = useState<{
    show: boolean;
    index: number | null;
    initialData?: LinkGroup;
  }>({
    show: false,
    index: null,
  });

  useEffect(() => {
    if (footerResponse?.data) {
      setSettings(footerResponse.data);
    }
  }, [footerResponse]);

  const handleUpdateField = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    if (field === "footer_logo" && value === null) {
      setClearFooterLogo(true);
    } else if (field === "footer_logo" && value !== null) {
      setClearFooterLogo(false);
    }
  };

  const handleReorderGroups = (newGroups: LinkGroup[]) => {
    setSettings((prev) => ({ ...prev, link_groups: newGroups }));
  };

  const handleSaveGroup = (group: LinkGroup) => {
    setSettings((prev) => {
      const newGroups = [...prev.link_groups];
      if (groupFormConfig.index !== null) {
        newGroups[groupFormConfig.index] = { ...group, order: groupFormConfig.index + 1 };
      } else {
        newGroups.push({ ...group, order: newGroups.length + 1 });
      }
      return { ...prev, link_groups: newGroups };
    });
    setGroupFormConfig({ show: false, index: null });
  };

  const handleDeleteGroup = (index: number) => {
    setSettings((prev) => {
      const newGroups = prev.link_groups
        .filter((_, i) => i !== index)
        .map((group, idx) => ({ ...group, order: idx + 1 }));
      return { ...prev, link_groups: newGroups };
    });
    toast({ title: "Group removed locally. Click save to persist." });
  };

  const handleReorderSocial = (newSocial: SocialLink[]) => {
    setSettings((prev) => ({ ...prev, social_links: newSocial }));
  };

  const handleAddSocial = (link: SocialLink) => {
    setSettings((prev) => ({
      ...prev,
      social_links: [...prev.social_links, link],
    }));
  };

  const handleDeleteSocial = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      social_links: prev.social_links
        .filter((_, i) => i !== index)
        .map((link, idx) => ({ ...link, order: idx + 1 })),
    }));
  };

  const handleToggleSocialActive = (index: number, active: boolean) => {
    setSettings((prev) => {
      const newSocial = [...prev.social_links];
      newSocial[index] = { ...newSocial[index], is_active: active };
      return { ...prev, social_links: newSocial };
    });
  };

  const handleSaveAll = async () => {
    try {
      let footerLogoKey: string | null = null;

      if (settings.footer_logo instanceof File) {
        const presign = await presignFooterLogo({
          file_name: settings.footer_logo.name,
          content_type: settings.footer_logo.type || "application/octet-stream",
        }).unwrap();
        footerLogoKey = await uploadFileToS3(presign.data, settings.footer_logo);
      }

      // Destructure to exclude footer_logo from the base settings
      const { footer_logo, ...restSettings } = settings;

      const payload: UpdateFooterRequest = {
        ...restSettings,
        copyright_year: Number(settings.copyright_year),
        footer_logo_key: footerLogoKey || undefined,
        clear_footer_logo: clearFooterLogo,
      };

      // Ensure footer_logo is not in the payload as it's handled via S3 key
      if ("footer_logo" in payload) {
        delete (payload as any).footer_logo;
      }

      await updateFooter(payload).unwrap();
      setClearFooterLogo(false);
      toast({ 
        title: "Success",
        description: "Footer settings saved successfully!",
      });
      refetch();
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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading footer settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 rounded-b-xl border-b border-border/50">
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs font-semibold mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <PanelBottom className="h-7 w-7" />
             </div>
             <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Footer Settings
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Customize your global footer appearance, links, and social presence.
                </p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="h-10 px-4" onClick={() => refetch()}>
              <Undo2 className="mr-2 h-4 w-4" /> Reset Changes
           </Button>
           <Button 
            onClick={handleSaveAll} 
            disabled={isUpdating}
            className="h-10 px-6 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Logo and Info */}
        <div className="lg:col-span-5 space-y-8">
          <FooterLogoSettings
            logo={settings.footer_logo}
            altText={settings.footer_logo_alt_text}
            onUpdate={handleUpdateField}
          />
          <BasicInfoSettings
            description={settings.description}
            address={settings.address}
            email={settings.email}
            phone={settings.phone}
            copyright_name={settings.copyright_name}
            copyright_year={settings.copyright_year}
            onUpdate={handleUpdateField}
          />
        </div>

        {/* Right Column: Links and Social */}
        <div className="lg:col-span-7 space-y-8">
          <LinkGroupManager
            groups={settings.link_groups}
            onReorder={handleReorderGroups}
            onAdd={() => setGroupFormConfig({ show: true, index: null })}
            onEdit={(idx) => setGroupFormConfig({ show: true, index: idx, initialData: settings.link_groups[idx] })}
            onDelete={handleDeleteGroup}
          />
          <SocialLinksManager
            links={settings.social_links}
            onReorder={handleReorderSocial}
            onAdd={handleAddSocial}
            onDelete={handleDeleteSocial}
            onToggleActive={handleToggleSocialActive}
          />
        </div>
      </div>

      {/* Overlay Form for Link Group */}
      <Dialog 
        open={groupFormConfig.show} 
        onOpenChange={(open) => !open && setGroupFormConfig({ show: false, index: null })}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-2">
             <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
               <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                 <PanelBottom className="h-5 w-5" />
               </div>
               {groupFormConfig.index !== null ? "Edit Link Group" : "Create New Link Group"}
             </DialogTitle>
          </DialogHeader>
          <LinkGroupForm
            onSave={handleSaveGroup}
            onCancel={() => setGroupFormConfig({ show: false, index: null })}
            initialData={groupFormConfig.initialData}
            title={groupFormConfig.index !== null ? "Edit Link Group" : "Create New Link Group"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FooterSettings;
