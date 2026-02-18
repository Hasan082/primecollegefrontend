import { useEffect, useState, useRef } from "react";
import { fetchContent } from "@/lib/api";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Briefcase, Clock, Upload, X, PoundSterling, CalendarDays, CheckCircle2 } from "lucide-react";

interface Opening {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salary: string;
  closing_date: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

interface RecruitmentData {
  title: string;
  intro: string;
  openings: Opening[];
}

const Recruitment = () => {
  const [data, setData] = useState<RecruitmentData | null>(null);
  const [selectedJob, setSelectedJob] = useState<Opening | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverMessage: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent<RecruitmentData>("recruitment").then(setData);
  }, []);

  const resetForm = () => {
    setFormData({ fullName: "", email: "", phone: "", coverMessage: "" });
    setCvFile(null);
    setCoverLetterFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!cvFile) {
      toast({ title: "Please upload your CV", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSelectedJob(null);
      resetForm();
      toast({ title: "Application submitted!", description: "We'll be in touch soon." });
    }, 1500);
  };

  if (!data) return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="bg-primary py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">{data.title}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">{data.intro}</p>
        </div>
      </div>

      <Section title="Current Openings">
        <div className="space-y-6 max-w-3xl mx-auto">
          {data.openings.map((job) => (
            <div key={job.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                  {job.type}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.department}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                <span className="flex items-center gap-1"><PoundSterling className="w-3.5 h-3.5" />{job.salary}</span>
              </div>
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <button
                onClick={() => { setSelectedJob(job); resetForm(); }}
                className="inline-block mt-4 bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-semibold hover:opacity-90"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Job Application Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => { if (!open) setSelectedJob(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
              </DialogHeader>

              {/* Job Meta */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground border-b border-border pb-4">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary" />{selectedJob.department}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />{selectedJob.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />{selectedJob.type}</span>
                <span className="flex items-center gap-1.5"><PoundSterling className="w-4 h-4 text-primary" />{selectedJob.salary}</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary" />Closing: {selectedJob.closing_date}</span>
              </div>

              {/* Job Description */}
              <div className="space-y-5 py-2">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Job Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Key Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {selectedJob.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Requirements</h4>
                  <ul className="space-y-1.5">
                    {selectedJob.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">What We Offer</h4>
                  <ul className="space-y-1.5">
                    {selectedJob.benefits.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Application Form */}
              <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-4">
                <h4 className="font-semibold text-foreground text-lg">Apply for this position</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      maxLength={255}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    maxLength={20}
                  />
                </div>

                {/* CV Upload */}
                <div className="space-y-1.5">
                  <Label>Upload CV / Resume *</Label>
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  />
                  {cvFile ? (
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5 text-sm">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="text-foreground flex-1 truncate">{cvFile.name}</span>
                      <button type="button" onClick={() => setCvFile(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => cvInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-lg py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-1"
                    >
                      <Upload className="w-5 h-5" />
                      Click to upload CV (PDF, DOC, DOCX)
                    </button>
                  )}
                </div>

                {/* Cover Letter Upload */}
                <div className="space-y-1.5">
                  <Label>Upload Cover Letter (optional)</Label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                  />
                  {coverLetterFile ? (
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5 text-sm">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="text-foreground flex-1 truncate">{coverLetterFile.name}</span>
                      <button type="button" onClick={() => setCoverLetterFile(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-lg py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-1"
                    >
                      <Upload className="w-5 h-5" />
                      Click to upload Cover Letter (PDF, DOC, DOCX)
                    </button>
                  )}
                </div>

                {/* Additional Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="coverMessage">Additional Message (optional)</Label>
                  <Textarea
                    id="coverMessage"
                    placeholder="Tell us why you're a great fit for this role..."
                    value={formData.coverMessage}
                    onChange={(e) => setFormData({ ...formData, coverMessage: e.target.value })}
                    maxLength={1000}
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-3 rounded font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CTASection />
    </div>
  );
};

export default Recruitment;
