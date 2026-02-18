import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

interface MegaMenuItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  megaMenu?: MegaMenuItem[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    megaMenu: [
      { label: "Our Mission", href: "/about" },
      { label: "Our Vision", href: "/about" },
      { label: "Our Values", href: "/about" },
      { label: "Our Team", href: "/about" },
      { label: "Accreditations", href: "/about" },
    ],
  },
  {
    label: "Qualifications",
    megaMenu: [
      { label: "Business Level 4", href: "/qualifications" },
      { label: "Business Level 5", href: "/qualifications" },
      { label: "Business Level 6", href: "/qualifications" },
      { label: "Management Level 7", href: "/qualifications" },
      { label: "Strategic Leadership", href: "/qualifications" },
      { label: "Health & Social Care L3", href: "/qualifications" },
      { label: "Health & Social Care L5", href: "/qualifications" },
      { label: "Healthcare Management L7", href: "/qualifications" },
      { label: "All Qualifications", href: "/qualifications" },
      { label: "Entry Requirements", href: "/qualifications" },
    ],
  },
  {
    label: "Recruitment",
    megaMenu: [
      { label: "Current Openings", href: "/recruitment" },
      { label: "Academic Roles", href: "/recruitment" },
      { label: "Admin Roles", href: "/recruitment" },
      { label: "How to Apply", href: "/recruitment" },
      { label: "Benefits", href: "/recruitment" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);

  return (
    <header className="bg-primary sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-primary-foreground text-2xl font-bold tracking-wide">
            PRIME COLLEGE
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.megaMenu && setOpenMega(item.label)}
              onMouseLeave={() => setOpenMega(null)}
            >
              {item.href && !item.megaMenu ? (
                <Link
                  to={item.href}
                  className="text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <button className="text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 rounded flex items-center gap-1">
                  {item.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
              )}

              {/* Mega Menu */}
              {item.megaMenu && openMega === item.label && (
                <div className="absolute top-full left-0 bg-popover border border-border shadow-lg rounded z-50 min-w-[600px] p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                    {item.megaMenu.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.href}
                        className="text-sm text-foreground hover:text-primary py-1 block"
                        onClick={() => setOpenMega(null)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
        <div className="lg:hidden bg-primary border-t border-primary/80 px-4 pb-4">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.href && !item.megaMenu ? (
                <Link
                  to={item.href}
                  className="block text-primary-foreground py-2 text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    className="flex items-center justify-between w-full text-primary-foreground py-2 text-sm font-medium"
                    onClick={() =>
                      setOpenMega(openMega === item.label ? null : item.label)
                    }
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        openMega === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openMega === item.label && item.megaMenu && (
                    <div className="pl-4 pb-2">
                      {item.megaMenu.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className="block text-primary-foreground/80 py-1 text-sm"
                          onClick={() => setMobileOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
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

export default Header;
