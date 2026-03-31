import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const CheckoutFailed = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order_number");
  const message =
    searchParams.get("message") ||
    "Payment failed or could not be confirmed. Please retry checkout.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h2>
        {orderNumber ? <p className="text-xs text-muted-foreground mb-2">Order: {orderNumber}</p> : null}
        <p className="text-muted-foreground mb-8">{message}</p>

        <div className="flex flex-col gap-3">
          <Link
            to="/checkout"
            className="w-full inline-flex justify-center items-center gap-2 bg-primary text-primary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Retry Payment
          </Link>
          <Link
            to="/"
            className="w-full inline-flex justify-center items-center gap-2 bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailed;
