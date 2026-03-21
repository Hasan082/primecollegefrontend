import { useGetFooterPublicQuery } from "@/redux/apis/footerApi";
import { Link } from "react-router-dom";
import { Image } from "./Image";
import { socialIcons } from "@/data/social-icons";

const Footer = () => {
  const { data } = useGetFooterPublicQuery(null);
  const footer = data?.data || {};
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image
              className="max-h-16"
              image={footer?.footer_logo}
              alt={footer?.footer_logo_alt_text}
            />
            <p className="text-sm text-primary-foreground/80">
              {footer?.description}
            </p>
          </div>

          {footer?.link_groups
            ?.slice()
            .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
            .map((group) => {
              return (
                <div key={group?.id}>
                  <h4 className="font-semibold mb-3">{group?.title}</h4>
                  <ul className="space-y-2 text-sm text-primary-foreground/80">
                    {group?.links
                      ?.slice()
                      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                      .map((link) => (
                        <li>
                          <Link
                            to={link?.url}
                            className="hover:text-primary-foreground"
                          >
                            {link?.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}

          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>{footer?.address}</li>
              <li>
                <a
                  href={`mailto:${footer?.email}`}
                  className="hover:text-primary-foreground"
                >
                  {footer?.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${footer?.phone}`}
                  className="hover:text-primary-foreground"
                >
                  {footer?.phone}
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              {footer?.social_links
                ?.slice()
                .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                .map((link) => (
                  <a
                    href={link?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    aria-label={link?.platform}
                  >
                    {socialIcons[link.platform]}
                  </a>
                ))}
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-primary-foreground/60">
          <span>
            © {footer?.copyright_year} {footer?.copyright_name}. All rights
            reserved.
          </span>
          <Link
            to="/staff-login"
            className="text-primary-foreground/40 hover:text-primary-foreground/70 text-xs transition-colors"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
