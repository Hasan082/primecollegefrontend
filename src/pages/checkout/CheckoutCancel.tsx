import { Link } from "react-router-dom";
import { XCircle, Home, ArrowLeft } from "lucide-react";

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Checkout Cancelled</h2>
        <p className="text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made.
          Please try again or contact support if you are experiencing issues.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/checkout"
            className="w-full inline-flex justify-center items-center gap-2 bg-primary text-primary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Try Again
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

export default CheckoutCancel;
