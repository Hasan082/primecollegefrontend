import { useState } from "react";
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
      { label: "OTHM Level 4 Diploma in Business Management", href: "/qualifications" },
      { label: "OTHM Level 5 Extended Diploma in Business Management", href: "/qualifications" },
      { label: "OTHM Level 6 Diploma in Business Management", href: "/qualifications" },
    ],
  },
  {
    label: "Management",
    qualifications: [
      { label: "OTHM Level 7 Diploma in Strategic Management and Leadership", href: "/qualifications" },
      { label: "QUALIFI Level 7 Diploma in Strategic Management and Leadership", href: "/qualifications" },
    ],
  },
  {
    label: "Care",
    qualifications: [
      { label: "QUALIFI Level 3 Diploma in Health and Social Care", href: "/qualifications" },
      { label: "OTHM Level 5 Diploma in Health and Social Care Management", href: "/qualifications" },
      { label: "OTHM Level 7 Diploma in Healthcare Management", href: "/qualifications" },
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

const HEADER_HEIGHT = 72;

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <header className="bg-primary sticky top-0 z-50" style={{ height: HEADER_HEIGHT }}>
      <div className="container mx-auto flex items-center justify-between h-full px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Prime College" className="h-12 w-auto" />
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

          {/* Category Nav Items with Mega Menus */}
          {categoryNavItems.map((cat) => (
            <div
              key={cat.label}
              className="relative"
              onMouseEnter={() => setOpenMega(cat.label)}
              onMouseLeave={() => setOpenMega(null)}
            >
              <button className="text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 rounded flex items-center gap-1">
                {cat.label}
                <ChevronDown className="w-3 h-3" />
              </button>

              {openMega === cat.label && (
                <div className="fixed left-0 right-0 top-[72px] bg-popover border-t border-border shadow-lg z-50">
                  <div className="container mx-auto p-6">
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
                </div>
              )}
            </div>
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
            className="ml-4 bg-secondary text-secondary-foreground px-5 py-2 text-sm font-semibold rounded hover:opacity-90"
          >
            Login
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

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
    </header>
  );
};

export { HEADER_HEIGHT };
export default Header;
