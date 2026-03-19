import { Link } from "react-router-dom";
import { CheckCircle2, Home, ArrowRight } from "lucide-react";

const CheckoutSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Checkout Successful!</h2>
        <p className="text-muted-foreground mb-8">
          Thank you for your enrollment. Your payment has been processed successfully. 
          You will receive a confirmation email shortly.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/learner/dashboard"
            className="w-full inline-flex justify-center items-center gap-2 bg-primary text-primary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Go to My Dashboard
            <ArrowRight className="w-4 h-4" />
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

export default CheckoutSuccess;
