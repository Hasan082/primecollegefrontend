import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/prime-logo-white-notext.png";

interface Qualification {
  label: string;
  href: string;
}

interface CategoryNav {
  label: string;
  qualifications: Qualification[];
}

const categoryNavItems: CategoryNav[] = [
  {
    label: "Business",
    qualifications: [
      { label: "OTHM Level 4 Diploma in Business Management", href: "/qualifications/othm-level-4-diploma-in-business-management" },
      { label: "OTHM Level 5 Extended Diploma in Business Management", href: "/qualifications/othm-level-5-extended-diploma-in-business-management" },
      { label: "OTHM Level 6 Diploma in Business Management", href: "/qualifications/othm-level-6-diploma-in-business-management" },
    ],
  },
  {
    label: "Management",
    qualifications: [
      { label: "OTHM Level 7 Diploma in Strategic Management and Leadership", href: "/qualifications/othm-level-7-diploma-in-strategic-management-and-leadership" },
      { label: "QUALIFI Level 7 Diploma in Strategic Management and Leadership", href: "/qualifications/qualifi-level-7-diploma-in-strategic-management-and-leadership" },
    ],
  },
  {
    label: "Care",
    qualifications: [
      { label: "QUALIFI Level 3 Diploma in Health and Social Care", href: "/qualifications/qualifi-level-3-diploma-in-health-and-social-care" },
      { label: "OTHM Level 5 Diploma in Health and Social Care Management", href: "/qualifications/othm-level-5-diploma-in-health-and-social-care-management" },
      { label: "OTHM Level 7 Diploma in Healthcare Management", href: "/qualifications/othm-level-7-diploma-in-healthcare-management" },
    ],
  },
];

interface SimpleNavItem {
  label: string;
  href: string;
}

const simpleNavItems: SimpleNavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Recruitment", href: "/recruitment" },
  { label: "Contact", href: "/contact" },
];

const TOP_BAR_HEIGHT = 32;
const HEADER_HEIGHT_FULL = 72;
const HEADER_HEIGHT_SHRUNK = 52;

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerHeight = scrolled ? HEADER_HEIGHT_SHRUNK : HEADER_HEIGHT_FULL;

  return (
    <div className="fixed left-0 right-0 z-50 transition-all duration-300" style={{ top: TOP_BAR_HEIGHT }} onMouseLeave={() => setOpenMega(null)}>
      <header className="bg-primary transition-all duration-300" style={{ height: headerHeight }}>
        <div className="container mx-auto flex items-center justify-between h-full px-4 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Prime College" className={`transition-all duration-300 w-auto ${scrolled ? "h-10" : "h-16"}`} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {simpleNavItems.slice(0, 2).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 rounded"
              >
                {item.label}
              </Link>
            ))}

            {/* Category Nav Items */}
            {categoryNavItems.map((cat) => (
              <button
                key={cat.label}
                className={`text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 rounded flex items-center gap-1 ${openMega === cat.label ? "bg-primary/80" : ""}`}
                onMouseEnter={() => setOpenMega(cat.label)}
              >
                {cat.label}
                <ChevronDown className="w-3 h-3" />
              </button>
            ))}

            {simpleNavItems.slice(2).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 rounded"
              >
                {item.label}
              </Link>
            ))}

            <Link
              to="/login"
              className="ml-2 bg-secondary text-secondary-foreground px-5 py-2 text-sm font-semibold rounded hover:opacity-90"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Cart + Toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              className="text-primary-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mega Menu Panel - rendered outside header but inside hover wrapper */}
      {openMega && (
        <div className="hidden lg:block bg-popover border-t border-border shadow-lg">
          <div className="container mx-auto p-6">
            {categoryNavItems
              .filter((cat) => cat.label === openMega)
              .map((cat) => (
                <div key={cat.label}>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4 tracking-wider">
                    {cat.label} Qualifications
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    {cat.qualifications.map((q) => (
                      <Link
                        key={q.label}
                        to={q.href}
                        className="text-sm text-foreground hover:text-primary py-2 px-3 rounded hover:bg-muted block"
                        onClick={() => setOpenMega(null)}
                      >
                        {q.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-primary border-t border-primary-foreground/20 px-4 pb-4">
          {simpleNavItems.slice(0, 2).map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="block text-primary-foreground py-2 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {categoryNavItems.map((cat) => (
            <div key={cat.label}>
              <button
                className="flex items-center justify-between w-full text-primary-foreground py-2 text-sm font-medium"
                onClick={() =>
                  setMobileExpanded(mobileExpanded === cat.label ? null : cat.label)
                }
              >
                {cat.label}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    mobileExpanded === cat.label ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileExpanded === cat.label && (
                <div className="pl-4 pb-2">
                  {cat.qualifications.map((q) => (
                    <Link
                      key={q.label}
                      to={q.href}
                      className="block text-primary-foreground/80 py-1 text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      {q.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {simpleNavItems.slice(2).map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="block text-primary-foreground py-2 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            to="/login"
            className="block mt-2 bg-secondary text-secondary-foreground px-5 py-2 text-sm font-semibold rounded text-center"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export { HEADER_HEIGHT_FULL, HEADER_HEIGHT_SHRUNK, TOP_BAR_HEIGHT };
export default Header;
