import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react";
import { fetchContent } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import Breadcrumb from "@/components/Breadcrumb";

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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
  content: string;
}

interface BlogData {
  posts: BlogPost[];
}

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<BlogData>("blog").then((data) => {
      const found = data.posts.find((p) => p.id === id || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === id);
      setPost(found || null);
      if (found) {
        setRelatedPosts(
          data.posts.filter((p) => p.id !== id).slice(0, 2)
        );
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
        <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[350px] md:h-[420px] overflow-hidden">
        <img
          src={heroImageMap[post.image] || heroClassroom}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <Breadcrumb
              variant="overlay"
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/" },
                { label: post.title },
              ]}
            />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mt-4 max-w-3xl leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-primary-foreground/80 text-sm">
                <Calendar className="w-4 h-4" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5 text-primary-foreground/80 text-sm">
                <Clock className="w-4 h-4" /> {post.readTime}
              </span>
              <span className="flex items-center gap-1.5 text-primary-foreground/80 text-sm">
                <User className="w-4 h-4" /> {post.author}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <article className="lg:col-span-2">
              <div
                className="prose prose-lg max-w-none text-foreground
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                  prose-li:text-muted-foreground
                  prose-strong:text-foreground
                  prose-ul:my-4 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Back Link */}
              <div className="mt-12 pt-8 border-t border-border">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Author Card */}
              <div className="bg-muted rounded-xl p-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">About the Author</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{post.author}</p>
                    <p className="text-xs text-muted-foreground">Professional Qualifications Provider</p>
                  </div>
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-muted rounded-xl p-6">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        to={`/blog/${related.id}`}
                        className="group block"
                      >
                        <div className="aspect-[16/9] rounded-lg overflow-hidden mb-2">
                          <img
                            src={heroImageMap[related.image] || heroClassroom}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{related.date}</span>
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
      </section>
    </div>
  );
};

export default BlogDetail;
