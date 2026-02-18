import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, Lock, CreditCard, ShieldCheck, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, removeItem, totalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Browse our qualifications to find your ideal course.</p>
        <Link to="/qualifications" className="bg-primary text-primary-foreground px-6 py-3 rounded font-semibold hover:opacity-90">
          View All Qualifications
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      navigate("/enrollment-confirmation");
    }, 2000);
  };

  const bundleDiscount = items.length >= 2 ? 0.1 : 0;
  const registrationFee = 50;
  const discountAmount = totalPrice * bundleDiscount;
  const finalTotal = totalPrice - discountAmount + registrationFee;

  const inputClass = "w-full border border-border rounded px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none";

  return (
    <div className="bg-muted min-h-screen">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/qualifications" className="flex items-center gap-2 text-sm hover:opacity-80">
            <ChevronLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4" />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-10 text-sm">
          <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-semibold text-xs">1</span>
          <span className="font-semibold text-foreground">Courses Selected</span>
          <span className="w-8 h-px bg-border" />
          <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-semibold text-xs">2</span>
          <span className="font-semibold text-foreground">Your Details</span>
          <span className="w-8 h-px bg-border" />
          <span className="bg-muted-foreground/30 text-muted-foreground px-3 py-1 rounded-full font-semibold text-xs">3</span>
          <span className="text-muted-foreground">Confirmation</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-card border border-border rounded p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-card border border-border rounded p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Billing Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} required className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Postcode *</label>
                    <input name="postcode" value={form.postcode} onChange={handleChange} required className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Payment Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name on Card *</label>
                  <input name="cardName" value={form.cardName} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Card Number *</label>
                  <input name="cardNumber" value={form.cardNumber} onChange={handleChange} required placeholder="1234 5678 9012 3456" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Expiry *</label>
                    <input name="expiry" value={form.expiry} onChange={handleChange} required placeholder="MM/YY" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">CVV *</label>
                    <input name="cvv" value={form.cvv} onChange={handleChange} required placeholder="123" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-secondary text-secondary-foreground py-3 rounded font-bold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Complete Enrollment — £{finalTotal.toLocaleString()}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                SSL Encrypted
              </div>
              <span>•</span>
              <span>100% Secure Payment</span>
              <span>•</span>
              <span>14-Day Refund Policy</span>
            </div>
          </form>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded p-6 sticky top-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Order Summary ({items.length} course{items.length !== 1 ? "s" : ""})
              </h2>

              <div className="space-y-3 border-b border-border pb-4 mb-4">
                {items.map((item) => (
                  <div key={item.slug} className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{item.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">{item.category}</span>
                        <span className="text-xs text-muted-foreground">{item.level}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-foreground">{item.price}</span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.slug)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-b border-border pb-4 mb-4">
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
              </div>

              <div className="flex justify-between text-base font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">£{finalTotal.toLocaleString()}</span>
              </div>

              {items.length >= 2 && (
                <div className="mt-4 bg-secondary/10 border border-secondary/20 rounded p-3 text-center">
                  <p className="text-xs font-semibold text-secondary-foreground">
                    🎉 You're saving £{discountAmount.toLocaleString()} with bundle discount!
                  </p>
                </div>
              )}

              <div className="mt-4 bg-muted rounded p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Payment Plan Available</strong><br />
                  Pay in 3 interest-free instalments. Contact us after enrollment for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
