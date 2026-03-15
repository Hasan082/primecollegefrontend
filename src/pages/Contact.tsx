import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { fetchContent } from "@/lib/api";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";
import LoadingSpinner from "@/components/LoadingSpinner";
import contactBanner from "@/assets/contact-banner.jpg";

interface ContactData {
  title: string;
  intro: string;
  details: {
    address: string;
    email: string;
    phone: string;
    hours: string;
  };
  formFields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
}

const Contact = () => {
  const [data, setData] = useState<ContactData | null>(null);

  useEffect(() => {
    fetchContent<ContactData>("contact").then(setData);
  }, []);

  if (!data) return <LoadingSpinner />;

  return (
    <div>
      <div className="relative h-[400px] overflow-hidden">
        <img src={contactBanner} alt="Contact Prime College" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="absolute inset-0 flex items-end pb-10">
          <div className="container mx-auto px-4">
            <Breadcrumb variant="overlay" items={[{ label: "Contact Us" }]} />
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 text-center mt-4">{data.title}</h1>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg text-center">{data.intro}</p>
          </div>
        </div>
      </div>

      <Section title="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Details */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6">Get in Touch</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold text-foreground">Address</div>
                <div className="text-muted-foreground">{data.details.address}</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">Email</div>
                <div className="text-muted-foreground">{data.details.email}</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">Phone</div>
                <div className="text-muted-foreground">{data.details.phone}</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">Office Hours</div>
                <div className="text-muted-foreground">{data.details.hours}</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6">Send a Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {data.formFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      rows={4}
                      className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-8 py-2 rounded text-sm font-semibold hover:opacity-90"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </Section>

      {/* Map Section */}
      <section className="bg-muted py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Find Us</h2>
          <div className="rounded-xl overflow-hidden border border-border h-[400px]">
            <iframe
              title="Prime College Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.234!2d-0.0175!3d51.5075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487602d64e0e8b7f%3A0x1234567890abcdef!2s13%20Lanark%20Square%2C%20London%20E14%209QD!5e0!3m2!1sen!2suk!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
};

export default Contact;
