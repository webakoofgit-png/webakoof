import { useInteractive } from "@/hooks/use-interactive";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowUpRight, Download } from "lucide-react";
import { CTA, Heading, InnerHero } from "@/components/shared/page";
import { type Project } from "@/data/projects";
import { isWebsiteLive } from "@/lib/cms/availability";
import { useContent } from "@/lib/cms/context";
import type { PublicContent } from "@/lib/cms/public";
import { getCatalogue } from "@/lib/cms/public";
export function ProjectCard({
  project: p,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const projectVisual = (
    <>
      <img
        src={p.image}
        alt={`${p.name} responsive website`}
        width={1408}
        height={1008}
        loading="lazy"
      />
      <span className="project-overlay">
        View Case Study <ArrowUpRight />
      </span>
    </>
  );
  return (
    <article className={`project-card ${featured ? "project-featured" : ""}`}>
      <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="project-image">
        {projectVisual}
      </Link>
      <div className="project-meta">
        <span>
          {"categoryNames" in p && Array.isArray(p.categoryNames)
            ? p.categoryNames.join(" / ")
            : p.industry}{" "}
          / {p.isConcept === false ? "Published project" : "Design concept"}
        </span>
        <Link
          to="/portfolio/$slug"
          params={{ slug: p.slug }}
          aria-label={`View ${p.name} case study`}
        >
          <ArrowUpRight />
        </Link>
      </div>
      <h3>
        <Link to="/portfolio/$slug" params={{ slug: p.slug }}>
          {p.name}
        </Link>
      </h3>
      <p>{p.description}</p>
      <p className="project-service">{p.service}</p>
      <div className="tags">
        {p.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </article>
  );
}
export function PortfolioPage() {
  const { projects, portfolioSectors = [], enabled } = useContent();
  const interactive = useInteractive();
  const { sector } = useSearch({ from: "/portfolio/" });
  const navigate = useNavigate({ from: "/portfolio/" });
  const selected = portfolioSectors.find((category) => category.slug === sector);
  const filter = selected?.name || "All";
  const visible = projects.filter(
    (p) =>
      !selected ||
      (enabled
        ? p.categorySlugs?.includes(selected.slug) || p.categorySlug === selected.slug
        : p.industry === selected.name),
  );
  const [preparing, setPreparing] = useState(false);
  const downloading = useRef(false);
  const [downloadError, setDownloadError] = useState("");
  const setFilter = (slug?: string) => {
    setDownloadError("");
    void navigate({ search: { sector: slug } });
  };
  const catalogueAvailable = enabled && visible.some((p) => p.include_in_catalogue === true);
  async function download() {
    if (downloading.current) return;
    downloading.current = true;
    setPreparing(true);
    setDownloadError("");
    try {
      const content = await getCatalogue({ data: { sector: selected?.slug } });
      const { downloadCatalogue } = await import("@/lib/cms/catalogue-pdf");
      await downloadCatalogue(content, selected?.slug);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Unable to prepare catalogue. Please try again.",
      );
    } finally {
      downloading.current = false;
      setPreparing(false);
    }
  }
  return (
    <>
      <InnerHero
        className="portfolio-breadcrumb-hero"
        label="Selected work"
        title="Projects built to solve real business problems."
        description="A closer look at digital experiences across industries, from published websites to considered design concepts."
      />
      <section className="section-space">
        <div className="section-shell">
          <div className="portfolio-toolbar">
            <div className="filter-bar" aria-label="Filter projects">
              {[{ name: "All", slug: "" }, ...portfolioSectors].map((f) => (
                <button
                  key={f.slug}
                  disabled={!interactive}
                  aria-pressed={selected?.slug === f.slug || (!selected && !f.slug)}
                  className={selected?.slug === f.slug || (!selected && !f.slug) ? "selected" : ""}
                  onClick={() => setFilter(f.slug || undefined)}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="portfolio-toolbar-actions">
              <p className="result-count" role="status">
                {visible.length} {visible.length === 1 ? "Project" : "Projects"} · {filter}
              </p>
              {catalogueAvailable && (
                <button
                  className="catalogue-download"
                  disabled={!interactive || preparing}
                  onClick={download}
                  aria-busy={preparing}
                >
                  <Download size={15} />{" "}
                  {preparing
                    ? "Preparing Catalogue..."
                    : selected
                      ? `Download ${selected.name} Catalogue`
                      : "Download Complete Portfolio"}
                </button>
              )}
            </div>
          </div>
          {downloadError && (
            <p className="catalogue-error" role="alert">
              {downloadError}
            </p>
          )}
          <div className="portfolio-grid editorial-projects">
            {visible.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
          {visible.length === 0 && (
            <div className="empty-state">
              <h2>A new perspective is on the way.</h2>
              <p>No projects available in this sector yet.</p>
              <button className="action" onClick={() => setFilter()}>
                View all projects <ArrowUpRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
      <CTA title="Your business. Our next great challenge." />
    </>
  );
}
export function ProjectDetailPage({ project: p }: { project: PublicContent["projects"][number] }) {
  return (
    <>
      <InnerHero
        label={p.name}
        title={p.name}
        description={p.description}
        parent={{ label: "Portfolio", to: "/portfolio" }}
      />
      <div className="section-shell">
        <img
          className="case-main-image"
          src={p.image}
          alt={`${p.name} complete responsive design concept`}
          width={1408}
          height={1008}
          fetchPriority="high"
        />
        {p.liveUrl && isWebsiteLive(p) && (
          <div className="case-actions">
            <a className="action" href={p.liveUrl} target="_blank" rel="noreferrer">
              Visit {p.name} <ArrowUpRight size={18} />
            </a>
          </div>
        )}
        {!isWebsiteLive(p) && (
          <p className="case-availability-notice">
            This project was designed and developed by Webakoof. The live website is currently
            unavailable, but you can explore the project details and screenshots here.
          </p>
        )}
      </div>
      <section className="section-space">
        <div className="section-shell editorial-split">
          <Heading label="01 / PROJECT OVERVIEW" title="An experience with a clear purpose." />
          <div>
            <p className="lead-copy">{p.overview || p.description}</p>
          </div>
        </div>
      </section>
      <section className="section-space surface">
        <div className="section-shell case-story">
          {[
            ["02", "The challenge", p.challenge],
            ["03", "The solution", p.solution],
          ].map(([num, title, text]) => (
            <article key={num}>
              <span>{num}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
          <article>
            <span>04</span>
            <h2>Key features</h2>
            <ul className="case-feature-list">
              {p.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {p.tags.length > 0 && <h3 className="technology-heading">Technology used</h3>}
            <div className="tags">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </article>
        </div>
      </section>
      <section className="section-space surface">
        <div className="section-shell">
          <Heading label="06 / THE DETAILS" title="A closer look at the interface." />
          {p.showcaseVideo ? (
            <figure className="case-video-showcase">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={p.image || undefined}
                aria-label={`${p.name} scrolling website preview`}
              >
                <source src={p.showcaseVideo} type="video/mp4" />
                Your browser does not support video playback.
              </video>
              <figcaption>Live scrolling website preview</figcaption>
            </figure>
          ) : (
            <div className="case-gallery">
              <figure>
                <img
                  src={p.desktopImage || p.image}
                  alt={`${p.name} desktop website interface`}
                  width={1408}
                  height={1008}
                  loading="lazy"
                />
                <figcaption>Desktop website view</figcaption>
              </figure>
              <figure>
                <img
                  src={p.mobileImage || p.image}
                  alt={`${p.name} mobile website interface`}
                  width={1408}
                  height={1008}
                  loading="lazy"
                />
                <figcaption>Mobile website view</figcaption>
              </figure>
            </div>
          )}
          {!!p.gallery?.length && (
            <div className="case-gallery">
              {p.gallery.map((image, index) => (
                <figure key={index}>
                  <img src={image.url} alt={image.alt} loading="lazy" />
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="section-space">
        <div className="section-shell editorial-split">
          <Heading
            label="07 / INTENDED BUSINESS IMPACT"
            title="Designed for a clearer next step."
          />
          <div>
            <p className="lead-copy">
              {p.result ||
                "The direction prioritises useful information, recognisable branding and an easier journey towards enquiry or purchase."}
            </p>
          </div>
        </div>
      </section>
      <CTA title="Have a similar project? Let’s talk." />
    </>
  );
}
