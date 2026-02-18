import { useEffect, useState } from "react";
import { fetchContent } from "@/lib/api";
import Section from "@/components/Section";

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

  if (!data) return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="bg-primary py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">{data.title}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">{data.intro}</p>
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
    </div>
  );
};

export default Contact;
