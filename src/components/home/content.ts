import {
  Globe2,
  ShoppingBag,
  Code2,
  Search,
  RefreshCw,
  ServerCog,
  Target,
  PenTool,
  Smartphone,
  Gauge,
  LifeBuoy,
} from "lucide-react";
export const services = [
  {
    number: "01",
    title: "Website Design & Development",
    description:
      "Modern, responsive and conversion-focused websites designed around your business.",
    icon: Globe2,
    items: ["Static Websites", "Dynamic Websites", "Corporate Websites", "Landing Pages"],
  },
  {
    number: "02",
    title: "E-Commerce Development",
    description: "Reliable online stores designed to turn product discovery into smooth purchases.",
    icon: ShoppingBag,
    items: ["Online Stores", "Payment Integration", "Order Management", "WooCommerce / Custom"],
  },
  {
    number: "03",
    title: "Custom Web Applications",
    description:
      "Purpose-built digital systems that simplify operations and create new opportunities.",
    icon: Code2,
    items: ["Admin Panels", "CRM Systems", "Dashboards", "Portals & LMS"],
  },
  {
    number: "04",
    title: "SEO & Google Growth",
    description:
      "A search-ready foundation and focused visibility strategy for meaningful discovery.",
    icon: Search,
    items: ["SEO", "Local SEO", "Google Business Profile", "Website Audits"],
  },
  {
    number: "05",
    title: "Website Redesign & Optimization",
    description:
      "Transform your existing website with a fresh design, faster loading and a smoother mobile experience.",
    icon: RefreshCw,
    items: ["UI Refresh", "Speed Optimization", "Mobile Improvements", "Enquiry Flow"],
  },
  {
    number: "06",
    title: "Website Maintenance & AMC",
    description: "The technical essentials and dependable support that keep your website healthy.",
    icon: ServerCog,
    items: ["Domain & Hosting", "SSL", "Migration", "AMC Support"],
  },
];
export const reasons = [
  ["Business-First Approach", "We understand your business before we start designing.", Target],
  ["Custom UI/UX", "Every experience is shaped around the brand and its audience.", PenTool],
  ["Mobile-First Development", "Every journey is considered across screen sizes.", Smartphone],
  ["SEO-Friendly Foundation", "Clean structure prepared for long-term search visibility.", Search],
  ["Performance Focused", "Fast, reliable experiences built to keep visitors engaged.", Gauge],
  ["Post-Launch Support", "Practical support continues after your website goes live.", LifeBuoy],
] as const;
export const process = [
  ["01", "Discover", "Understand the business, audience and goals."],
  ["02", "Strategy", "Plan the structure, functionality and journey."],
  ["03", "Design", "Create a modern experience aligned with the brand."],
  ["04", "Develop", "Build a responsive, functional digital product."],
  ["05", "Test", "Validate performance, devices and functionality."],
  ["06", "Launch", "Configure hosting and deploy with care."],
  ["07", "Support", "Keep improving after go-live."],
] as const;
export const technologies = [
  { name: "WordPress", icon: "https://cdn.simpleicons.org/wordpress/21759B" },
  { name: "WooCommerce", icon: "https://cdn.simpleicons.org/woocommerce/96588A" },
  { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB" },
  { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/111111" },
  { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript/F7DF1E" },
  { name: "HTML5", icon: "https://cdn.simpleicons.org/html5/E34F26" },
  { name: "CSS3", icon: "https://cdn.simpleicons.org/css/1572B6" },
  { name: "Bootstrap", icon: "https://cdn.simpleicons.org/bootstrap/7952B3" },
  { name: "PHP", icon: "https://cdn.simpleicons.org/php/777BB4" },
  { name: "MySQL", icon: "https://cdn.simpleicons.org/mysql/4479A1" },
  { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/5FA04E" },
  { name: "Vercel", icon: "https://cdn.simpleicons.org/vercel/111111" },
  { name: "Hostinger", icon: "https://cdn.simpleicons.org/hostinger/673DE6" },
];
