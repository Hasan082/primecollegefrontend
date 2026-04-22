/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import logo from "@/assets/prime-logo-white-notext.png";
import { useAuth } from "@/contexts/AuthContext";
import { appConfig } from "@/app.config";
import { useGetNavbarPublicQuery } from "@/redux/apis/navbarApi";
import { Button } from "./ui/button";

const TOP_BAR_HEIGHT = 36;
const HEADER_HEIGHT_FULL = 80;
const HEADER_HEIGHT_SHRUNK = 60;

const getCategorySlug = (label: string) => encodeURIComponent(label);

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { data } = useGetNavbarPublicQuery(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = data?.data?.dynamicNavLinks || [];

  const sortByOrder = (a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0);

  // Single source of truth: only active items, sorted by order
  const allNavItems = navItems
    .filter((item: any) => item.is_active)
    .sort(sortByOrder);

  const headerHeight = scrolled ? HEADER_HEIGHT_SHRUNK : HEADER_HEIGHT_FULL;

  return (
    <div
      className="fixed left-0 right-0 z-50 transition-all duration-300"
      style={{ top: TOP_BAR_HEIGHT }}
      onMouseLeave={() => {
        setOpenMega(null);
        setOpenDropdown(null);
      }}
    >
      <header
        className="bg-primary transition-all duration-300"
        style={{ height: headerHeight }}
      >
        <div className="container mx-auto flex items-center justify-between h-full px-4 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Prime College"
              className={`transition-all duration-300 w-auto ${scrolled ? "h-10" : "h-16"}`}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0">
            {allNavItems.map((item: any) => {
              const activeChildren = (item.children || [])
                .filter((child: any) => child.is_active)
                .sort(sortByOrder);

              // Mega menu
              if (item.is_mega_menu) {
                return (
                  <button
                    key={item.label}
                    className={`relative text-primary-foreground mx-2.5 py-1.5 text-xs font-medium flex items-center gap-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full ${openMega === item.label ? "after:w-full" : ""}`}
                    onMouseEnter={() => {
                      setOpenMega(item.label);
                      setOpenDropdown(null);
                    }}
                    onClick={() => {
                      setOpenMega(null);
                      navigate(
                        `/qualifications?category=${getCategorySlug(item.label)}`,
                      );
                    }}
                  >
                    {item.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                );
              }

              // Dropdown
              if (item.is_dropdown) {
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => {
                      setOpenDropdown(item.label);
                      setOpenMega(null);
                    }}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`relative text-primary-foreground mx-2.5 py-1.5 text-xs font-medium flex items-center gap-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full ${openDropdown === item.label ? "after:w-full" : ""}`}
                      onClick={() => navigate(item.href || "/")}
                    >
                      {item.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 pt-1 w-56 z-50">
                        <div className="bg-[#042F5C] border border-white/10 rounded shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          {activeChildren.map((child: any) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="group flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-white/90 hover:bg-white/5 hover:text-secondary transition-all"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span>{child.label}</span>

                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Simple link
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="relative text-primary-foreground mx-2.5 py-1.5 text-xs font-medium after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full"
                  onMouseEnter={() => {
                    setOpenMega(null);
                    setOpenDropdown(null);
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4">
                <Link
                  to={
                    user?.role === "admin"
                      ? appConfig.ADMIN_REDIRECT
                      : user?.role === "trainer"
                        ? appConfig.TRAINER_REDIRECT
                        : user?.role === "iqa"
                          ? appConfig.IQA_REDIRECT
                          : appConfig.LERNER_REDIRECT
                  }
                  className="bg-secondary text-secondary-foreground px-4 py-1.5 text-xs font-semibold rounded hover:opacity-90 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setOpenProfile(true)}
                  onMouseLeave={() => setOpenProfile(false)}
                >
                  <button className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors">
                    <User className="w-4 h-4" />
                  </button>

                  {openProfile && (
                    <div className="absolute top-full right-0 mt-0 pt-2 w-48 z-50">
                      <div className="bg-popover border border-border rounded-lg shadow-lg py-2 overflow-hidden">
                        <div className="px-4 py-2 border-b border-border mb-1">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                            Account
                          </p>
                          <p className="text-xs font-medium text-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                        {user?.role === "learner" && (
                          <Link
                            to="/learner/profile"
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <User className="w-3.5 h-3.5" />
                            My Profile
                          </Link>
                        )}
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-muted transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 bg-secondary text-secondary-foreground px-4 py-1.5 text-xs font-semibold rounded hover:opacity-90"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              className="text-primary-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mega Menu Panel */}
      {openMega && (
        <div className="container mx-auto hidden lg:block bg-[#042F5C] text-white border-t border-white/10 shadow-2xl">
          <div className=" p-10">
            {allNavItems
              .filter(
                (item: any) => item.is_mega_menu && item.label === openMega,
              )
              .map((item: any) => {
                const activeChildren = (item.children || [])
                  .filter((child: any) => child.is_active)
                  .sort(sortByOrder);
                return (
                  <div key={item.label}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
                      {activeChildren.map((q: any) => (
                        <div key={q.label} className="flex flex-col h-full">
                          <div className="mb-3 flex-1">
                            <div className="flex items-center gap-2 mb-3">

                              <h5 className="text-sm font-bold text-[#e5e7eb] flex items-center gap-1">
                                {q.label}

                              </h5>
                            </div>
                            {q.short_description ? (
                              <p className="text-xs text-[#d1d5db] leading-relaxed line-clamp-3 mb-4">
                                {q.short_description}
                              </p>
                            ) : (
                              <p className="text-xs text-[#d1d5db] leading-relaxed line-clamp-3 mb-4 opacity-0">
                                Placeholder description for layout consistency...
                              </p>
                            )}
                          </div>
                          <Link
                            to={q.href}
                            className="w-fit"
                            onClick={() => setOpenMega(null)}
                          >
                            <Button className="bg-secondary hover:bg-secondary/90 text-primary text-[10px] font-bold h-7 px-4 rounded-sm border-none transition-colors">
                              Read more
                            </Button>
                          </Link >
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )
      }

      {/* Mobile Menu */}
      {
        mobileOpen && (
          <div className="lg:hidden bg-primary border-t border-primary-foreground/20 px-4 pb-4">
            {allNavItems.map((item: any) => {
              const activeChildren = (item.children || [])
                .filter((child: any) => child.is_active)
                .sort(sortByOrder);

              // Dropdown
              if (item.is_dropdown) {
                return (
                  <div key={item.label}>
                    <button
                      className="flex items-center justify-between w-full text-primary-foreground py-2 text-sm font-medium"
                      onClick={() =>
                        setMobileExpanded(
                          mobileExpanded === item.label ? null : item.label,
                        )
                      }
                    >
                      <Link
                        to={item.href || "/"}
                        onClick={() => setMobileOpen(false)}
                        className="text-primary-foreground"
                      >
                        {item.label}
                      </Link>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                      />
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="pl-4  pb-2">
                        {activeChildren.map((child: any) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block text-primary-foreground/80 py-1 text-sm"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Mega menu
              if (item.is_mega_menu) {
                return (
                  <div key={item.label}>
                    <button
                      className="flex items-center justify-between w-full text-primary-foreground py-2 text-sm font-medium"
                      onClick={() =>
                        setMobileExpanded(
                          mobileExpanded === item.label ? null : item.label,
                        )
                      }
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                      />
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="pl-4 pb-4 space-y-3 mt-2">
                        {activeChildren.map((q: any) => (
                          <div key={q.label} className="border-l-2 border-secondary/30 pl-3 py-1">
                            <div className="flex flex-col gap-1">
                              <span className="text-primary-foreground font-semibold text-sm">{q.label}</span>
                              {q.short_description && (
                                <span className="text-primary-foreground/60 text-[10px] leading-tight line-clamp-2">
                                  {q.short_description}
                                </span>
                              )}
                              <Link
                                to={q.href}
                                className="mt-2"
                                onClick={() => setMobileOpen(false)}
                              >
                                <Button size="sm" className="h-7 text-[10px] bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                  View Detail
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Simple link
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block text-primary-foreground py-2 text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/login"
              className="block mt-2 bg-secondary text-secondary-foreground px-5 py-2 text-sm font-semibold rounded text-center"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </div>
        )
      }
    </div >
  );
};

export { HEADER_HEIGHT_FULL, HEADER_HEIGHT_SHRUNK, TOP_BAR_HEIGHT };
export default Header;
