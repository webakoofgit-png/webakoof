import { Link } from "@tanstack/react-router";
import { ServiceVisual } from "./service-visual";
import { ArrowUpRight } from "lucide-react";
import { Action, CTA, FeatureGrid, Heading, InnerHero, Process } from "@/components/shared/page";
import { services, serviceFaqs, type Service } from "@/data/services";
import { useContent } from "@/lib/cms/context";
import { ProjectCard } from "@/components/portfolio/portfolio-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  const related = projects.filter((p) => p.services.includes(s.slug)).slice(0, 2);
  return (
    <>
      <InnerHero
        label={`${s.number} / ${s.title}`}
        title={s.headline}
        description={s.description}
        parent={{ label: "Services", to: "/services" }}
      >
        <div className="service-hero-icon">
          <s.icon strokeWidth={1} />
          <span>{s.title}</span>
          <Action>Get a Quote</Action>
        </div>
      </InnerHero>
      <section className="section-space">
        <div className="section-shell editorial-split">
          <Heading label="THE RIGHT FOUNDATION" title={s.title} />
          <div>
            <p className="lead-copy">{s.audience}</p>
            <p>
              We begin by understanding the current experience, the people who use it and what needs
              to improve. Then we agree the scope, priorities and practical measures of success
              before moving into delivery.
            </p>
            <p>
              You get a clear plan, regular review points and an approach that fits the way your
              business works.
            </p>
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
          <FeatureGrid items={s.features} />
        </div>
      </section>
      <section className="section-space">
        <div className="section-shell solutions-grid">
          <Heading label="SHAPED AROUND YOU" title="Different needs. The right solution." />
          <div>
            {s.solutions.map((item, i) => (
              <div className="solution-row" key={item}>
                <span>0{i + 1}</span>
                <h3>{item}</h3>
                <ArrowUpRight />
              </div>
            ))}
          </div>
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
