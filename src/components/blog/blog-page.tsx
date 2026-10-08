import { useInteractive } from "@/hooks/use-interactive";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { CTA, Heading, InnerHero } from "@/components/shared/page";
import { type Article } from "@/data/blog";
import { useContent } from "@/lib/cms/context";
import type { PublicContent } from "@/lib/cms/public";
export function ArticleArt({ type }: { type: string }) {
  return (
    <div
      className={`article-art art-${type}`}
      role="img"
      aria-label={
        type === "website"
          ? "Abstract browser layout illustration"
          : type === "commerce"
            ? "Abstract shopping bag illustration"
            : "Abstract growth chart illustration"
      }
    >
      {type === "website" ? (
        <div className="art-browser">
          <span>● ● ●</span>
          <div>
            <i />
            <i />
            <i />
          </div>
        </div>
      ) : type === "commerce" ? (
        <div className="art-bag">
          <span />
          w.
        </div>
      ) : (
        <div className="art-chart">
          <i />
          <i />
          <i />
          <i />
          <ArrowUpRight />
        </div>
      )}
      <span className="art-caption">WEBAKOOF / INSIGHTS & IDEAS</span>
    </div>
  );
}
const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
export function ArticleCard({ article: a }: { article: PublicContent["articles"][number] }) {
  return (
    <article className="article-card">
      <Link to="/blog/$slug" params={{ slug: a.slug }} aria-label={`Read ${a.title}`}>
        {a.image ? (
          <img
            src={a.image}
            alt={a.imageAlt || a.title}
            className="cms-article-image"
            loading="lazy"
          />
        ) : (
          <ArticleArt type={a.art} />
        )}
      </Link>
      <div className="article-meta">
        <span>{a.category}</span>
        <time dateTime={a.date}>{dateLabel(a.date)}</time>
      </div>
      <h3>
        <Link to="/blog/$slug" params={{ slug: a.slug }}>
          {a.title}
        </Link>
      </h3>
      <p>{a.excerpt}</p>
      <Link to="/blog/$slug" params={{ slug: a.slug }} className="text-link">
        Read Article <ArrowUpRight size={18} />
      </Link>
    </article>
  );
}
export function BlogPage() {
  const { articles, blogCategories } = useContent();
  const interactive = useInteractive();
  const [category, setCategory] = useState("All");
  const featured = articles[0]!;
  const filtered = articles.filter((a) => category === "All" || a.category === category);
  return (
    <>
      <InnerHero
        className="blog-breadcrumb-hero"
        label="Insights & ideas"
        title="Ideas that help businesses grow digitally."
        description="Practical thinking on better websites, clearer experiences and the decisions behind digital growth."
      />
      {featured && (
        <section className="section-shell featured-article">
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            aria-label={`Read ${featured.title}`}
          >
            {featured.image ? (
              <img
                src={featured.image}
                alt={featured.imageAlt || featured.title}
                className="cms-article-image"
              />
            ) : (
              <ArticleArt type={featured.art} />
            )}
          </Link>
          <div>
            <p className="eyebrow">THE FEATURED READ / {featured.category}</p>
            <h2>
              <Link to="/blog/$slug" params={{ slug: featured.slug }}>
                {featured.title}
              </Link>
            </h2>
            <p>{featured.excerpt}</p>
            <p className="article-meta">
              <time dateTime={featured.date}>{dateLabel(featured.date)}</time>
              <span>{featured.readTime}</span>
            </p>
            <Link to="/blog/$slug" params={{ slug: featured.slug }} className="action">
              Read Article <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      )}
      <section className="section-space surface">
        <div className="section-shell">
          <Heading label="THE JOURNAL" title="A little perspective goes a long way." />
          <div className="filter-bar" aria-label="Filter articles">
            {["All", ...blogCategories].map((c) => (
              <button
                key={c}
                disabled={!interactive}
                aria-pressed={c === category}
                className={category === c ? "selected" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="result-count" role="status">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </p>
          <div className="article-grid">
            {filtered.map((a) => (
              <ArticleCard article={a} key={a.slug} />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <h2>More ideas are on the way.</h2>
              <p>Explore our published articles while this collection grows.</p>
              <button className="action" onClick={() => setCategory("All")}>
                All articles <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
      <CTA title="Let’s put good thinking into practice." />
    </>
  );
}
export function BlogDetailPage({ article: a }: { article: PublicContent["articles"][number] }) {
  const { articles } = useContent();
  return (
    <>
      <InnerHero
        label={a.category}
        title={a.title}
        description={a.excerpt}
        parent={{ label: "Blog", to: "/blog" }}
      />
      <div className="section-shell article-cover">
        <div className="article-meta">
          <span>{a.author || "Webakoof Editorial"}</span>
          <time dateTime={a.date}>{dateLabel(a.date)}</time>
          <span>{a.readTime}</span>
        </div>
        {a.image ? (
          <img src={a.image} alt={a.imageAlt || a.title} className="cms-article-image" />
        ) : (
          <ArticleArt type={a.art} />
        )}
      </div>
      <div className="section-shell article-layout">
        <aside className="table-of-contents">
          <p className="eyebrow">IN THIS ARTICLE</p>
          <nav aria-label="Table of contents">
            {a.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
        <article className="article-body">
          {a.html ? (
            <div className="cms-rich-content" dangerouslySetInnerHTML={{ __html: a.html }} />
          ) : (
            a.sections.map((s, i) => (
              <section id={s.id} key={s.id}>
                <h2>{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {i === 0 && <blockquote>{a.quote}</blockquote>}
                {i === 1 && (
                  <figure>
                    <ArticleArt type={a.art} />
                    <figcaption>A Webakoof illustration of {a.category.toLowerCase()}.</figcaption>
                  </figure>
                )}
              </section>
            ))
          )}
        </article>
      </div>
      <section className="section-space surface">
        <div className="section-shell">
          <Heading label="KEEP EXPLORING" title="A few more ideas for your next move." />
          <div className="article-grid related-articles">
            {articles
              .filter((item) => item.slug !== a.slug)
              .map((item) => (
                <ArticleCard article={item} key={item.slug} />
              ))}
          </div>
        </div>
      </section>
      <CTA title="Have a question about your own website?" />
    </>
  );
}
