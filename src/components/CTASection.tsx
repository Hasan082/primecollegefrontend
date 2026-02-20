import { Link } from "react-router-dom";
import ctaBg from "@/assets/cta-background.jpg";

const CTASection = () => {
  return (
    <section className="relative py-20 px-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ctaBg})` }}
      />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="relative z-10 container mx-auto text-center">
        <h2 className="text-3xl font-bold text-primary-foreground mb-4">
          Start Your Journey Today
        </h2>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Whether you are looking to start a new career, advance in your current role, or gain specialist knowledge, The Prime College has a qualification for you. Contact us today to discuss your options.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/qualifications"
            className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 text-sm"
          >
            View Qualifications
          </Link>
          <Link
            to="/contact"
            className="inline-block bg-primary-foreground text-primary px-8 py-3 font-semibold rounded hover:opacity-90 text-sm"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
