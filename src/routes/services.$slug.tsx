import { createFileRoute, notFound } from "@tanstack/react-router";
import { ServiceDetailPage } from "@/components/services/services-page";
import { services, serviceFaqs } from "@/data/services";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { slug: service.slug };
  },
  head: ({ loaderData }) => {
    const s = services.find((s) => s.slug === loaderData?.slug);
    return s
      ? seo(s.title, s.description, `/services/${s.slug}`, [
          {
            "@type": "Service",
            name: s.title,
            description: s.description,
            provider: { "@type": "Organization", name: "Webakoof" },
          },
          {
            "@type": "FAQPage",
            mainEntity: serviceFaqs(s).map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          },
        ])
      : {};
  },
  component: Page,
});
function Page() {
  const { slug } = Route.useLoaderData();
  return <ServiceDetailPage service={services.find((s) => s.slug === slug)!} />;
}
