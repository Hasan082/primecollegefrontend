import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ClipboardCheck, Settings2, Search, Shield, ChevronRight, Loader2, AlertCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useGetQualificationsAdminQuery } from "@/redux/apis/qualification/qualificationApi";

const FinalAssessments = () => {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const basePath = location.pathname.startsWith("/trainer") ? "/trainer" : "/admin";
  const { data: qualificationsResponse, isLoading, error } = useGetQualificationsAdminQuery({
    is_cpd: true,
    search,
  });

  const cpdQualifications = qualificationsResponse?.data?.results || [];

  return (
    <div className="space-y-6">
      <Link to={`${basePath}/dashboard`} className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Final Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage mandatory final exams for all CPD-enabled qualifications</p>
        </div>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">CPD Assessment Strategy</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              For CPD qualifications, unit-level quizzes are disabled. Learners must instead pass a single comprehensive
              <strong> Final Assessment</strong>. Configure question pools and pass criteria per qualification below.
            </p>
          </div>
        </div>
      </Card>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search CPD qualifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 shadow-sm"
        />
      </div>

      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" /> Qualification Level Configurations
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p>Loading CPD qualifications...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-destructive border-2 border-dashed rounded-xl p-8">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                <p className="font-bold">Error loading configurations</p>
                <p className="text-sm opacity-80">Please ensure the backend server is running and try again.</p>
              </div>
            ) : cpdQualifications.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl p-8">
                <Shield className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="font-bold text-foreground">No CPD qualifications found</p>
                <p className="text-sm mt-1">Search matched no results or no CPD qualifications exist yet.</p>
              </div>
            ) : (
              cpdQualifications.map((fa: any) => (
                <Link
                  key={fa.id}
                  to={`${basePath}/qualifications/${fa.id}/final-assessment`}
                  className="group block"
                >
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-300 group-hover:bg-primary/[0.01]">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-5 gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <Shield className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-foreground truncate">{fa.title}</p>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/20 bg-primary/5 px-2 py-0 h-4">CPD</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{fa.category}</span>
                              <span>•</span>
                              <span>{fa.total_units} Units</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="hidden md:flex flex-col items-end gap-1">
                            <Badge variant={fa.status === "active" ? "default" : "secondary"} className="text-[10px] font-bold h-5">
                              {fa.status === "active" ? "Live" : "Draft"}
                            </Badge>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shadow-sm">
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalAssessments;
