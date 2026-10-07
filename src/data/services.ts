import { services as existingServices } from "@/components/home/content";

const details = [
  {
    slug: "website-development",
    headline: "Your best first impression. Built to last.",
    audience:
      "For businesses that need a credible online home and a clearer path from visitor to enquiry.",
    features: [
      "Responsive UI/UX",
      "Custom design",
      "SEO-friendly structure",
      "Lead forms",
      "WhatsApp integration",
      "Performance optimisation",
      "SSL setup",
      "Analytics integration",
    ],
    solutions: [
      "Static website",
      "Dynamic website",
      "Corporate website",
      "Landing page",
      "Business portal",
    ],
    question: "Can we update the website ourselves?",
    answer:
      "Yes. When content editing is part of your scope, we build around a suitable CMS and include a practical handover.",
  },
  {
    slug: "ecommerce-development",
    headline: "Make every step towards checkout feel effortless.",
    audience:
      "For retail brands moving online or replacing a store that makes buying harder than it should be.",
    features: [
      "Product catalogue",
      "Shopping cart",
      "Payment gateway",
      "Order management",
      "Admin dashboard",
      "Shipping integration",
      "Mobile checkout",
      "Store analytics",
    ],
    solutions: [
      "Direct-to-consumer stores",
      "Multi-category retail",
      "Wholesale catalogues",
      "WooCommerce stores",
    ],
    question: "Can you connect our payment and shipping providers?",
    answer:
      "We review provider availability, account requirements and integration costs during discovery, then include the agreed integrations in the proposal.",
  },
  {
    slug: "custom-web-development",
    headline: "Less busywork. More possibilities.",
    audience:
      "For teams whose workflows have outgrown spreadsheets, disconnected tools or off-the-shelf software.",
    features: [
      "Workflow discovery",
      "Role-based access",
      "Custom dashboards",
      "API integrations",
      "Data modelling",
      "Admin controls",
      "Testing",
      "Technical handover",
    ],
    solutions: ["Business portals", "CRM systems", "Learning platforms", "Operations dashboards"],
    question: "Can a new application work with our existing tools?",
    answer:
      "We assess your systems and their APIs before recommending an integration approach. Data migration and permissions are scoped explicitly.",
  },
  {
    slug: "seo",
    headline: "Be found when it matters.",
    audience:
      "For businesses that want useful search visibility and a website that answers the questions customers actually ask.",
    features: [
      "Technical audit",
      "Keyword mapping",
      "On-page structure",
      "Local search setup",
      "Content planning",
      "Internal linking",
      "Search reporting",
      "Performance review",
    ],
    solutions: ["Local SEO", "Technical SEO", "Content optimisation", "Google Business Profile"],
    question: "Do you guarantee a first-page ranking?",
    answer:
      "No. Rankings depend on competition, search systems and many factors outside any agency’s control. We agree useful measures and report the work transparently.",
  },
  {
    slug: "website-redesign",
    headline: "Give your website a fresh start.",
    audience:
      "For businesses with an outdated, slow or difficult-to-use website that needs to better reflect their brand and turn visitors into enquiries.",
    features: [
      "Website audit",
      "UI refresh",
      "Speed optimization",
      "Mobile improvements",
      "Navigation improvements",
      "Enquiry flow review",
      "Content migration",
      "Redirect planning",
    ],
    solutions: [
      "Business website refresh",
      "Storefront redesign",
      "Landing page optimization",
      "Performance improvements",
    ],
    question: "Can you keep our existing content and website address?",
    answer:
      "Yes. We review your existing content, domain and platform, then plan what to retain, improve or migrate. If page URLs change, redirects are included in the agreed migration plan.",
  },
  {
    slug: "website-maintenance",
    headline: "Keep your website ready for what comes next.",
    audience:
      "For businesses that need a dependable plan for updates, monitoring and the small improvements that add up over time.",
    features: [
      "Software updates",
      "Backup planning",
      "Uptime monitoring",
      "SSL checks",
      "Security review",
      "Content updates",
      "Performance checks",
      "Support reporting",
    ],
    solutions: [
      "Annual maintenance",
      "Hosting support",
      "Website migration",
      "Ongoing improvements",
    ],
    question: "Can you maintain a website built by another team?",
    answer:
      "We start with an access and technical review. That helps us identify risks and agree a realistic maintenance scope before taking over.",
  },
];
export const services = existingServices.map((service, index) => ({
  ...service,
  ...details[index]!,
  title: index === 5 ? "Website Maintenance & AMC" : service.title,
}));
export type Service = (typeof services)[number];
export function serviceFaqs(service: Service) {
  return [
    [service.question, service.answer],
    [
      "How is the project priced?",
      "Pricing follows an agreed scope. We consider functionality, content, integrations and delivery requirements, then share a proposal with clear inclusions.",
    ],
    [
      "What happens after launch?",
      "We provide the agreed handover and discuss ongoing support. Maintenance, updates and further improvements can be included in a separate support plan.",
    ],
  ];
}
