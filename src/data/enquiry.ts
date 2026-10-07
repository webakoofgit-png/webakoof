export const enquiryServices = [
  "Website Development",
  "E-Commerce",
  "Custom Web Application",
  "SEO",
  "Website Redesign & Optimization",
  "Website Maintenance",
  "Other",
] as const;
export const enquiryBudgets = [
  "To be discussed",
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹3,00,000",
  "Above ₹3,00,000",
] as const;
export type EnquiryService = (typeof enquiryServices)[number];
export type EnquiryBudget = (typeof enquiryBudgets)[number];
