import type { z } from "zod";
import type { projectSchema, blogSchema, categorySchema, Section } from "@/lib/cms/schema";
export type EditorForm = z.infer<typeof projectSchema> & z.infer<typeof blogSchema>;
export type StringKey = {
  [K in keyof EditorForm]: EditorForm[K] extends string ? K : never;
}[keyof EditorForm];
export type ContentRecord = EditorForm & { id: number; created_at: string };
export type Category = z.infer<typeof categorySchema> & { id: number };
export type AdminProfile = { id: number; name: string; email: string };
export type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
};
export type SectionRow = { slug: string; content: Section | string };
export type DashboardRow = {
  id: number;
  name?: string;
  title?: string;
  category?: string;
  service?: string;
  status: string;
  created_at: string;
};
export type DashboardData = {
  counts: Record<"projects" | "categories" | "blogs" | "enquiries", number>;
  projects: DashboardRow[];
  blogs: DashboardRow[];
  enquiries: DashboardRow[];
};
