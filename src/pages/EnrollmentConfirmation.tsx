import { Link } from "react-router-dom";
import { CheckCircle, Download, Mail, Calendar, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const EnrollmentConfirmation = () => {
  const { items, totalPrice, clearCart } = useCart();
  const orderId = `PC-${Date.now().toString(36).toUpperCase()}`;

  const bundleDiscount = items.length >= 2 ? 0.1 : 0;
  const registrationFee = 50;
  const discountAmount = totalPrice * bundleDiscount;
  const finalTotal = totalPrice - discountAmount + registrationFee;

  // If cart is empty (e.g. direct navigation), show fallback
  if (items.length === 0) {
    return (
      <div className="bg-muted min-h-screen py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-card border border-border rounded p-8 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Enrollment Complete</h1>
            <p className="text-muted-foreground text-sm">Your enrollment has been confirmed. Check your email for details.</p>
          </div>
          <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded font-semibold text-sm hover:opacity-90">
            Back to Home
          </Link>
        </div>
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

            <div className="border-t border-border pt-3">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Enrolled Courses</p>
              {items.map((item) => (
                <div key={item.slug} className="flex justify-between py-2">
                  <div>
                    <span className="text-foreground font-medium">{item.title}</span>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{item.level}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{item.duration}</span>
                    </div>
                  </div>
                  <span className="text-foreground shrink-0 ml-4">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">£{totalPrice.toLocaleString()}</span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-secondary-foreground">
                  <span>Bundle Discount (10%)</span>
                  <span>-£{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Fee</span>
                <span className="text-foreground">£{registrationFee}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span className="text-foreground">Total Paid</span>
                <span className="text-primary">£{finalTotal.toLocaleString()}</span>
              </div>
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
            onClick={() => clearCart()}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded font-semibold text-sm text-center hover:opacity-90 flex items-center justify-center gap-2"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/qualifications"
            onClick={() => clearCart()}
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
