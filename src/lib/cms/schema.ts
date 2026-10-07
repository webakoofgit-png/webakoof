import { z } from "zod";
export const text = z.string().trim().max(10000);
export const url = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) => !v || /^\/(?!\/)[^\\]*$/.test(v) || /^https?:\/\//i.test(v),
    "Use a relative path or an HTTP(S) URL.",
  );
const slug = z
  .string()
  .min(1)
  .max(220)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");
export const categorySchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug,
  description: text.default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});
export const projectSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    slug,
    category_id: z.coerce.number().int().positive(),
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
    include_in_catalogue: z.boolean().default(false),
    catalogue_order: z.number().int().min(0).max(1000000).nullable().default(null),
    clientName: text.default(""),
    description: text.default(""),
    fullDescription: text.default(""),
    image: url.default(""),
    coverImage: url.default(""),
    desktopImage: url.default(""),
    mobileImage: url.default(""),
    gallery: z
      .array(z.object({ url, alt: text }))
      .max(30)
      .default([]),
    industry: text.default(""),
    liveUrl: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .url()
          .max(1000)
          .refine((v) => /^https?:\/\//i.test(v), "Use an HTTP(S) website URL."),
      ])
      .default(""),
    year: text.default(""),
    service: z.string().trim().max(200).default(""),
    services: z.array(text).max(30).default([]),
    tags: z.array(text).max(30).default([]),
    features: z.array(text).max(30).default([]),
    overview: text.default(""),
    challenge: text.default(""),
    approach: text.default(""),
    solution: text.default(""),
    result: text.default(""),
    metaTitle: text.default(""),
    metaDescription: text.default(""),
    ogImage: url.default(""),
    showcaseVideo: url.default(""),
    isConcept: z.boolean().default(false),
  })
  .refine((v) => v.status !== "published" || !!v.image, {
    message: "Add a thumbnail before publishing.",
    path: ["image"],
  });
export const blogSchema = z.object({
  title: z.string().trim().min(1).max(250),
  slug,
  category_id: z.coerce.number().int().positive(),
  status: z.enum(["draft", "published"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excerpt: text.default(""),
  image: url.default(""),
  imageAlt: text.default(""),
  author: text.default("Webakoof Editorial"),
  html: z.string().max(200000),
  metaTitle: text.default(""),
  metaDescription: text.default(""),
  focusKeyword: text.default(""),
  ogImage: url.default(""),
  art: text.default("website"),
  quote: text.default(""),
  readTime: text.default("5 min read"),
  sections: z.array(z.object({ id: text, title: text, paragraphs: z.array(text) })).default([]),
});
export const sectionSchema = z.object({
  label: text.default(""),
  heading: text.default(""),
  highlight: text.default(""),
  description: text.default(""),
  buttonText: text.default(""),
  buttonUrl: url.default(""),
  secondaryText: text.default(""),
  secondaryUrl: url.default(""),
  image: url.default(""),
  mobileImage: url.default(""),
  imageAlt: text.default(""),
  items: z
    .array(
      z.object({
        title: text.default(""),
        description: text.default(""),
        icon: text.default(""),
        url: url.default(""),
        number: text.default(""),
        value: z.coerce.number().min(0).max(1000000).default(0),
        suffix: text.default(""),
      }),
    )
    .max(50)
    .default([]),
});
export const settingsSchema = z.object({
  website: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .url()
        .max(1000)
        .refine((v) => /^https?:\/\//i.test(v)),
    ])
    .default(""),
  name: z.string().trim().min(1).max(100),
  logo: url,
  favicon: url,
  email: z.union([z.literal(""), z.string().email()]),
  phone: z.string().max(30),
  whatsapp: z
    .string()
    .max(30)
    .regex(/^[\d+\s]*$/),
  address: text,
  instagram: url,
  facebook: url,
  linkedin: url,
  youtube: url,
  metaTitle: text,
  metaDescription: text,
  ogImage: url,
});
export type Section = z.infer<typeof sectionSchema>;
export const sectionNames: Record<string, string> = {
  hero: "Hero Banner",
  counters: "Business Counters",
  services: "Services",
  portfolio: "Featured Portfolio",
  why: "Why Choose Us",
  process: "Process",
  technology: "Technology Stack",
  impact: "Business Impact",
  insights: "Insights CTA",
};
