import aurora from "@/assets/project-aurora.jpg";
import vertex from "@/assets/project-vertex.jpg";
import northstar from "@/assets/project-northstar.jpg";
import skincityDesktop from "@/assets/project-skincity-desktop.png";
import skincityMobile from "@/assets/project-skincity-mobile.png";

// Existing design concepts; do not present these as verified client engagements.
export type Project = {
  slug: string;
  name: string;
  industry: string;
  image: string;
  mobileImage?: string;
  service: string;
  tags: string[];
  description: string;
  challenge: string;
  approach: string;
  solution: string;
  features: string[];
  services: string[];
  liveUrl?: string;
  isConcept?: boolean;
  showcaseVideo?: string;
};
export const projects: Project[] = [
  {
    slug: "skincity-india",
    name: "SkinCity India",
    industry: "Healthcare",
    image: skincityDesktop,
    mobileImage: skincityMobile,
    service: "Website Development",
    tags: ["Healthcare", "Responsive Website"],
    description:
      "A clear, reassuring healthcare website for SkinCity India's dermatology and aesthetic care services.",
    challenge:
      "Make specialist skin, hair and aesthetic treatments easier for patients to understand and explore.",
    approach:
      "Create a calm information hierarchy with service discovery, doctor context and clear appointment pathways.",
    solution:
      "A responsive healthcare website that brings clinical expertise, treatment information and enquiry actions together.",
    features: [
      "Treatment discovery",
      "Doctor-led trust signals",
      "Appointment pathways",
      "Responsive layouts",
    ],
    services: ["website-development", "website-redesign", "website-maintenance"],
    liveUrl: "https://skincityindia.in",
    isConcept: false,
    showcaseVideo: "/projects/skincity.mp4",
  },
  {
    slug: "rockals",
    name: "Rockals",
    industry: "E-Commerce",
    image: "/projects/Rockals.png",
    service: "E-commerce Website Development",
    tags: ["E-Commerce", "Responsive Website"],
    description:
      "A polished skincare shopping experience built to make product discovery feel simple, premium and considered.",
    challenge:
      "Present a growing skincare range clearly while keeping the customer journey focused on trust, discovery and purchase.",
    approach:
      "Use clean visual storytelling, focused product navigation and a responsive layout that keeps key shopping actions within reach.",
    solution:
      "A responsive e-commerce website that combines brand-led product presentation with a smooth path from browsing to checkout.",
    features: [
      "Product discovery",
      "Collection navigation",
      "Trust-building product content",
      "Responsive shopping journey",
    ],
    services: ["website-development", "ecommerce-development", "website-maintenance"],
    liveUrl: "https://rockals.in",
    isConcept: false,
    showcaseVideo: "/projects/rockals.mp4",
  },
  {
    slug: "aurora-botanics",
    name: "Aurora Botanics",
    industry: "E-Commerce",
    image: aurora,
    service: "Storefront & conversion design",
    tags: ["WooCommerce", "UI/UX"],
    description: "A considered shopping experience for a botanical skincare brand.",
    challenge:
      "Make a broad product range feel easy to explore without losing the quiet character of the brand.",
    approach:
      "Organise discovery around customer needs, then give product information room to breathe.",
    solution:
      "An editorial storefront concept with product-led navigation and a clear route to checkout.",
    features: [
      "Product collections",
      "Responsive product cards",
      "Brand storytelling",
      "Clear purchase journey",
    ],
    services: ["website-development", "ecommerce-development", "website-redesign"],
  },
  {
    slug: "vertex-health",
    name: "Vertex Health",
    industry: "Healthcare",
    image: vertex,
    service: "Web application & appointment journey",
    tags: ["React", "Web App"],
    description: "A calmer way to discover care and find the next step.",
    challenge: "Reduce the effort needed to understand services and start an appointment enquiry.",
    approach: "Prioritise readable information, service discovery and a clear appointment pathway.",
    solution:
      "A healthcare interface concept that brings service information and appointment entry points together.",
    features: [
      "Service directory",
      "Appointment entry points",
      "Accessible hierarchy",
      "Mobile layouts",
    ],
    services: ["custom-web-development", "website-development", "website-maintenance"],
  },
  {
    slug: "northstar-estates",
    name: "Northstar Estates",
    industry: "Corporate",
    image: northstar,
    service: "Website & lead generation",
    tags: ["Website", "SEO"],
    description: "A confident digital showcase for a property business.",
    challenge: "Help visitors understand the offer and move from browsing to a relevant enquiry.",
    approach:
      "Use a strong visual hierarchy with concise project information and contextual calls to action.",
    solution:
      "A property website concept balancing large imagery with useful detail and enquiry routes.",
    features: [
      "Property showcase",
      "Project information",
      "Enquiry journeys",
      "Search-ready structure",
    ],
    services: ["website-development", "seo", "website-redesign", "website-maintenance"],
  },
];
