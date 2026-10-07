import type { EditorForm, StringKey, ContentRecord, Category } from "./types";
import { useState } from "react";
import { AdminLink as Link } from "./link";
import { toast } from "sonner";
import { api, DataState, Field, ImageField, Tabs, makeSlug, useData, useDirty } from "./shared";
import { RichEditor } from "./rich-editor";
const projectDefaults = {
  name: "",
  slug: "",
  clientName: "",
  category_id: 0,
  description: "",
  fullDescription: "",
  status: "draft" as const,
  featured: false,
  include_in_catalogue: false,
  catalogue_order: null,
  image: "",
  coverImage: "",
  desktopImage: "",
  mobileImage: "",
  gallery: [],
  industry: "",
  liveUrl: "",
  year: "",
  service: "",
  services: [],
  tags: [],
  features: [],
  overview: "",
  challenge: "",
  approach: "",
  solution: "",
  result: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  showcaseVideo: "",
  isConcept: false,
};
const blogDefaults = {
  title: "",
  slug: "",
  category_id: 0,
  excerpt: "",
  image: "",
  imageAlt: "",
  author: "Webakoof Editorial",
  html: "",
  date: new Date().toISOString().slice(0, 10),
  status: "draft" as const,
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  ogImage: "",
  sections: [],
  art: "website",
  quote: "",
  readTime: "5 min read",
};
export function ContentEditor({ kind, id }: { kind: "portfolio" | "blogs"; id: string }) {
  const { data, error, reload } = useData<ContentRecord[]>(kind + (id === "new" ? "" : "/" + id));
  const categories = useData<Category[]>(
    kind === "portfolio" ? "portfolio-categories" : "blog-categories",
  );
  if (!data || !categories.data)
    return (
      <DataState
        error={error || categories.error}
        retry={() => {
          reload();
          categories.reload();
        }}
      />
    );
  if (id !== "new" && !data[0]) return <p className="adm-empty">This item no longer exists.</p>;
  return (
    <Editor
      key={kind + id}
      kind={kind}
      id={id}
      initial={{ ...projectDefaults, ...blogDefaults, ...(id === "new" ? {} : data[0]) }}
      categories={categories.data}
    />
  );
}
function Editor({
  kind,
  id,
  initial,
  categories,
}: {
  kind: "portfolio" | "blogs";
  id: string;
  initial: EditorForm;
  categories: Category[];
}) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [tab, setTab] = useState("Basic Info");
  const [busy, setBusy] = useState(false);
  const warning = useDirty(JSON.stringify(form) !== saved);
  const change = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const input = (key: StringKey, label: string, type = "text", required = false) => (
    <Field label={label} key={key}>
      <input
        type={type}
        required={required}
        value={form[key] || ""}
        onChange={(e) => {
          change(key, e.target.value);
          if (
            (key === "name" || key === "title") &&
            id === "new" &&
            (!form.slug || form.slug === makeSlug(form[key]))
          )
            change("slug", makeSlug(e.target.value));
        }}
      />
    </Field>
  );
  const area = (key: StringKey, label: string) => (
    <Field label={label} key={key}>
      <textarea rows={4} value={form[key] || ""} onChange={(e) => change(key, e.target.value)} />
    </Field>
  );
  const image = (key: StringKey, label: string) => (
    <ImageField
      key={key}
      label={label}
      value={form[key] || ""}
      folder={kind === "blogs" ? "blog" : "portfolio"}
      onChange={(v) => change(key, v)}
    />
  );
  const lines = (key: "services" | "tags" | "features", label: string) => (
    <Field label={label} hint="One item per line." key={key}>
      <textarea
        value={(form[key] || []).join("\n")}
        onChange={(e) => change(key, e.target.value.split("\n"))}
      />
    </Field>
  );
  const seo = (
    <>
      <div className="adm-form-grid">
        {input("metaTitle", "SEO / Meta Title")}
        {input("focusKeyword", "Focus Keyword")}
        {area("metaDescription", "Meta Description")}
        {image("ogImage", "Open Graph Image")}
      </div>
      <p className="adm-help">
        Title: {form.metaTitle.length} characters · Description: {form.metaDescription.length}{" "}
        characters
      </p>
    </>
  );
  return (
    <>
      {warning}
      <div className="adm-page-heading">
        <div>
          <Link to={`/admin/${kind}`} className="adm-back">
            ← Back to {kind === "portfolio" ? "projects" : "blogs"}
          </Link>
          <h2>
            {id === "new" ? "Add" : "Edit"} {kind === "portfolio" ? "Project" : "Blog"}
          </h2>
          <p>
            {kind === "portfolio"
              ? "A clear story, from first impression to final result."
              : "Share a useful perspective with your audience."}
          </p>
        </div>
        <span className={"adm-badge " + form.status}>{form.status}</span>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api(kind + (id === "new" ? "" : "/" + id), id === "new" ? "POST" : "PUT", form);
            setSaved(JSON.stringify(form));
            toast.success(
              kind === "portfolio"
                ? "Project saved successfully."
                : form.status === "published"
                  ? "Blog published successfully."
                  : "Blog saved successfully.",
            );
            if (id === "new") setTimeout(() => window.location.assign("/admin/" + kind), 0);
          } catch (error) {
            toast.error((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {kind === "portfolio" && (
          <Tabs
            items={["Basic Info", "Media", "Project Details", "SEO"]}
            value={tab}
            onChange={setTab}
          />
        )}
        <section className="adm-card adm-editor-card">
          <div hidden={kind === "portfolio" && tab !== "Basic Info"}>
            <h3>Basic Information</h3>
            <div className="adm-form-grid">
              {input(
                kind === "portfolio" ? "name" : "title",
                kind === "portfolio" ? "Project Name *" : "Blog Title *",
                "text",
                true,
              )}
              {input("slug", "Slug *", "text", true)}
              {kind === "portfolio" && input("clientName", "Client Name")}
              {kind === "portfolio" && (
                <>
                  {input("liveUrl", "Website URL", "url")}
                  <Field
                    label="Include in Catalogue"
                    hint="Only published projects with this switch ON appear in downloads."
                  >
                    <span>
                      <input
                        aria-label="Include in Catalogue"
                        type="checkbox"
                        role="switch"
                        checked={form.include_in_catalogue}
                        onChange={(e) => change("include_in_catalogue", e.target.checked)}
                      />{" "}
                      {form.include_in_catalogue ? "ON" : "OFF"}
                    </span>
                  </Field>
                  <Field
                    label="Catalogue Order"
                    hint="Leave blank to use newest first after ordered projects."
                  >
                    <input
                      type="number"
                      min={0}
                      max={1000000}
                      step={1}
                      value={form.catalogue_order ?? ""}
                      onChange={(e) =>
                        change(
                          "catalogue_order",
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                </>
              )}
              <Field label="Category *">
                <select
                  required
                  value={form.category_id || ""}
                  onChange={(e) => change("category_id", Number(e.target.value))}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.status === "inactive" ? " (inactive)" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => change("status", e.target.value as EditorForm["status"])}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
              {kind === "portfolio" ? (
                <Field label="Featured on Homepage">
                  <select
                    value={String(!!form.featured)}
                    onChange={(e) => change("featured", e.target.value === "true")}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </Field>
              ) : (
                <>
                  {input("author", "Author")}
                  {input("date", "Publish Date *", "date", true)}
                </>
              )}
            </div>
            {area(
              kind === "portfolio" ? "description" : "excerpt",
              kind === "portfolio" ? "Short Description" : "Excerpt",
            )}
            {kind === "portfolio" && area("fullDescription", "Full Description")}
            {kind === "blogs" && (
              <>
                <div className="adm-form-grid">
                  {image("image", "Featured Image")}
                  {input("imageAlt", "Image Alt Text")}
                </div>
                <h3>Content</h3>
                <RichEditor
                  value={form.html}
                  onChange={(value) => {
                    change("html", value);
                    change("sections", []);
                  }}
                />
                <details className="adm-seo">
                  <summary>SEO Settings</summary>
                  {seo}
                </details>
              </>
            )}
          </div>
          {kind === "portfolio" && (
            <>
              <div hidden={tab !== "Media"}>
                <h3>Project Media</h3>
                <div className="adm-form-grid">
                  {image("image", "Main Thumbnail *")}
                  {image("coverImage", "Cover Image")}
                  {image("desktopImage", "Desktop Screenshot")}
                  {image("mobileImage", "Mobile Screenshot")}
                </div>
                {input("showcaseVideo", "Showcase Video URL")}
                <p className="adm-help">
                  Use the project's MP4 recording URL, for example /projects/rockals.mp4. It appears
                  in the case study's website preview section.
                </p>
                <h3>Gallery Images</h3>
                <div className="adm-gallery">
                  {form.gallery.map((item: EditorForm["gallery"][number], index: number) => (
                    <div className="adm-card" key={index}>
                      {imageGallery(item, index)}
                      <div className="adm-actions">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const gallery = [...form.gallery];
                            [gallery[index - 1], gallery[index]] = [
                              gallery[index]!,
                              gallery[index - 1]!,
                            ];
                            change("gallery", gallery);
                          }}
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          disabled={index === form.gallery.length - 1}
                          onClick={() => {
                            const gallery = [...form.gallery];
                            [gallery[index + 1], gallery[index]] = [
                              gallery[index]!,
                              gallery[index + 1]!,
                            ];
                            change("gallery", gallery);
                          }}
                        >
                          Move down
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            change(
                              "gallery",
                              form.gallery.filter((_, i) => i !== index),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => change("gallery", [...form.gallery, { url: "", alt: "" }])}
                >
                  + Add Gallery Image
                </button>
              </div>
              <div hidden={tab !== "Project Details"}>
                <h3>Project Details</h3>
                <div className="adm-form-grid">
                  {input("industry", "Industry")}
                  {input("year", "Year")}
                  {input("service", "Website Type / Service")}
                  {lines("services", "Related Service Slugs")}
                  {lines("tags", "Technology Used")}
                  {lines("features", "Key Features")}
                  <Field label="Project Type">
                    <select
                      value={String(form.isConcept)}
                      onChange={(e) => change("isConcept", e.target.value === "true")}
                    >
                      <option value="false">Client project</option>
                      <option value="true">Design concept</option>
                    </select>
                  </Field>
                </div>
                {area("overview", "Project Overview")}
                {area("challenge", "Challenge")}
                {area("approach", "Approach")}
                {area("solution", "Solution")}
                {area("result", "Result")}
              </div>
              <div hidden={tab !== "SEO"}>
                <h3>Search & Social Sharing</h3>
                {seo}
              </div>
            </>
          )}
        </section>
        <div className="adm-save-bar">
          <span>{JSON.stringify(form) !== saved ? "Unsaved changes" : "All changes saved"}</span>
          <div className="adm-actions">
            <button type="button" onClick={() => setForm(JSON.parse(saved))}>
              Cancel
            </button>
            <button className="adm-primary" disabled={busy}>
              {busy ? "Saving…" : "Save " + (kind === "portfolio" ? "Project" : "Blog")}
            </button>
          </div>
        </div>
      </form>
    </>
  );
  function imageGallery(item: EditorForm["gallery"][number], index: number) {
    return (
      <>
        <ImageField
          label={`Gallery Image ${index + 1}`}
          value={item.url}
          onChange={(url) =>
            change(
              "gallery",
              form.gallery.map((v, i) => (i === index ? { ...v, url } : v)),
            )
          }
        />
        <Field label="Alt Text">
          <input
            value={item.alt}
            onChange={(e) =>
              change(
                "gallery",
                form.gallery.map((v, i) => (i === index ? { ...v, alt: e.target.value } : v)),
              )
            }
          />
        </Field>
      </>
    );
  }
}
