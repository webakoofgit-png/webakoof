import { sectionSchema, type Section } from "./schema";
export const homepageDefaults: Record<string, Section> = Object.fromEntries(
  Object.entries({
    hero: {
      label: "WEBSITES · TECHNOLOGY · DIGITAL GROWTH",
      heading: "We build digital experiences that",
      highlight: "move businesses forward.",
      description:
        "Webakoof by Praavi Consultants designs and develops high-performing websites, e-commerce platforms and digital solutions that help businesses grow online.",
      buttonText: "Start Your Project",
      buttonUrl: "/contact",
      secondaryText: "Explore Our Work",
      secondaryUrl: "/portfolio",
      image: "/cms-seed/hero-real-workspace.jpg",
      imageAlt:
        "Laptop displaying a visual website alongside a notebook, phone and plant on a real workspace desk",
    },
    counters: {
      items: [
        {
          icon: "Rocket",
          value: 150,
          suffix: "+",
          title: "Projects Deployed",
          description: "Ideas brought to life online.",
        },
        {
          icon: "CalendarDays",
          value: 2,
          suffix: "+",
          title: "Years of Experience",
          description: "Practical expertise, every step.",
        },
        {
          icon: "Layers3",
          value: 6,
          title: "Digital Services",
          description: "From your website to digital growth.",
        },
        {
          icon: "Route",
          value: 7,
          title: "Delivery Stages",
          description: "A clear path from discovery to support.",
        },
        {
          icon: "Code2",
          value: 13,
          title: "Technologies",
          description: "The right tools for your business.",
        },
      ],
    },
    services: {
      label: "01 / WHAT WE DO",
      heading: "The right expertise. All working together.",
      buttonText: "All Services",
      buttonUrl: "/services",
    },
    portfolio: {
      label: "02 / SELECTED DIRECTIONS",
      heading: "Different businesses. Distinctive experiences.",
      description: "Explore our existing design concepts and the thinking behind them.",
      buttonText: "Explore Our Work",
      buttonUrl: "/portfolio",
    },
    why: {
      label: "03 / THE WEBAKOOF WAY",
      heading: "A little more thought. A lot more purpose.",
      description:
        "Clear communication, considered choices and a shared understanding of what success should look like.",
    },
    process: {
      label: "HOW WE GET THERE",
      heading: "A clear path. From first idea to what’s next.",
    },
    technology: { label: "THE TOOLS BEHIND THE THINKING" },
    impact: {
      label: "BUILT WITH THE OUTCOME IN MIND",
      heading: "A better website is only the beginning.",
      items: [
        {
          title: "Credibility",
          description: "A digital presence that reflects the quality of your business.",
        },
        {
          title: "Clarity",
          description: "Help people understand your offer and take the next step.",
        },
        { title: "Continuity", description: "A foundation that can evolve with your business." },
      ],
    },
    insights: {
      label: "A FRESH PERSPECTIVE",
      heading: "Make your next digital decision a clearer one.",
      buttonText: "Explore Insights",
      buttonUrl: "/blog",
    },
  }).map(([key, value]) => [key, sectionSchema.parse(value)]),
);
export const settingsDefaults = {
  website: "",
  name: "Webakoof",
  logo: "",
  favicon: "/favicon.svg",
  email: "webakoofbypraavi@gmail.com",
  phone: "+91 9699369117",
  whatsapp: "919699369117",
  address:
    "1st Floor, Anand Complex, Pune - Solapur Rd, near Ambika Jewellers, Loni Kalbhor, Pune, Maharashtra 412201",
  instagram: "https://www.instagram.com/webakooflabs",
  facebook: "https://www.facebook.com/share/1BfQR4cyDY/",
  linkedin: "https://www.linkedin.com/company/webakoof-labs/",
  youtube: "",
  metaTitle: "Websites, Technology & Digital Growth",
  metaDescription:
    "Webakoof by Praavi Consultants builds thoughtful websites, e-commerce stores and digital solutions around your business.",
  ogImage: "/social-card.png",
};
