import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Code2, Search } from "lucide-react";
import { process } from "@/components/home/content";
import type { Section } from "@/lib/cms/schema";
export function Action({
  children = "Start Your Project",
  to = "/contact",
  secondary = false,
}: {
  children?: ReactNode;
  to?: "/contact" | "/portfolio" | "/about" | "/services" | "/blog";
  secondary?: boolean;
}) {
  return (
    <Link to={to} className={`action ${secondary ? "action-secondary" : ""}`}>
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function Heading({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{label}</p>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
export function InnerHero({
  label,
  title,
  description,
  children,
  parent,
  className = "",
}: {
  label: string;
  title: string;
  description: string;
  children?: ReactNode;
  parent?: { label: string; to: "/services" | "/portfolio" | "/blog" };
  className?: string;
}) {
  return (
    <section className={`inner-hero ${children ? "has-visual" : ""} ${className}`}>
      <div className="section-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {parent && (
            <>
              <Link to={parent.to}>{parent.label}</Link>
              <span>/</span>
            </>
          )}
          <span aria-current="page">{label}</span>
        </nav>
        <div className="inner-hero-grid">
          <div>
            <p className="eyebrow">{label}</p>
            <h1>{title}</h1>
            <p className="hero-description">{description}</p>
          </div>
          {children && <div className="inner-visual">{children}</div>}
        </div>
      </div>
    </section>
  );
}
export function BrowserVisual({ variant = 0 }: { variant?: number }) {
  return (
    <div
      className={`digital-visual visual-${variant % 3}`}
      role="img"
      aria-label="Illustrative website interface with mobile layout and analytics cards"
    >
      <div className="visual-disc" />
      <div className="browser-frame">
        <div className="browser-toolbar">
          <span>● ● ●</span>
          <span>your next big thing</span>
          <ArrowUpRight size={12} />
        </div>
        <div className="mock-nav">
          <strong>
            hello<span>.</span>
          </strong>
          <span>Discover&nbsp;&nbsp; Our story&nbsp;&nbsp; ↗</span>
        </div>
        <div className="mock-content">
          <div>
            <small>DESIGNED FOR POSSIBILITY</small>
            <strong>
              Good ideas.
              <br />
              Great experiences.
            </strong>
            <span className="mock-button">Discover more ↗</span>
          </div>
          <div className="mock-sculpture">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="mock-bottom">
          <span>01 / STRATEGY</span>
          <span>02 / EXPERIENCE</span>
          <span>03 / GROWTH</span>
        </div>
      </div>
      <div className="analytics-card">
        <span>
          Built for growth <ArrowUpRight size={16} />
        </span>
        <div className="bar-chart">
          {[28, 43, 38, 63, 56, 80, 95].map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <small>Clarity at every step</small>
      </div>
      <div className="phone-frame">
        <span className="phone-speaker" />
        <strong>hello.</strong>
        <div className="phone-art" />
        <b>
          Small screen.
          <br />
          Big possibilities.
        </b>
        <span className="mock-button">Explore ↗</span>
      </div>
      <div className="tech-badge">
        <Code2 size={18} /> Made to perform
      </div>
      <div className="seo-badge">
        <Search size={17} /> Search-ready
      </div>
    </div>
  );
}
export function Process({ content }: { content?: Section | undefined } = {}) {
  return (
    <section className="section-space">
      <div className="section-shell">
        <Heading
          label={content?.label ?? "HOW WE GET THERE"}
          title={content?.heading ?? "A clear path. From first idea to what’s next."}
          text={content?.description || ""}
        />
        <ol className="process-grid">
          {(content ? content.items.map((s) => [s.number, s.title, s.description]) : process).map(
            ([num, title, body]) => (
              <li key={num}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ),
          )}
        </ol>
      </div>
    </section>
  );
}
export function CTA({ title = "Ready to build something better?" }: { title?: string }) {
  return (
    <section className="section-shell cta-panel">
      <div>
        <p className="eyebrow">LET’S MAKE IT HAPPEN</p>
        <h2>{title}</h2>
      </div>
      <Action>Start a Conversation</Action>
    </section>
  );
}
export function FeatureGrid({ items }: { items: string[] }) {
  return (
    <div className="feature-grid">
      {items.map((item, i) => (
        <div key={item}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <Check size={18} />
          <h3>{item}</h3>
        </div>
      ))}
    </div>
  );
}
