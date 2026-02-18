import { useParams, Link } from "react-router-dom";
import { CheckCircle, Download, Mail, Calendar, ArrowRight } from "lucide-react";

const courseData: Record<string, { title: string; level: string; duration: string; price: string }> = {
  "othm-level-4-diploma-in-business-management": { title: "OTHM Level 4 Diploma in Business Management", level: "Level 4", duration: "9 months", price: "£1,000" },
  "othm-level-5-extended-diploma-in-business-management": { title: "OTHM Level 5 Extended Diploma in Business Management", level: "Level 5", duration: "12 months", price: "£1,200" },
  "othm-level-6-diploma-in-business-management": { title: "OTHM Level 6 Diploma in Business Management", level: "Level 6", duration: "9 months", price: "£1,350" },
  "othm-level-7-diploma-in-strategic-management-and-leadership": { title: "OTHM Level 7 Diploma in Strategic Management and Leadership", level: "Level 7", duration: "12 months", price: "£1,500" },
  "qualifi-level-7-diploma-in-strategic-management-and-leadership": { title: "QUALIFI Level 7 Diploma in Strategic Management and Leadership", level: "Level 7", duration: "12 months", price: "£1,600" },
  "qualifi-level-3-diploma-in-health-and-social-care": { title: "QUALIFI Level 3 Diploma in Health and Social Care", level: "Level 3", duration: "6 months", price: "£950" },
  "othm-level-5-diploma-in-health-and-social-care-management": { title: "OTHM Level 5 Diploma in Health and Social Care Management", level: "Level 5", duration: "9 months", price: "£1,100" },
  "othm-level-7-diploma-in-healthcare-management": { title: "OTHM Level 7 Diploma in Healthcare Management", level: "Level 7", duration: "12 months", price: "£1,500" },
};

const EnrollmentConfirmation = () => {
  const { slug } = useParams<{ slug: string }>();
  const course = slug ? courseData[slug] : null;
  const orderId = `PC-${Date.now().toString(36).toUpperCase()}`;

  if (!course) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
        <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded font-semibold">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-muted min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Success Card */}
        <div className="bg-card border border-border rounded p-8 text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Enrollment Successful!</h1>
          <p className="text-muted-foreground text-sm">
            Thank you for enrolling with The Prime College. A confirmation email has been sent to your inbox.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-card border border-border rounded p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Enrollment Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-semibold text-foreground">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="text-foreground font-medium text-right max-w-[60%]">{course.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level</span>
              <span className="text-foreground">{course.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-foreground">{course.duration}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="font-bold text-foreground">Total Paid</span>
              <span className="font-bold text-primary">
                £{(parseFloat(course.price.replace(/[^0-9.]/g, "")) + 50).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-card border border-border rounded p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Check Your Email</h3>
                <p className="text-xs text-muted-foreground">You'll receive a welcome email with login credentials for the learning portal within 24 hours.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Induction Session</h3>
                <p className="text-xs text-muted-foreground">Our team will contact you to schedule your induction and orientation session.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Course Materials</h3>
                <p className="text-xs text-muted-foreground">Access your course materials and study resources through the learning portal once activated.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex-1 bg-primary text-primary-foreground py-3 rounded font-semibold text-sm text-center hover:opacity-90 flex items-center justify-center gap-2"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/qualifications"
            className="flex-1 bg-card border border-border text-foreground py-3 rounded font-semibold text-sm text-center hover:bg-muted"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentConfirmation;
