import { Action, CTA, Heading, InnerHero } from "@/components/shared/page";
import { Building2, Rocket, ChartNoAxesCombined, Eye, Target, ArrowUpRight } from "lucide-react";
export function AboutPage() {
  return (
    <>
      <InnerHero
        className="about-breadcrumb-hero"
        label="About Webakoof"
        title="We combine creativity, technology & business thinking."
        description="Webakoof is the web and digital technology division of Praavi Consultants. We connect business understanding with thoughtful digital execution."
      />
      <section className="journey-section" aria-labelledby="journey-heading">
        <div className="section-shell journey-grid">
          <div className="journey-copy">
            <p className="eyebrow">ABOUT WEBAKOOF</p>
            <h2 id="journey-heading">
              Our <span>Journey</span>
            </h2>
            <p className="journey-description">
              Webakoof is a dedicated web development brand by Praavi Consultants. What started as a
              web development service within Praavi Consultants grew into a separate brand over 2
              years ago, focused on modern, user-friendly and performance-driven websites. Founded
              by Pooja Pandey and Malhar Pandey, Webakoof delivers business websites, e-commerce
              platforms, custom web applications and SEO solutions for brands across industries.
            </p>
            <ol className="journey-timeline">
              {[
                {
                  icon: Building2,
                  title: "Rooted in Praavi Consultants",
                  text: "Web development started as a service within Praavi.",
                },
                {
                  icon: Rocket,
                  title: "2+ Years Ago",
                  text: "Webakoof was established as a separate brand.",
                },
                {
                  icon: ChartNoAxesCombined,
                  title: "Today",
                  text: "Delivering digital solutions for businesses of all sizes.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className="journey-milestone-icon">
                    <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="journey-portrait">
            <div className="journey-yellow-orbit" aria-hidden="true" />
            <img
              src="/webakoof_ceo.png"
              alt="Pooja Pandey, co-founder of Webakoof, at her workspace"
              width={1145}
              height={1374}
              loading="lazy"
            />
            <figure className="journey-quote">
              <span className="journey-quote-mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote>Building web solutions that help businesses grow.</blockquote>
              <figcaption>
                <strong>POOJA PANDEY</strong>
                <span>Co-Founder &middot; Webakoof</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className="section-space vision-mission-section" aria-label="Our vision and mission">
        <div className="section-shell vision-mission-grid">
          {[
            {
              icon: Eye,
              label: "WHERE WE WANT TO GO",
              title: "Our Vision",
              text: "To help businesses grow through thoughtful digital experiences that bring together creativity, technology and real business needs.",
              note: "A clearer digital future for every business.",
            },
            {
              icon: Target,
              label: "WHAT DRIVES US EVERY DAY",
              title: "Our Mission",
              text: "To build modern, user-friendly websites and digital solutions that make it easier for businesses to connect with customers, simplify their work and grow with confidence.",
              note: "Purpose in every page. Care in every detail.",
            },
          ].map(({ icon: Icon, label, title, text, note }, index) => (
            <article
              className={`vision-mission-card ${index === 1 ? "mission-card" : "vision-card"}`}
              key={title}
            >
              <div className="vision-mission-top">
                <span className="vision-mission-icon">
                  <Icon size={34} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="vision-mission-index">0{index + 1}</span>
              </div>
              <p className="vision-mission-label">{label}</p>
              <h2>{title}</h2>
              <p className="vision-mission-copy">{text}</p>
              <div className="vision-mission-note">
                <span>{note}</span>
                <ArrowUpRight size={22} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section-space team-section" aria-labelledby="team-heading">
        <div className="section-shell">
          <div className="team-heading">
            <p className="eyebrow">THE PEOPLE BEHIND THE WORK</p>
            <h2 id="team-heading">
              Our <span>Team</span>
            </h2>
            <p>
              A dedicated team bringing care, creativity and technical expertise to every project.
            </p>
          </div>
          <div className="team-grid">
            {[
              { name: "Prajakata Inamke", role: "Head Of Webakoof", photo: "/Prajakta-clean.png" },
              {
                name: "Abhishek Jambhale",
                role: "Senior Web Developer",
                photo: "/abhishek-clean.png",
              },
              {
                name: "Vaishnavi Pawar",
                role: "Senior Web Developer",
                photo: "/vaishnavi-clean.png",
              },
              { name: "Bhushan Wagh", role: "Junior Web Developer", photo: "/bhushan-clean.png" },
              {
                name: "Priyanka Katore",
                role: "Junior Web Developer",
                photo: "/priyanka-clean.png",
              },
              { name: "Bipin Mandal", role: "Junior Web Developer", photo: "/bipin-clean.png" },
            ].map(({ name, role, photo }) => (
              <article className="team-card" key={name}>
                <div className="team-photo">
                  <img
                    src={photo}
                    alt={`${name}, ${role}`}
                    width={600}
                    height={720}
                    loading="lazy"
                  />
                </div>
                <div className="team-card-info">
                  <h3>{name}</h3>
                  <p>{role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-space surface">
        <div className="section-shell">
          <Heading
            label="02 / WHAT WE BELIEVE"
            title="Four principles. Present in every project."
          />
          <div className="philosophy-grid">
            {[
              [
                "Think Business First",
                "Start with the goals, constraints and customers that make your business unique.",
              ],
              ["Design With Purpose", "Make every layout, word and interaction earn its place."],
              [
                "Build for Performance",
                "Treat speed, usability and maintainability as part of the experience.",
              ],
              [
                "Support Beyond Launch",
                "Plan the handover and the next steps before the site goes live.",
              ],
            ].map(([title, text], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
