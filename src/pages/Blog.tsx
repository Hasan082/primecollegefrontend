import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Breadcrumb from "@/components/Breadcrumb";
import { defaultPages } from "@/data/defaultPages";

import heroClassroom from "@/assets/hero-classroom.jpg";
import heroBusiness from "@/assets/hero-business.jpg";
import heroLeadership from "@/assets/hero-leadership.jpg";
import heroExecutive from "@/assets/hero-executive.jpg";
import heroCare from "@/assets/hero-care.jpg";
import contactBanner from "@/assets/contact-banner.jpg";

const heroImageMap: Record<string, string> = {
  classroom: heroClassroom,
  business: heroBusiness,
  leadership: heroLeadership,
  executive: heroExecutive,
  care: heroCare,
};

const Blog = () => {
  const allBlogPosts = defaultPages.filter((p) => p.type === "blog-post");
  const categories = [...new Set(allBlogPosts.map((p) => p.blogMeta?.category).filter(Boolean))] as string[];
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allBlogPosts.filter((p) => {
    const catMatch = activeCategory === "All" || p.blogMeta?.category === activeCategory;
    const searchMatch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img src={contactBanner} alt="Blog" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Blog & News</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">Latest news, insights and career advice from The Prime College.</p>
          </div>
        </div>
      </div>
      <Breadcrumb items={[{ label: "Blog" }]} />

      <div className="bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          {/* Search + Filter Row */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search posts..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {["All", ...categories].map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={post.slug}
                className="bg-card border border-border rounded-xl overflow-hidden group block"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={heroImageMap[post.blogMeta?.image || "classroom"] || heroClassroom}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                      {post.blogMeta?.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.blogMeta?.date}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {post.blogMeta?.excerpt}
                  </p>
                  <span className="text-sm font-semibold text-primary">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
