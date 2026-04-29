import { useState } from "react";
import {
    FileUp, Loader2, AlertCircle, FileText, ExternalLink, Download, Clock, Save, Shield,
    BookOpen, Target, Timer, CheckCircle2,
    Settings,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UnitAssessmentConfig from "@/components/trainer/UnitAssessmentConfig";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    useGetUnitResourcesQuery,
    usePresignUnitResourceUploadMutation,
    useCreateUnitResourceMutation,
    useDeleteUnitResourceMutation,
    UnitRow,
    useGetUnitCpdConfigQuery
} from "@/redux/apis/qualification/qualificationUnitApi";
import { CPDConfigDrawer } from "@/components/shared/qualificationManagement/drawers/CPDConfigDrawer";
import { ResourceItem } from "./ResourceItem";

const mapFileToResourceType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    if (extension === "pdf") return "pdf";
    if (["ppt", "pptx", "key"].includes(extension)) return "slide";
    if (["doc", "docx", "xls", "xlsx", "csv"].includes(extension)) return "template";
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) return "video";
    if (["mp3", "wav", "m4a", "aac", "ogg"].includes(extension)) return "audio";

    return "other";
};
// ─── Unit Expansion Section ───────────────────────────────────────────
export const UnitExpandedContent = ({
    unit,
    isCpd,
    qualificationId
}: {
    unit: UnitRow;
    isCpd: boolean;
    qualificationId: string;
}) => {
    const { toast } = useToast();
    const { data: resources, isLoading: isLoadingResources } = useGetUnitResourcesQuery(unit.id);
    const [presignResourceUpload, { isLoading: isPresigning }] = usePresignUnitResourceUploadMutation();
    const [createResource, { isLoading: isCreatingResource }] = useCreateUnitResourceMutation();
    const [deleteResource] = useDeleteUnitResourceMutation();

    // CPD config data (fetched always for CPD units so we can show a preview)
    const { data: cpdConfig } = useGetUnitCpdConfigQuery(unit.id, { skip: !isCpd });
    const hasCpdConfig = !!cpdConfig?.id;
    const isUploading = isPresigning || isCreatingResource;

    // CPD state
    const [cpdOpen, setCpdOpen] = useState(false);

    const uploadResourceFile = async (file: File): Promise<string> => {
        const presign = await presignResourceUpload({
            file_name: file.name,
            content_type: file.type || "application/octet-stream",
        }).unwrap();

        const uploadFormData = new FormData();
        Object.entries(presign.data.fields).forEach(([key, value]) => {
            uploadFormData.append(key, value);
        });
        uploadFormData.append("file", file);

        const uploadResponse = await fetch(presign.data.upload_url, {
            method: "POST",
            body: uploadFormData,
        });

        if (!uploadResponse.ok) {
            throw new Error("Direct resource upload to S3 failed.");
        }

        return presign.data.file_key;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            for (const file of files) {
                const fileKey = await uploadResourceFile(file);
                await createResource({
                    unitId: unit.id,
                    qualificationId,
                    payload: {
                        title: file.name,
                        description: "",
                        resource_type: mapFileToResourceType(file.name),
                        file_key: fileKey,
                        estimated_minutes: 0,
                        is_downloadable: true,
                        is_required: false,
                        is_active: true,
                    }
                }).unwrap();
            }

            toast({
                title: files.length === 1 ? "Resource uploaded successfully" : "Resources uploaded successfully"
            });
        } catch (err) {
            toast({ title: "Upload failed", variant: "destructive" });
        }
        e.target.value = "";
    };

    const handleDeleteResource = async (resourceId: string) => {
        try {
            await deleteResource({
                resourceId,
                unitId: unit.id,
                qualificationId
            }).unwrap();
            toast({ title: "Resource removed" });
        } catch (err) {
            toast({ title: "Failed to remove resource", variant: "destructive" });
        }
    };

    return (
        <div className="border-t bg-muted/20 px-4 py-4 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assessment Config */}
                {!isCpd && (
                    <div>
                        <UnitAssessmentConfig
                            unitId={unit.id}
                            qualificationId={unit.qualification}
                            unitCode={unit.unit_code}
                            unitName={unit.title}
                            quizCount={unit.quiz_count || 0}
                            assignmentCount={unit.assignment_count || 0}
                            initialConfig={{
                                has_quiz: unit.has_quiz,
                                has_written_assignment: unit.has_written_assignment,
                                requires_evidence: unit.requires_evidence
                            }}
                        />
                    </div>
                )}

                {/* Resources & CPD */}
                <div className={cn("space-y-4 text-sm", isCpd && "lg:col-span-2")}>
                    {/* Resources */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Learning Resources</Label>
                                <p className="text-[10px] text-muted-foreground">Study materials and handouts for this unit</p>
                            </div>
                            <label className="cursor-pointer">
                                <Input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold" asChild disabled={isUploading}>
                                    <span>
                                        {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                                        Upload
                                    </span>
                                </Button>
                            </label>
                        </div>

                        {isLoadingResources ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                        ) : resources && resources.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                                {resources.map((r) => (
                                    <ResourceItem key={r.id} resource={r} onDelete={handleDeleteResource} />
                                ))}
                            </div>
                        ) : (
                            <Alert className="bg-background py-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs text-muted-foreground">
                                    No resources added yet. Learners will only see assessment tasks.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* CPD Trigger */}
                    {isCpd && (
                        <div className="pt-2 border-t border-border/50 space-y-3">
                            {/* CPD Config Summary — shown when config already exists */}
                            {hasCpdConfig && cpdConfig && (
                                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">CPD Config</span>
                                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                                            <CheckCircle2 className="w-3 h-3" /> Configured
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                                        {cpdConfig.estimated_minutes > 0 && (
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Timer className="w-3 h-3 text-primary shrink-0" />
                                                <span><span className="font-semibold text-foreground">{cpdConfig.estimated_minutes} min</span> estimated duration</span>
                                            </div>
                                        )}
                                        {cpdConfig.learning_objectives && (
                                            <div className="flex items-start gap-1.5 text-muted-foreground">
                                                <Target className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{cpdConfig.learning_objectives}</span>
                                            </div>
                                        )}
                                        {cpdConfig.module_summary && (
                                            <div className="flex items-start gap-1.5 text-muted-foreground">
                                                <BookOpen className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{cpdConfig.module_summary}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full justify-between h-10 group hover:border-primary/50"
                                onClick={() => setCpdOpen(true)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                        <Settings className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <span className="text-xs font-semibold">
                                        {hasCpdConfig ? "Edit CPD Settings" : "Configure CPD Settings"}
                                    </span>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {isCpd && (
                <CPDConfigDrawer
                    unitId={unit.id}
                    unitCode={unit.unit_code}
                    isOpen={cpdOpen}
                    onClose={() => setCpdOpen(false)}
                />
            )}
        </div>
    );
};
