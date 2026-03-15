import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchContent } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import Breadcrumb from "@/components/Breadcrumb";

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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}

interface BlogData {
  posts: BlogPost[];
  categories: string[];
}

const Blog = () => {
  const [data, setData] = useState<BlogData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    fetchContent<BlogData>("blog").then(setData);
  }, []);

  if (!data) return <LoadingSpinner />;

  const filtered = activeCategory === "All"
    ? data.posts
    : data.posts.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Banner */}
      <section className="relative h-[260px] overflow-hidden">
        <img src={contactBanner} alt="Blog" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="absolute inset-0 flex items-end pb-10">
          <div className="container mx-auto px-4">
            <Breadcrumb variant="overlay" items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-2">Blog & News</h1>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 py-4 flex flex-wrap gap-2">
          {["All", ...data.categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="bg-card border border-border rounded-xl overflow-hidden group block"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={heroImageMap[post.image] || heroClassroom}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <span className="text-sm font-semibold text-primary">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
