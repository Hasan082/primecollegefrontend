import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Breadcrumb from "@/components/Breadcrumb";
import type { PageConfig, ContentBlock } from "@/types/pageBuilder";
import { defaultPages } from "@/data/defaultPages";
import { safeParseBlocks } from "@/utils/pageBuilder";

import heroClassroom from "@/assets/hero-classroom.jpg";
import heroBusiness from "@/assets/hero-business.jpg";
import heroLeadership from "@/assets/hero-leadership.jpg";
import heroExecutive from "@/assets/hero-executive.jpg";
import heroCare from "@/assets/hero-care.jpg";

const heroImageMap: Record<string, string> = {
  classroom: heroClassroom,
  business: heroBusiness,
  leadership: heroLeadership,
  executive: heroExecutive,
  care: heroCare,
};

const BlogDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();

  const allBlogPosts = defaultPages.filter((p) => p.type === "blog-post");
  const post = allBlogPosts.find(
    (p) =>
      p.slug === `/blogs/${slug}` ||
      p.slug === `/blog/${slug}` ||
      p.id === `blog-${slug}` ||
      p.slug.endsWith(`/${slug}`)
  );

  // Category counts
  const categoryCounts: Record<string, number> = {};
  allBlogPosts.forEach((p) => {
    const cat = p.blogMeta?.category || "Uncategorised";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const relatedPosts = allBlogPosts.filter((p) => p.id !== post?.id).slice(0, 2);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
        <Link to="/blogs" className="text-primary hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  const meta = post.blogMeta || {};
  const featuredImage = heroImageMap[meta.image || "classroom"] || heroClassroom;

  return (
    <div>
      <Breadcrumb items={[{ label: "Blogs", href: "/blogs" }, { label: post.title }]} />

      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <article className="lg:col-span-2">
              {/* Featured Image */}
              <div className="rounded-xl overflow-hidden mb-8">
                <img
                  src={featuredImage}
                  alt={post.title}
                  className="w-full h-[300px] md:h-[420px] object-cover"
                />
              </div>

              {/* Category dot */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {meta.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-border">
                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <User className="w-4 h-4" /> {meta.author}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" /> {meta.date}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" /> {meta.readTime}
                </span>
              </div>

              {/* Page Builder Blocks */}
              <div className="space-y-6">
                {safeParseBlocks(post.blocks)
                  .filter((b) => b.type !== "hero") // Skip hero blocks (used as featured image above)
                  .map((block) => (
                    <BlogBlockRenderer key={block.id} block={block} />
                  ))}
              </div>

              {/* Back Link */}
              <div className="mt-12 pt-8 border-t border-border">
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Search */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-base font-bold text-foreground mb-1">Search</h3>
                <div className="w-8 h-0.5 bg-primary mb-4" />
                <div className="relative">
                  <Input placeholder="Search..." className="pr-10" />
                  <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-base font-bold text-foreground mb-1">Categories</h3>
                <div className="w-8 h-0.5 bg-primary mb-4" />
                <div className="space-y-0">
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-muted-foreground">{cat}</span>
                      <span className="text-sm text-muted-foreground">({count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-base font-bold text-foreground mb-1">Related Articles</h3>
                  <div className="w-8 h-0.5 bg-primary mb-4" />
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        to={related.slug}
                        className="group block"
                      >
                        <div className="aspect-[16/9] rounded-lg overflow-hidden mb-2">
                          <img
                            src={heroImageMap[related.blogMeta?.image || "classroom"] || heroClassroom}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{related.blogMeta?.date}</span>
                        <h4 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                          {related.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Card */}
              <div className="bg-primary rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-primary-foreground mb-2">Ready to Start?</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Explore our qualifications and take the next step in your career.
                </p>
                <Link
                  to="/qualifications"
                  className="inline-block bg-secondary text-secondary-foreground px-6 py-2.5 text-sm font-semibold rounded hover:opacity-90"
                >
                  View Qualifications
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Renders a single page builder block in blog context */
const BlogBlockRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as Record<string, unknown>;

  switch (block.type) {
    case "text": {
      const content = d.content as string;
      const isHtml = content?.startsWith("<");
      return (
        <div>
          {d.title && (
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{d.title as string}</h2>
          )}
          {isHtml ? (
            <div
              className="prose prose-lg max-w-none text-muted-foreground leading-relaxed
                prose-headings:text-foreground prose-headings:font-bold
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                prose-li:text-muted-foreground prose-strong:text-foreground
                prose-ul:my-4 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">{content}</p>
          )}
        </div>
      );
    }

    case "image-text":
      return (
        <div className={`flex flex-col md:flex-row gap-6 ${d.imagePosition === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}>
          {d.image && (
            <div className="md:w-1/2 rounded-xl overflow-hidden">
              <img src={d.image as string} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="md:w-1/2">
            <h2 className="text-xl font-bold text-foreground mb-3">{d.headline as string}</h2>
            {Array.isArray(d.paragraphs) && (d.paragraphs as string[]).map((p, i) => (
              p.startsWith("<") ? (
                <div key={i} className="text-muted-foreground leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: p }} />
              ) : (
                <p key={i} className="text-muted-foreground leading-relaxed mb-3">{p}</p>
              )
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="bg-primary rounded-xl p-8 text-center my-6">
          <h3 className="text-xl font-bold text-primary-foreground mb-2">{d.title as string}</h3>
          {d.content && <p className="text-primary-foreground/80 mb-4">{d.content as string}</p>}
          {d.ctaLabel && d.ctaHref && (
            <Link
              to={d.ctaHref as string}
              className="inline-block bg-secondary text-secondary-foreground px-6 py-2.5 font-semibold rounded hover:opacity-90"
            >
              {d.ctaLabel as string}
            </Link>
          )}
        </div>
      );

    case "stats":
      return (
        <div className="bg-primary rounded-xl p-8 text-center my-6">
          {d.title && <h3 className="text-xl font-bold text-primary-foreground mb-4">{d.title as string}</h3>}
          <div className="grid grid-cols-3 gap-4">
            {Array.isArray(d.items) && (d.items as { value: string; title: string }[]).map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">{item.value}</p>
                <p className="text-sm text-secondary font-semibold">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="my-6">
          {d.title && <h2 className="text-xl font-bold text-foreground mb-4">{d.title as string}</h2>}
          <div className="space-y-3">
            {Array.isArray(d.items) && (d.items as { question: string; answer: string }[]).map((item, i) => (
              <details key={i} className="border border-border rounded-lg">
                <summary className="px-4 py-3 cursor-pointer font-medium text-foreground">{item.question}</summary>
                <div className="px-4 pb-3 text-muted-foreground text-sm">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default BlogDetail;
