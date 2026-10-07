import { createFileRoute } from "@tanstack/react-router";
import { ContentList, Categories, Enquiries } from "@/components/admin/lists";
import { ContentEditor } from "@/components/admin/content-editor";
import { HomepageManager } from "@/components/admin/homepage";
import { SettingsPage, ProfilePage } from "@/components/admin/settings";
import { ContentPreview } from "@/components/admin/preview";
export const Route = createFileRoute("/admin/$")({ component: Page });
function Page() {
  const { _splat } = Route.useParams();
  const [section, id, recordId] = (_splat || "").split("/");
  if (section === "preview" && (id === "portfolio" || id === "blogs") && recordId)
    return <ContentPreview kind={id} id={recordId} />;
  if (section === "homepage") return <HomepageManager />;
  if (section === "settings") return <SettingsPage />;
  if (section === "profile") return <ProfilePage />;
  if (section === "enquiries") return <Enquiries />;
  if (section === "portfolio" || section === "blogs") {
    if (id === "categories") return <Categories kind={section} />;
    if (id) return <ContentEditor kind={section} id={id} />;
    return <ContentList kind={section} />;
  }
  return <p>Page not found.</p>;
}
