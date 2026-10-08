import { BusinessCounters } from "./business-counters";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  PanelsTopLeft,
  ShoppingCart,
  Workflow,
  ChartNoAxesCombined,
  WandSparkles,
  ShieldCheck,
} from "lucide-react";
import { Action, Heading, Process } from "@/components/shared/page";
import heroWorkspace from "@/assets/hero-real-workspace.jpg";
import { services } from "@/data/services";
import { useContent } from "@/lib/cms/context";
import { homepageDefaults } from "@/lib/cms/defaults";
import { cmsIcon } from "./cms-icons";
import { reasons, technologies } from "./content";
import { ProjectCard } from "@/components/portfolio/portfolio-page";
const serviceCardIcons = {
  "/services/website-development": PanelsTopLeft,
  "/services/ecommerce-development": ShoppingCart,
  "/services/custom-web-development": Workflow,
  "/services/seo": ChartNoAxesCombined,
  "/services/website-redesign": WandSparkles,
  "/services/website-maintenance": ShieldCheck,
};
export function HomePage() {
  const content = useContent();
  const sections = { ...homepageDefaults, ...content.sections };
  const hero = sections["hero"]!;
  const projects = content.enabled
    ? content.projects.filter((p) => p.featured)
    : content.projects.slice(0, 2);
  const homeServices = content.sections["services"]?.items.map((s) => ({
    ...s,
    slug: s.url,
    icon: cmsIcon(s.icon),
  }));
  const homeReasons =
    content.sections["why"]?.items.map((s) => [s.title, s.description, cmsIcon(s.icon)] as const) ||
    reasons;
  const homeTechnologies =
    content.sections["technology"]?.items.map((t) => ({ name: t.title, icon: t.url })) ||
    technologies;
  return (
    <>
      <section className="home-hero">
        <div className="section-shell home-hero-grid">
          <div>
            <p className="eyebrow">{hero.label}</p>
            <h1>
              {hero.heading} <span>{hero.highlight}</span>
            </h1>
            <p className="hero-description">{hero.description}</p>
            <div className="action-row">
              <a className="action" href={hero.buttonUrl}>
                {hero.buttonText}
                <ArrowUpRight size={18} />
              </a>
              <a className="action action-secondary" href={hero.secondaryUrl}>
                {hero.secondaryText}
                <ArrowUpRight size={18} />
              </a>
            </div>
            <p className="trust-note">
              <span /> Strategy · Design · Development · Growth
            </p>
          </div>
          {(!content.enabled || hero.image || hero.mobileImage) && (
            <figure className="hero-workspace-photo">
              <picture>
                {hero.mobileImage && (
                  <source media="(max-width: 700px)" srcSet={hero.mobileImage} />
                )}
                <img
                  src={content.enabled ? hero.image || hero.mobileImage : heroWorkspace}
                  alt={hero.imageAlt}
                  width={1200}
                  height={1726}
                  fetchPriority="high"
                />
              </picture>
              <figcaption>
                <span>THOUGHTFULLY DESIGNED.</span>
                <strong>Built for the way you work.</strong>
              </figcaption>
            </figure>
          )}
        </div>
        <div className="section-shell hero-bottom">
          <span>GOOD THINKING. GREAT EXECUTION.</span>
          <span>
            Built around your business <ArrowRight size={16} />
          </span>
        </div>
      </section>
      <BusinessCounters />
      <section className="section-space surface">
        <div className="section-shell">
          <div className="section-top">
            <Heading
              label={sections["services"]!.label}
              title={sections["services"]!.heading}
              text={sections["services"]!.description}
            />
            <a className="action action-secondary" href={sections["services"]!.buttonUrl}>
              {sections["services"]!.buttonText}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="service-preview-grid">
            {(homeServices || services.map((s) => ({ ...s, url: "/services/" + s.slug }))).map(
              (s) => {
                const Icon = serviceCardIcons[s.url as keyof typeof serviceCardIcons] || s.icon;
                return (
                  <a key={s.slug} href={s.url} className="service-preview">
                    <div>
                      <span>{s.number}</span>
                      <span className="service-icon-badge" aria-hidden="true">
                        <Icon size={36} strokeWidth={1.7} />
                      </span>
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                    <ArrowUpRight className="card-arrow" />
                  </a>
                );
              },
            )}
          </div>
        </div>
      </section>
      <section className="section-space">
        <div className="section-shell">
          <div className="section-top">
            <Heading
              label={sections["portfolio"]!.label}
              title={sections["portfolio"]!.heading}
              text={sections["portfolio"]!.description}
            />
            <a className="action action-secondary" href={sections["portfolio"]!.buttonUrl}>
              {sections["portfolio"]!.buttonText}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="portfolio-grid home-projects">
            {projects.map((p, i) => (
              <ProjectCard key={p.slug} project={p} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>
      <section className="section-space surface">
        <div className="section-shell why-grid">
          <Heading
            label={sections["why"]!.label}
            title={sections["why"]!.heading}
            text={sections["why"]!.description}
          />
          <div className="reasons-grid">
            {homeReasons.map(([title, body, Icon], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Process content={content.sections["process"]} />
      <section className="technology-section">
        <div className="section-shell">
          <p className="eyebrow">{sections["technology"]!.label}</p>
          <div className="technology-marquee" aria-label="Technologies we work with">
            <div className="technology-list">
              {[...homeTechnologies, ...homeTechnologies].map((technology, index) => (
                <span
                  key={`${technology.name}-${index}`}
                  aria-hidden={index >= homeTechnologies.length}
                >
                  <img src={technology.icon} alt="" width={24} height={24} loading="lazy" />
                  {technology.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section-space">
        <div className="section-shell impact-panel">
          <p className="eyebrow">{sections["impact"]!.label}</p>
          <h2>{sections["impact"]!.heading}</h2>
          <div>
            {sections["impact"]!.items.map(({ title, description: text }) => (
              <article key={title}>
                <ArrowUpRight />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-shell home-insights">
        <Heading
          label={sections["insights"]!.label}
          title={sections["insights"]!.heading}
          text={sections["insights"]!.description}
        />
        <a className="action action-secondary" href={sections["insights"]!.buttonUrl}>
          {sections["insights"]!.buttonText}
          <ArrowUpRight size={18} />
        </a>
      </section>
    </>
  );
}
