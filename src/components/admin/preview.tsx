import { useData, DataState } from "./shared";
import type { ContentRecord } from "./types";
import { BlogDetailPage } from "@/components/blog/blog-page";
import { ProjectDetailPage } from "@/components/portfolio/portfolio-page";
import { ContentContext } from "@/lib/cms/context";
import { settingsDefaults } from "@/lib/cms/defaults";
export function ContentPreview({ kind, id }: { kind: "blogs" | "portfolio"; id: string }) {
  const { data, error, reload } = useData<ContentRecord[]>(kind + "/" + id);
  if (!data) return <DataState error={error} retry={reload} />;
  const record = data[0];
  if (!record) return <p>Content not found.</p>;
  return (
    <>
      <p className="adm-card adm-empty">
        Private preview · {record.status} · This preview is visible only to signed-in
        administrators.
      </p>
      <ContentContext.Provider
        value={{
          projects: kind === "portfolio" ? [record] : [],
          articles: kind === "blogs" ? [{ ...record, category: "" }] : [],
          sections: {},
          settings: settingsDefaults,
          enabled: true,
          portfolioCategories: [],
          blogCategories: [],
        }}
      >
        {kind === "blogs" ? (
          <BlogDetailPage article={{ ...record, category: "" }} />
        ) : (
          <ProjectDetailPage project={record} />
        )}
      </ContentContext.Provider>
    </>
  );
}
