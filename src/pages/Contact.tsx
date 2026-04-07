import { Link } from "react-router-dom";
import Breadcrumb from "@/components/Breadcrumb";
import Section from "@/components/Section";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useGetPageQuery } from "@/redux/apis/pageBuilderApi";
import { safeParseBlocks } from "@/utils/pageBuilder";
import { ContentBlock } from "@/types/pageBuilder";
import contactBanner from "@/assets/contact-banner.jpg";

const Contact = () => {
  const { data: pageResponse, isLoading } = useGetPageQuery("contact");
  const blocks = safeParseBlocks(pageResponse?.data?.blocks || []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {blocks.length > 0 ? (
        blocks.map((block) => <ContactBlockRenderer key={block.id} block={block} />)
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          No content available for this page yet.
        </div>
      )}
    </div>
  );
};

const ContactBlockRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;

  switch (block.type) {
    case "hero":
      return (
        <div className="relative h-[400px] overflow-hidden">
          <img 
            src={d.image || contactBanner} 
            alt={d.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">{d.title}</h1>
              {d.subtitle && <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg">{d.subtitle}</p>}
            </div>
          </div>
          <div className="absolute bottom-0 w-full">
            <Breadcrumb items={[{ label: "Contact Us" }]} />
          </div>
        </div>
      );

    case "contact-form":
      return (
        <Section title="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Details */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6">{d.title || "Get in Touch"}</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold text-foreground">Address</div>
                  <div className="text-muted-foreground">{d.address}</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Email</div>
                  <div className="text-muted-foreground">{d.email}</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Phone</div>
                  <div className="text-muted-foreground">{d.phone}</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Office Hours</div>
                  <div className="text-muted-foreground">{d.hours}</div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6">Send a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {Array.isArray(d.formFields) && d.formFields.map((field: any) => (
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
                  className="bg-primary text-primary-foreground px-8 py-2 rounded text-sm font-semibold hover:opacity-90 transition shadow-sm"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </Section>
      );

    case "map":
      return (
        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">{d.title || "Find Us"}</h2>
            <div className="rounded-xl overflow-hidden border border-border h-[400px] shadow-sm">
              <iframe
                title="Prime College Location"
                src={d.iframeUrl}
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
      );

    case "cta":
      return (
        <section className="relative py-20 px-4 overflow-hidden bg-primary text-primary-foreground text-center">
          {d.bgImage && <img src={d.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />}
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{d.title}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">{d.content}</p>
            {d.ctaLabel && (
              <Link
                to={d.ctaHref || "/qualifications"}
                className="inline-block bg-secondary text-secondary-foreground px-8 py-3 font-semibold rounded hover:opacity-90 transition shadow-lg"
              >
                {d.ctaLabel}
              </Link>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
};

export default Contact;
