export type ArticleSection = { id: string; title: string; paragraphs: string[] };
export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  art: string;
  quote: string;
  sections: ArticleSection[];
};
export const articles: Article[] = [
  {
    slug: "plan-a-business-website",
    title: "A better website starts before the first design.",
    category: "Website Development",
    excerpt: "The questions that turn a vague website brief into a useful business plan.",
    date: "2026-09-15",
    readTime: "5 min read",
    art: "website",
    quote: "Start with the decision you want your visitor to make.",
    sections: [
      {
        id: "start-with-purpose",
        title: "Start with a useful purpose",
        paragraphs: [
          "A website brief often starts with a list of pages or a reference site. A more useful starting point is the job the website needs to do. Is it helping a prospective customer compare services, understand a product or ask for a conversation?",
          "Choose one primary journey. Then identify the information a visitor needs before taking that step. This gives the project a clear centre of gravity and makes design discussions more concrete.",
        ],
      },
      {
        id: "understand-the-visitor",
        title: "Understand the visitor’s questions",
        paragraphs: [
          "Write down what a first-time visitor might be unsure about: who the service is for, what is included, how the process works and what happens after they enquire. Organise your content around those questions.",
          "Separate essential information from supporting detail. A short service overview can lead to a dedicated detail page, keeping navigation clear without making every page feel crowded.",
        ],
      },
      {
        id: "prepare-content",
        title: "Prepare the content that builds confidence",
        paragraphs: [
          "Gather approved descriptions, genuine project images, accurate contact details and permission to use any client feedback. Missing content creates uncertainty late in a project, when layout and development decisions are harder to revisit.",
          "For every claim, ask what evidence supports it. A specific explanation of your process is more useful than an impressive statistic you cannot verify.",
        ],
      },
      {
        id: "define-handover",
        title: "Plan for life after launch",
        paragraphs: [
          "Decide who will own the domain, edit content, review enquiries and maintain the site. Include those responsibilities in the brief so the solution fits the people who will use it.",
          "Before launch, walk through the main customer journeys together. Test an enquiry, review the mobile experience and confirm that the team knows how to make routine updates. A clear handover is part of a successful website.",
        ],
      },
    ],
  },
  {
    slug: "ecommerce-product-page-checklist",
    title: "Make the product page do the helpful work.",
    category: "E-Commerce",
    excerpt: "How to give shoppers the clarity they need before they reach the checkout.",
    date: "2026-09-15",
    readTime: "4 min read",
    art: "commerce",
    quote: "A product page should answer questions before they become reasons to leave.",
    sections: [
      {
        id: "show-the-product",
        title: "Show what the customer is choosing",
        paragraphs: [
          "Use consistent product imagery and make the differences between variants easy to understand. A customer should be able to tell what is included, what a size means and which option they have selected.",
          "Keep the product name and essential details close to the purchase controls. Supporting stories can add character, but should not hide the information needed to decide.",
        ],
      },
      {
        id: "explain-the-details",
        title: "Make practical details easy to find",
        paragraphs: [
          "Delivery information, return terms and availability shape the purchase decision. Place useful summaries where the customer can find them and link to the full policies when more detail is needed.",
          "Be explicit about any additional steps, such as customisation or a made-to-order lead time. Clear expectations help the customer choose with confidence.",
        ],
      },
      {
        id: "reduce-friction",
        title: "Review the journey on a small screen",
        paragraphs: [
          "Walk through selecting a variant, adding it to the cart and reviewing the order on a phone. Look for controls that are hard to tap, information that disappears and error messages that fail to explain a fix.",
          "Test the full journey with realistic product data. A neat empty layout is not a substitute for checking a long product name, several variants and an unavailable item.",
        ],
      },
    ],
  },
  {
    slug: "useful-website-measurement",
    title: "Measure what your website is meant to do.",
    category: "Business Growth",
    excerpt: "A practical way to connect reporting to real customer journeys.",
    date: "2026-09-15",
    readTime: "4 min read",
    art: "growth",
    quote: "A useful report helps you decide what to do next.",
    sections: [
      {
        id: "choose-a-question",
        title: "Choose a question before a metric",
        paragraphs: [
          "Start with a business question: are visitors finding the right service, completing an enquiry or discovering a useful product? The question gives the data a purpose.",
          "A large visitor count alone cannot explain whether the experience is useful. Pair overall activity with the steps that matter in the customer journey.",
        ],
      },
      {
        id: "agree-definitions",
        title: "Agree what each action means",
        paragraphs: [
          "Define what counts as an enquiry and how duplicates or test submissions will be handled. Make sure the people reading the report understand those definitions.",
          "Document which actions are measured and where the data comes from. This makes it easier to notice a broken event or a change in reporting later.",
        ],
      },
      {
        id: "make-one-improvement",
        title: "Turn a finding into one improvement",
        paragraphs: [
          "Use a report to choose a focused change. If visitors reach a service page but rarely continue, review the questions it answers and the clarity of its next step.",
          "Record the change and review it over a suitable period. Consider changes in traffic sources or seasonality before attributing an outcome to a design decision.",
        ],
      },
    ],
  },
];
