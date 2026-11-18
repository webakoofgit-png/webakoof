import type { Article } from "./blog";

export const domainNameGuide: Article = {
  slug: "how-to-choose-the-right-domain-name",
  title: "How to Choose the Right Domain Name for Your Business",
  category: "Website Development",
  excerpt:
    "Choose a domain customers can remember, check the name before registering, and keep ownership with your business.",
  date: "2026-11-18",
  readTime: "3 min read",
  art: "website",
  quote: "Choose a name customers can type correctly after hearing it once.",
  sections: [
    {
      id: "shortlist",
      title: "Start with your business name",
      paragraphs: [
        "List a few names that match how customers already refer to your business. Say each one aloud and ask someone to type it. If they repeatedly misspell it, try a shorter version. Avoid adding hyphens or numbers unless they are part of your brand.",
        "Give yourself room to expand. A name tied to one product or neighbourhood can become limiting if you later offer more services or serve a wider area.",
      ],
    },
    {
      id: "extension",
      title: "Choose an extension your customers recognise",
      paragraphs: [
        "Consider .com for a broad audience or .in if your business primarily serves India. Compare availability, renewal prices and transfer terms before choosing. Check whether similar domains belong to businesses customers might confuse with yours.",
      ],
    },
    {
      id: "ownership",
      title: "Check the name and keep control of the account",
      paragraphs: [
        "Search for similar businesses and trademarks before committing to a name. Check how the domain looks in an email address and on printed material.",
        "Register the domain in a business-controlled account. Enable two-factor authentication and renewal reminders, and record who can manage DNS and billing. If you already use an older domain, plan redirects and email migration before switching.",
      ],
    },
  ],
};
