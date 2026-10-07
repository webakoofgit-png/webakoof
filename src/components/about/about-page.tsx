import { Action, CTA, Heading, InnerHero } from "@/components/shared/page";
import workspace from "@/assets/webakoof-hero-workspace.jpg";
export function AboutPage() {
  return (
    <>
      <InnerHero
        label="About Webakoof"
        title="We combine creativity, technology & business thinking."
        description="Webakoof is the web and digital technology division of Praavi Consultants. We connect business understanding with thoughtful digital execution."
      >
        <div className="about-monogram">
          <span>STRATEGY × DESIGN × TECHNOLOGY</span>
          <strong>w.</strong>
          <p>
            One focused team.
            <br />
            Every digital detail.
          </p>
        </div>
      </InnerHero>
      <section className="section-space story-section">
        <div className="section-shell story-grid">
          <div>
            <p className="eyebrow">01 / OUR STORY</p>
            <h2>
              Good work starts
              <br />
              with better questions.
            </h2>
            <p>
              What does your business need to achieve? What stands in your customer’s way? And where
              can technology make a useful difference?
            </p>
            <p>
              These questions shape the way we work. Under Praavi Consultants, Webakoof brings
              website development and digital marketing into one considered process, from the first
              conversation through launch and ongoing improvement.
            </p>
            <p>
              We believe a website should be more than a finished design. It should be a useful part
              of how your business communicates, operates and grows.
            </p>
          </div>
          <figure className="story-image">
            <img
              src={workspace}
              alt="Digital workspace illustration with website layouts and development tools"
              width={1408}
              height={1008}
              loading="lazy"
            />
            <figcaption>A connected view of design, technology and business.</figcaption>
          </figure>
        </div>
        <div className="background-word" aria-hidden="true">
          WEBAKOOF
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
      <section className="section-space">
        <div className="section-shell relationship-grid">
          <Heading
            label="03 / THE BIGGER PICTURE"
            title="Business perspective. Digital capability."
            text="Our connection to Praavi Consultants keeps business thinking close to the work. Webakoof translates that perspective into websites and digital solutions."
          />
          <div className="relationship">
            {[
              ["Praavi Consultants", "Business perspective"],
              ["Webakoof", "Web & digital technology division"],
              ["Web & Digital Solutions", "Design · Development · Growth"],
            ].map(([title, text]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-space surface">
        <div className="section-shell">
          <div className="section-top">
            <Heading
              label="04 / HOW WE WORK TOGETHER"
              title="Different disciplines. One shared direction."
            />
            <p className="section-aside">
              Your project brings together the capabilities it needs, with a clear scope and shared
              checkpoints.
            </p>
          </div>
          <div className="discipline-grid">
            {[
              ["01", "Strategy & discovery", "Listening, questioning and defining what matters."],
              [
                "02",
                "Design & experience",
                "Turning a clear direction into an intuitive interface.",
              ],
              ["03", "Development & growth", "Building, testing and improving the experience."],
            ].map(([num, title, text]) => (
              <article key={num}>
                <div className="discipline-art" aria-hidden="true">
                  <span>{num}</span>
                </div>
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
