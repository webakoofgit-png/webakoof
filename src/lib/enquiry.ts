import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enquiryServices, enquiryBudgets } from "@/data/enquiry";
import { deliverEnquiry } from "./enquiry-delivery.server";
const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  business: z.string().trim().min(2).max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\d\s.-]{7,25}$/)
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Enter at least 7 digits"),
  email: z.string().trim().email().max(254),
  service: z.enum(enquiryServices),
  budget: z.enum(enquiryBudgets),
  message: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
  website: z.string().max(0),
});
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(enquirySchema)
  .handler(async ({ data }) => {
    const { cmsEnabled, database } = await import("./cms/db.server");
    if (cmsEnabled()) {
      const { rateLimit } = await import("./cms/security.server");
      await rateLimit("enquiry:" + data.email.toLowerCase(), 5, 3600);
      await rateLimit("enquiry:global", 100, 3600);
      await database().execute(
        "INSERT INTO contact_enquiries(name,email,phone,company,service,budget,message) VALUES (?,?,?,?,?,?,?)",
        [data.name, data.email, data.phone, data.business, data.service, data.budget, data.message],
      );
      return {
        ok: true,
        message: "Your project enquiry has been sent. Thank you for sharing your plans with us.",
      };
    }
    return deliverEnquiry(data, {
      endpoint: process.env["ENQUIRY_WEBHOOK_URL"] || "",
      token: process.env["ENQUIRY_WEBHOOK_TOKEN"] || "",
    });
  });
