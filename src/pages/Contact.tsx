import { useEffect, useState } from "react";
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">{data.title}</h1>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg">{data.intro}</p>
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
      <CTASection />
    </div>
  );
};

export default Contact;
