import { Link } from "@tanstack/react-router";
import { InnerHero } from "@/components/shared/page";
const privacy = [
  [
    "information",
    "Information you share",
    "The project enquiry form asks for your name, business name, phone number, email address, service interests, budget and project description. Please share only information relevant to your enquiry.",
  ],
  [
    "purpose",
    "How enquiry information is used",
    "Information submitted through the form is intended to help Webakoof understand your request and respond about a possible project. The form does not subscribe you to a marketing list.",
  ],
  [
    "delivery",
    "Form delivery and storage",
    "When delivery is configured, enquiries are forwarded to the service selected by Webakoof. The website does not store your enquiry in browser storage. If delivery fails, your entries remain in the current page so you can retry or download a copy. Closing or refreshing the page may clear them.",
  ],
  [
    "services",
    "Website services",
    "The site requests its typeface from Google Fonts. Hosting and font providers may receive technical request information, such as an IP address, when your browser loads the site. Any additional analytics or advertising tools must be reflected in this policy before activation.",
  ],
  [
    "retention",
    "Retention and access",
    "The business must confirm the providers used, retention periods and a verified contact for privacy requests before this draft is published as its final policy.",
  ],
  [
    "contact",
    "Questions and updates",
    "This page is a draft for business review. A verified privacy contact and the effective date will be added when the policy is approved.",
  ],
];
const terms = [
  [
    "website",
    "About this website",
    "Webakoof is the web and digital technology division of Praavi Consultants. This website introduces its capabilities and provides a way to discuss potential projects.",
  ],
  [
    "proposals",
    "Project proposals and scope",
    "Website content is general information. Deliverables, pricing, payment milestones, schedules, ownership, support and acceptance criteria must be set out in a separate written project agreement. Sending an enquiry does not create a project contract.",
  ],
  [
    "content",
    "Content and design concepts",
    "Portfolio items marked as design concepts illustrate a proposed direction. They are not presented as verified client engagements or evidence of measured commercial results.",
  ],
  [
    "responsibilities",
    "Working together",
    "A project agreement should identify each party’s responsibilities, including content approvals, account access, feedback, third-party subscriptions and the process for changes in scope.",
  ],
  [
    "third-parties",
    "Third-party services",
    "Payment providers, hosting platforms and other external services may have their own terms and fees. Any services needed for a project should be identified and agreed in its proposal.",
  ],
  [
    "review",
    "Review and contact",
    "This is draft website content for business review. Applicable contractual terms, a verified contact and an effective date must be confirmed before final publication.",
  ],
];
export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const title = type === "privacy" ? "Privacy Policy" : "Terms & Conditions";
  const sections = type === "privacy" ? privacy : terms;
  return (
    <>
      <InnerHero
        label="The details"
        title={title}
        description={
          type === "privacy"
            ? "A clear view of the information you share and how this website handles it."
            : "A clear starting point for understanding this website and discussing a project."
        }
      />
      <div className="section-shell legal-status">
        <span>DRAFT FOR BUSINESS REVIEW</span>
        <p>Last updated: pending approval</p>
      </div>
      <div className="section-shell article-layout legal-layout">
        <aside className="table-of-contents">
          <p className="eyebrow">ON THIS PAGE</p>
          <nav aria-label="Table of contents">
            {sections.map(([id, title]) => (
              <a key={id} href={`#${id}`}>
                {title}
              </a>
            ))}
          </nav>
        </aside>
        <article className="article-body">
          {sections.map(([id, title, text], i) => (
            <section id={id} key={id}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
          <div className="legal-crosslink">
            <Link to={type === "privacy" ? "/terms-and-conditions" : "/privacy-policy"}>
              {type === "privacy" ? "Read Terms & Conditions" : "Read Privacy Policy"} ↗
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
