import { createServerFn } from "@tanstack/react-start";
import type { Project } from "@/data/projects";
import type { Article } from "@/data/blog";
import type { Section } from "./schema";
import type { settingsDefaults } from "./defaults";
export type PublicContent = {
  projects: (Project & {
    featured?: boolean;
    category?: string;
    categorySlug?: string;
    include_in_catalogue?: boolean;
    catalogue_order?: number | null;
    overview?: string;
    fullDescription?: string;
    coverImage?: string;
    desktopImage?: string;
    clientName?: string;
    year?: string;
    result?: string;
    gallery?: { url: string; alt: string }[];
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  })[];
  articles: (Article & {
    image?: string;
    imageAlt?: string;
    html?: string;
    author?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  })[];
  portfolioCategories: string[];
  portfolioSectors?: { name: string; slug: string }[];
  blogCategories: string[];
  sections: Record<string, Section>;
  settings: typeof settingsDefaults;
  enabled: boolean;
};
export const getPublicContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicContent> => {
    const { loadPublicContent } = await import("./public.server");
    return loadPublicContent();
  },
);
export const getCatalogue = createServerFn({ method: "GET" })
  .validator((input: { sector?: string | undefined }) => {
    if (input.sector && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.sector))
      throw new Error("Invalid sector.");
    return input;
  })
  .handler(async ({ data }) => {
    const { loadCatalogue } = await import("./catalogue.server");
    return loadCatalogue(data.sector);
  });
