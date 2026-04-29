import { useNavigate } from "react-router-dom";
import { X, Check, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import { CartItem, useCart } from "@/contexts/CartContext";
import { QualificationUpsellItem } from "@/redux/apis/qualificationApi";

const formatMoney = (value: string | number, currency = "GBP") =>
  `${currency} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface UpsellModalProps {
  currentItem: CartItem;
  recommendations: QualificationUpsellItem[];
  onClose: () => void;
}

const UpsellModal = ({ currentItem, recommendations, onClose }: UpsellModalProps) => {
  const navigate = useNavigate();
  const { addItem, removeItem, isInCart, items, totalPrice } = useCart();
  const selectedUpsells = recommendations.filter((course) => isInCart(course.slug));
  const primaryRecommendation = recommendations[0];
  const bannerSavings =
    primaryRecommendation && Number(primaryRecommendation.discount_percent) > 0
      ? `Save ${primaryRecommendation.discount_percent}%`
      : primaryRecommendation
        ? `Save ${formatMoney(primaryRecommendation.bundle_discount_total, primaryRecommendation.currency)}`
        : "Save on bundled courses";
  const projectedSubtotal = totalPrice;
  const projectedDiscount = selectedUpsells.reduce(
    (sum, course) => sum + Number(course.bundle_discount_total || 0),
    0,
  );
  const finalTotal = projectedSubtotal - projectedDiscount;

  const handleProceed = () => {
    onClose();
    navigate("/checkout");
  };

  const toggleCourse = (course: QualificationUpsellItem) => {
    const inCart = isInCart(course.slug);
    if (!inCart && selectedUpsells.length >= 2) return;

    const cartItem: CartItem = {
      id: course.id,
      qualificationId: course.id,
      slug: course.slug,
      title: course.title,
      level: null,
      duration: "",
      price: formatMoney(course.current_price || 0, course.currency),
      currency: course.currency,
      category: null,
      imageUrl:
        course.featured_image?.card ||
        course.featured_image?.hero_mobile ||
        course.featured_image?.original ||
        null,
      isUpsell: true,
      pricingNote:
        Number(course.discount_percent) > 0
          ? `${course.discount_percent}% bundle discount`
          : `${formatMoney(course.discount_amount, course.currency)} bundle discount`,
      bundleOriginalPrice: Number(course.bundle_original_price || 0),
      bundleDiscountTotal: Number(course.bundle_discount_total || 0),
      priceValue: Number(course.current_price || 0),
    };

    if (inCart) {
      removeItem(course.slug);
    } else {
      addItem(cartItem);
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
              <p className="text-sm font-bold">{bannerSavings} — Enroll in 2+ Courses</p>
              <p className="text-xs opacity-80">Most learners add a complementary course to unlock the configured bundle discount.</p>
            </div>
          </div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Complete Your Learning Path</h2>
          <p className="text-sm text-muted-foreground mt-1">Add a recommended course below and your configured bundle discount will apply automatically.</p>
        </div>

        {/* Current Course */}
        <div className="p-6 border-b border-border">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">Your Selection</p>
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{currentItem.title}</h3>
              <div className="flex gap-2 mt-1">
                {currentItem.level ? <span className="text-xs text-muted-foreground">{currentItem.level}</span> : null}
                {currentItem.duration ? <span className="text-xs text-muted-foreground">• {currentItem.duration}</span> : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-primary">{currentItem.price}</span>
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
              Select up to 2
            </span>
          </div>
          <div className="space-y-3">
            {recommendations.map((course) => {
              const inCart = isInCart(course.slug);
              const disabledByLimit = !inCart && selectedUpsells.length >= 2;
              const savedAmount = Number(course.bundle_discount_total || 0);
              return (
                <div
                  key={course.slug}
                  className={`flex items-center justify-between rounded p-4 transition-all ${
                    inCart
                      ? "bg-secondary/10 border-2 border-secondary/40 shadow-sm"
                      : disabledByLimit
                        ? "cursor-not-allowed bg-muted/40 border border-border opacity-60"
                      : "bg-card border border-border hover:border-secondary/30 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    if (!disabledByLimit) toggleCourse(course);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{course.title}</h3>
                    {course.message ? (
                      <p className="mt-1 text-xs text-muted-foreground">{course.message}</p>
                    ) : null}
                    {!inCart && !disabledByLimit && (
                      <p className="text-xs text-secondary-foreground mt-1.5 font-medium">
                        Add & save {formatMoney(savedAmount, course.currency)} on your combined order
                      </p>
                    )}
                    {disabledByLimit && (
                      <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                        Remove another upsell to add this course
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <span className="font-bold text-foreground text-sm">
                        {formatMoney(course.current_price || 0, course.currency)}
                      </span>
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
          {selectedUpsells.length > 0 && (
            <div className="bg-secondary/10 border border-secondary/20 rounded p-3 mb-4 text-center">
              <p className="text-sm font-semibold text-secondary-foreground">
                Bundle Discount Applied — Save {formatMoney(projectedDiscount, currentItem.currency)}.
              </p>
            </div>
          )}

          <div className="space-y-1 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{items.length} course{items.length !== 1 ? "s" : ""}</span>
              <span className="text-foreground">{formatMoney(projectedSubtotal, currentItem.currency)}</span>
            </div>
            {selectedUpsells.length > 0 && (
              <div className="flex justify-between text-secondary-foreground">
                <span>Bundle Discount</span>
                <span>-{formatMoney(projectedDiscount, currentItem.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatMoney(finalTotal, currentItem.currency)}</span>
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
