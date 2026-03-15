import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "default" | "overlay";
}

const Breadcrumb = ({ items, variant = "default" }: BreadcrumbProps) => {
  const isOverlay = variant === "overlay";

  return (
    <nav
      aria-label="Breadcrumb"
      className={isOverlay ? "" : "bg-accent/40 border-b border-border"}
    >
      <div className={isOverlay ? "" : "container mx-auto py-3"}>
        <ol className="flex items-center flex-wrap gap-1 text-sm">
          <li className="flex items-center">
            <Link
              to="/"
              className={`hover:opacity-80 transition-colors flex items-center gap-1 ${
                isOverlay ? "text-primary-foreground/70" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight
                className={`w-3.5 h-3.5 mx-1 ${
                  isOverlay ? "text-primary-foreground/40" : "text-muted-foreground/60"
                }`}
              />
              {item.href ? (
                <Link
                  to={item.href}
                  className={`hover:opacity-80 transition-colors ${
                    isOverlay ? "text-primary-foreground/70" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isOverlay ? "text-primary-foreground font-medium" : "text-foreground font-medium"}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
