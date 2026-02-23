import { useNavigate } from "react-router-dom";
import { X, Check, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";

// All courses for recommendation engine
const allCourses: (CartItem & { relatedSlugs: string[] })[] = [
  { slug: "othm-level-4-diploma-in-business-management", title: "OTHM Level 4 Diploma in Business Management", level: "Level 4", duration: "9 months", price: "£1,000", category: "Business", relatedSlugs: ["othm-level-5-extended-diploma-in-business-management", "othm-level-6-diploma-in-business-management"] },
  { slug: "othm-level-5-extended-diploma-in-business-management", title: "OTHM Level 5 Extended Diploma in Business Management", level: "Level 5", duration: "12 months", price: "£1,200", category: "Business", relatedSlugs: ["othm-level-4-diploma-in-business-management", "othm-level-6-diploma-in-business-management"] },
  { slug: "othm-level-6-diploma-in-business-management", title: "OTHM Level 6 Diploma in Business Management", level: "Level 6", duration: "9 months", price: "£1,350", category: "Business", relatedSlugs: ["othm-level-5-extended-diploma-in-business-management", "othm-level-7-diploma-in-strategic-management-and-leadership"] },
  { slug: "othm-level-7-diploma-in-strategic-management-and-leadership", title: "OTHM Level 7 Diploma in Strategic Management and Leadership", level: "Level 7", duration: "12 months", price: "£1,500", category: "Management", relatedSlugs: ["qualifi-level-7-diploma-in-strategic-management-and-leadership", "othm-level-6-diploma-in-business-management"] },
  { slug: "qualifi-level-7-diploma-in-strategic-management-and-leadership", title: "QUALIFI Level 7 Diploma in Strategic Management and Leadership", level: "Level 7", duration: "12 months", price: "£1,600", category: "Management", relatedSlugs: ["othm-level-7-diploma-in-strategic-management-and-leadership", "othm-level-7-diploma-in-healthcare-management"] },
  { slug: "qualifi-level-3-diploma-in-health-and-social-care", title: "QUALIFI Level 3 Diploma in Health and Social Care", level: "Level 3", duration: "6 months", price: "£950", category: "Care", relatedSlugs: ["othm-level-5-diploma-in-health-and-social-care-management", "othm-level-7-diploma-in-healthcare-management"] },
  { slug: "othm-level-5-diploma-in-health-and-social-care-management", title: "OTHM Level 5 Diploma in Health and Social Care Management", level: "Level 5", duration: "9 months", price: "£1,100", category: "Care", relatedSlugs: ["qualifi-level-3-diploma-in-health-and-social-care", "othm-level-7-diploma-in-healthcare-management"] },
  { slug: "othm-level-7-diploma-in-healthcare-management", title: "OTHM Level 7 Diploma in Healthcare Management", level: "Level 7", duration: "12 months", price: "£1,500", category: "Care", relatedSlugs: ["othm-level-5-diploma-in-health-and-social-care-management", "othm-level-7-diploma-in-strategic-management-and-leadership"] },
];

interface UpsellModalProps {
  currentSlug: string;
  onClose: () => void;
}

const UpsellModal = ({ currentSlug, onClose }: UpsellModalProps) => {
  const navigate = useNavigate();
  const { addItem, removeItem, isInCart, items, totalPrice } = useCart();

  const currentCourse = allCourses.find((c) => c.slug === currentSlug);
  if (!currentCourse) return null;

  // Smart recommendations: related courses + same category, excluding current
  const related = currentCourse.relatedSlugs
    .map((s) => allCourses.find((c) => c.slug === s))
    .filter(Boolean) as typeof allCourses;

  // Add same-category courses not already in related
  const sameCategory = allCourses.filter(
    (c) => c.category === currentCourse.category && c.slug !== currentSlug && !related.find((r) => r.slug === c.slug)
  );

  const recommendations = [...related, ...sameCategory].slice(0, 2);

  // Calculate bundle discount (10% off when 2+ courses)
  const bundleDiscount = items.length >= 2 ? 0.1 : 0;
  const registrationFee = 50;
  const discountAmount = totalPrice * bundleDiscount;
  const finalTotal = totalPrice - discountAmount + registrationFee;

  const handleProceed = () => {
    onClose();
    navigate("/checkout");
  };

  const toggleCourse = (course: CartItem) => {
    if (isInCart(course.slug)) {
      removeItem(course.slug);
    } else {
      addItem(course);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Savings Banner */}
        <div className="bg-secondary text-secondary-foreground px-6 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-secondary-foreground/20 rounded-full p-1.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold">Save 10% — Enroll in 2+ Courses</p>
              <p className="text-xs opacity-80">Most students add a complementary course to fast-track their career</p>
            </div>
          </div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Complete Your Learning Path</h2>
          <p className="text-sm text-muted-foreground mt-1">Add a recommended course below and your <strong className="text-primary">10% discount</strong> applies automatically.</p>
        </div>

        {/* Current Course */}
        <div className="p-6 border-b border-border">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">Your Selection</p>
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{currentCourse.title}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{currentCourse.level}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{currentCourse.duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-primary">{currentCourse.price}</span>
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Recommended For You</p>
            <span className="text-xs bg-secondary/15 text-secondary-foreground px-2 py-0.5 rounded font-medium">
              + Add to unlock 10% off
            </span>
          </div>
          <div className="space-y-3">
            {recommendations.map((course) => {
              const inCart = isInCart(course.slug);
              const coursePrice = parseFloat(course.price.replace(/[^0-9.]/g, ""));
              const savedAmount = Math.round(coursePrice * 0.1);
              return (
                <div
                  key={course.slug}
                  className={`flex items-center justify-between rounded p-4 cursor-pointer transition-all ${
                    inCart
                      ? "bg-secondary/10 border-2 border-secondary/40 shadow-sm"
                      : "bg-card border border-border hover:border-secondary/30 hover:shadow-sm"
                  }`}
                  onClick={() => toggleCourse(course)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{course.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">{course.category}</span>
                      <span className="text-xs text-muted-foreground">{course.level}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{course.duration}</span>
                    </div>
                    {!inCart && (
                      <p className="text-xs text-secondary-foreground mt-1.5 font-medium">
                        Add & save £{savedAmount} on your entire order
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <span className="font-bold text-foreground text-sm">{course.price}</span>
                      {inCart && (
                        <p className="text-xs text-secondary-foreground font-medium">Saving applied ✓</p>
                      )}
                    </div>
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        inCart ? "bg-secondary" : "border-2 border-border"
                      }`}
                    >
                      {inCart && <Check className="w-4 h-4 text-secondary-foreground" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="p-6">
          {items.length >= 2 && (
            <div className="bg-secondary/10 border border-secondary/20 rounded p-3 mb-4 text-center">
              <p className="text-sm font-semibold text-secondary-foreground">
                🎉 Bundle Discount Applied — Save £{discountAmount.toLocaleString()}!
              </p>
            </div>
          )}

          <div className="space-y-1 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{items.length} course{items.length !== 1 ? "s" : ""}</span>
              <span className="text-foreground">£{totalPrice.toLocaleString()}</span>
            </div>
            {bundleDiscount > 0 && (
              <div className="flex justify-between text-secondary-foreground">
                <span>10% Bundle Discount</span>
                <span>-£{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration Fee</span>
              <span className="text-foreground">£{registrationFee}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">£{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleProceed}
              className="flex-1 bg-secondary text-secondary-foreground py-3 rounded font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground text-center py-2"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsellModal;
