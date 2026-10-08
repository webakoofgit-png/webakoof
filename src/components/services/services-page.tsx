import { Link } from "@tanstack/react-router";
import { ServiceVisual } from "./service-visual";
import seoAnalytics from "@/assets/seo-analytics-laptop.jpg";
import websitePhoto from "@/assets/service-website-development.jpg";
import ecommercePhoto from "@/assets/service-ecommerce.jpg";
import customPhoto from "@/assets/service-custom-development.jpg";
import redesignPhoto from "@/assets/service-redesign.jpg";
import maintenancePhoto from "@/assets/service-maintenance.jpg";
import {
  ArrowUpRight,
  ScanSearch,
  KeyRound,
  PanelsTopLeft,
  MapPin,
  FilePenLine,
  Link2,
  ChartNoAxesCombined,
  Gauge,
  Smartphone,
  Palette,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  Workflow,
  Users,
  Database,
  Plug,
  Settings,
  ClipboardCheck,
  BookOpen,
  RefreshCw,
  HardDrive,
  Activity,
  LockKeyhole,
  Route,
  MoveRight,
} from "lucide-react";
import { Action, CTA, Heading, InnerHero, Process } from "@/components/shared/page";
import { services, serviceFaqs, type Service } from "@/data/services";
import { serviceCopy } from "@/data/service-copy";
import { useContent } from "@/lib/cms/context";
import { ProjectCard } from "@/components/portfolio/portfolio-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const seoFeatures = [
  { icon: ScanSearch, description: "Find crawl issues, broken links and technical gaps." },
  { icon: KeyRound, description: "Match relevant search terms to the right pages." },
  { icon: PanelsTopLeft, description: "Organise headings, page titles and metadata clearly." },
  { icon: MapPin, description: "Help nearby customers discover your business." },
  { icon: FilePenLine, description: "Plan useful content around customer questions." },
  { icon: Link2, description: "Connect related pages for easier discovery." },
  { icon: ChartNoAxesCombined, description: "Track search visibility, clicks and traffic trends." },
  { icon: Gauge, description: "Review progress and identify the next improvements." },
];
const seoSolutions = [
  { icon: MapPin, description: "Build visibility for customers searching in your area." },
  { icon: ScanSearch, description: "Give search engines a clear, accessible website to explore." },
  { icon: FilePenLine, description: "Make each page useful, relevant and easier to understand." },
  {
    icon: PanelsTopLeft,
    description: "Present your business clearly across Google Search and Maps.",
  },
];
const serviceFeatures: Record<string, typeof seoFeatures> = {
  seo: seoFeatures,
  "website-development": [
    { icon: Smartphone, description: "A smooth experience across phones, tablets and desktops." },
    { icon: Palette, description: "Layouts and visual details shaped around your brand." },
    { icon: ScanSearch, description: "Clear page structure built for search discovery." },
    { icon: FilePenLine, description: "Make it easy for visitors to send an enquiry." },
    { icon: MessageCircle, description: "Connect visitors directly to your business on WhatsApp." },
    { icon: Gauge, description: "Optimise assets and loading for a faster experience." },
    { icon: LockKeyhole, description: "Configure HTTPS for an encrypted connection." },
    {
      icon: ChartNoAxesCombined,
      description: "Understand visitor activity through agreed analytics tools.",
    },
  ],
  "ecommerce-development": [
    { icon: BookOpen, description: "Organise products, categories and essential buying details." },
    { icon: ShoppingCart, description: "Make adding and reviewing products straightforward." },
    { icon: CreditCard, description: "Connect an agreed payment provider for checkout." },
    { icon: Package, description: "Manage orders and keep fulfilment information organised." },
    { icon: PanelsTopLeft, description: "Manage your store through a practical control panel." },
    { icon: Truck, description: "Connect shipping services within the agreed scope." },
    { icon: Smartphone, description: "Keep checkout easy to follow on smaller screens." },
    { icon: ChartNoAxesCombined, description: "Review sales and shopping activity in one place." },
  ],
  "custom-web-development": [
    {
      icon: Workflow,
      description: "Map the tasks and processes your application needs to support.",
    },
    { icon: Users, description: "Give each team member the appropriate permissions." },
    { icon: PanelsTopLeft, description: "Bring useful metrics and tasks into a clear workspace." },
    { icon: Plug, description: "Connect compatible tools through their available APIs." },
    { icon: Database, description: "Structure business data around your actual requirements." },
    { icon: Settings, description: "Provide practical controls for managing the application." },
    {
      icon: ClipboardCheck,
      description: "Check key workflows, permissions and application behaviour.",
    },
    { icon: BookOpen, description: "Document the setup and guide your team through delivery." },
  ],
  "website-redesign": [
    {
      icon: ScanSearch,
      description: "Review the current website and identify priority improvements.",
    },
    { icon: Palette, description: "Refresh layouts and styling to better reflect your brand." },
    { icon: Gauge, description: "Improve loading by reviewing assets and page performance." },
    { icon: Smartphone, description: "Make content and controls easier to use on mobile." },
    { icon: Route, description: "Help visitors find the information they need sooner." },
    { icon: MessageCircle, description: "Simplify the steps from browsing to making an enquiry." },
    { icon: Database, description: "Move agreed content into the refreshed website." },
    { icon: MoveRight, description: "Plan redirects when existing page addresses change." },
  ],
  "website-maintenance": [
    { icon: RefreshCw, description: "Keep supported website software and components up to date." },
    { icon: HardDrive, description: "Agree backup schedules and a practical recovery approach." },
    { icon: Activity, description: "Monitor availability and investigate reported interruptions." },
    { icon: LockKeyhole, description: "Review certificate validity and HTTPS configuration." },
    { icon: ShieldCheck, description: "Check access, settings and potential security concerns." },
    {
      icon: FilePenLine,
      description: "Keep agreed text, images and business information current.",
    },
    { icon: Gauge, description: "Review speed and identify useful performance improvements." },
    { icon: ClipboardCheck, description: "Keep a clear record of maintenance work and support." },
  ],
};
const servicePhotos: Record<string, { src: string; alt: string; height: number }> = {
  "website-development": {
    src: websitePhoto,
    alt: "Laptop showing website code beside a desktop website preview",
    height: 750,
  },
  "ecommerce-development": {
    src: ecommercePhoto,
    alt: "Customer shopping online with a smartphone and payment card",
    height: 750,
  },
  "custom-web-development": {
    src: customPhoto,
    alt: "Application source code displayed on a laptop screen",
    height: 750,
  },
  seo: {
    src: seoAnalytics,
    alt: "Laptop displaying website analytics charts and visitor statistics",
    height: 855,
  },
  "website-redesign": {
    src: redesignPhoto,
    alt: "Colourful website wireframes sketched during design planning",
    height: 750,
  },
  "website-maintenance": {
    src: maintenancePhoto,
    alt: "Server racks and network infrastructure in a data centre",
    height: 750,
  },
};
export function ServicesPage() {
  return (
    <>
      <InnerHero
        label="Our expertise"
        title="Everything your business needs to grow digitally."
        description="From a first website to a custom platform and improvements that make your existing website work better. Thoughtfully planned. Built around you."
      />
      <section className="section-shell services-intro">
        <p className="eyebrow">SIX CAPABILITIES. ONE CONNECTED APPROACH.</p>
        <p>
          Start with what your business needs today.
          <br />
          Build a foundation for where it goes tomorrow.
        </p>
      </section>
      {services.map((s, i) => (
        <section key={s.slug} className={`service-showcase ${i % 2 ? "surface" : ""}`}>
          <div className="section-shell service-row">
            <div className="service-row-copy">
              <span className="service-number">{s.number}</span>
              <s.icon size={32} />
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              <div className="tags">
                {s.items.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <Link className="text-link" to="/services/$slug" params={{ slug: s.slug }}>
                Explore this service <ArrowUpRight size={20} />
              </Link>
            </div>
            <ServiceVisual index={i} />
          </div>
        </section>
      ))}
      <CTA title="Not sure where to start? Let’s find the right fit." />
    </>
  );
}
export function ServiceDetailPage({ service: s }: { service: Service }) {
  const { projects } = useContent();
  const photo = servicePhotos[s.slug];
  const related = projects.filter((p) => p.services.includes(s.slug)).slice(0, 2);
  return (
    <>
      <InnerHero
        label={`${s.number} / ${s.title}`}
        title={s.headline}
        description={s.description}
        parent={{ label: "Services", to: "/services" }}
      >
        <div className="service-hero-illustration">
          <ServiceVisual index={services.findIndex((service) => service.slug === s.slug)} />
          <Action>Get a Quote</Action>
        </div>
      </InnerHero>
      <section className="section-space">
        <div className="section-shell editorial-split">
          <div>
            <Heading label="THE RIGHT FOUNDATION" title={s.title} />
            {photo && (
              <figure className="service-foundation-photo">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={1200}
                  height={photo.height}
                  loading="lazy"
                />
              </figure>
            )}
          </div>
          <div>
            <p className="lead-copy">{s.audience}</p>
            {serviceCopy[s.slug]?.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="section-space surface">
        <div className="section-shell">
          <Heading
            label="WHAT’S INCLUDED"
            title="The details that make the difference."
            text="A starting point for your scope. Final deliverables and integrations are agreed in your proposal."
          />
          <div className="seo-feature-grid">
            {s.features.map((title, index) => {
              const feature = serviceFeatures[s.slug]?.[index];
              const Icon = feature?.icon ?? ScanSearch;
              return (
                <div className="seo-feature-card" key={title}>
                  <div className="seo-feature-top">
                    <span className="seo-feature-icon">
                      <Icon size={32} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <span className="seo-feature-number">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{title}</h3>
                  {feature && <p>{feature.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section-space">
        <div
          className={`section-shell ${s.slug === "seo" ? "seo-solutions-layout" : "solutions-grid"}`}
        >
          {s.slug === "seo" ? (
            <div className="seo-solutions-intro">
              <Heading label="SHAPED AROUND YOU" title="Different needs. The right solution." />
              <p>Focus on the search opportunities that matter to your business.</p>
              <Action>Discuss Your SEO Goals</Action>
            </div>
          ) : (
            <Heading label="SHAPED AROUND YOU" title="Different needs. The right solution." />
          )}
          {s.slug === "seo" ? (
            <div className="seo-solutions-list">
              {s.solutions.map((title, index) => {
                const solution = seoSolutions[index];
                const Icon = solution?.icon ?? ScanSearch;
                return (
                  <div className="seo-solution-item" key={title}>
                    <span className="seo-solution-icon">
                      <Icon size={28} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      {solution && <p>{solution.description}</p>}
                    </div>
                    <span className="seo-solution-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {s.solutions.map((item, i) => (
                <div className="solution-row" key={item}>
                  <span>0{i + 1}</span>
                  <h3>{item}</h3>
                  <ArrowUpRight />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Process />
      {related.length > 0 && (
        <section className="section-space surface">
          <div className="section-shell">
            <Heading label="RELATED DESIGN CONCEPTS" title="See the thinking take shape." />
            <div className="portfolio-grid">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section-space">
        <div className="section-shell faq-grid">
          <Heading label="A LITTLE MORE CLARITY" title="Questions, answered." />
          <Accordion type="single" collapsible>
            {serviceFaqs(s).map(([q, a], i) => (
              <AccordionItem value={`faq-${i}`} key={q}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <CTA title="Need this for your business? Let’s discuss your project." />
    </>
  );
}
