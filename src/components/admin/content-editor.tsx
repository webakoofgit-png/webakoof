import type { EditorForm, StringKey, ContentRecord, Category } from "./types";
import { useState } from "react";
import { AdminLink as Link } from "./link";
import { toast } from "sonner";
import { api, DataState, Field, ImageField, Tabs, makeSlug, useData, useDirty } from "./shared";
import { RichEditor } from "./rich-editor";
import { websiteStatuses } from "@/lib/cms/availability";
import { WebsiteMonitoring } from "./website-monitoring";
const websiteTypes = ["Static", "Dynamic", "Ecommerce"];
const projectDefaults = {
  name: "",
  slug: "",
  category_id: 0,
  category_ids: [],
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
  websiteAvailability: "live" as const,
  websiteMonitoringEnabled: true,
  lastCheckedAt: "",
  lastCheckResult: "",
  adminNotes: "",
  websiteStatusUpdatedAt: "",
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
  secondaryKeywords: "",
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
  const [checking, setChecking] = useState(false);
  const normalizedService = form.service
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/website$/, "");
  const selectedWebsiteType =
    websiteTypes.find((type) => type.toLowerCase() === normalizedService) || "";
  const warning = useDirty(JSON.stringify(form) !== saved);
  const change = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) =>
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "liveUrl" && value !== f.liveUrl
        ? { lastCheckedAt: "", lastCheckResult: "" }
        : {}),
    }));
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
        {kind === "blogs" && input("secondaryKeywords", "Secondary Keywords (comma separated)")}
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
            if (kind === "portfolio" && id !== "new") {
              const records = await api<ContentRecord[]>(kind + "/" + id);
              const updated = { ...form, ...records[0] };
              setForm(updated);
              setSaved(JSON.stringify(updated));
            } else setSaved(JSON.stringify(form));
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
              {kind === "portfolio" && (
                <fieldset className="adm-field adm-category-field">
                  <legend>Additional categories</legend>
                  <small>
                    The project appears in its primary category and any categories selected here.
                  </small>
                  <div className="adm-category-options">
                    {categories
                      .filter((c) => c.id !== form.category_id)
                      .map((c) => (
                        <label key={c.id}>
                          <input
                            type="checkbox"
                            checked={(form.category_ids || []).includes(c.id)}
                            onChange={(e) =>
                              change(
                                "category_ids",
                                e.target.checked
                                  ? [...(form.category_ids || []), c.id]
                                  : (form.category_ids || []).filter((id) => id !== c.id),
                              )
                            }
                          />{" "}
                          {c.name}
                          {c.status === "inactive" ? " (inactive)" : ""}
                        </label>
                      ))}
                  </div>
                </fieldset>
              )}
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
                  {input("date", "Editorial Display Date *", "date", true)}
                  <p className="adm-help">
                    The display date orders articles. Actual publication timestamps are recorded
                    automatically when you publish.
                  </p>
                </>
              )}
            </div>
            {area(
              kind === "portfolio" ? "description" : "excerpt",
              kind === "portfolio" ? "Short Description" : "Excerpt",
            )}
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
                <div className="adm-form-grid">{image("image", "Main Thumbnail *")}</div>
                <ImageField
                  label="Showcase Video"
                  video
                  value={form.showcaseVideo || ""}
                  onChange={(url) => change("showcaseVideo", url)}
                />
                <details className="adm-seo">
                  <summary>Optional screenshots and gallery</summary>
                  <p className="adm-help">
                    Upload images here to keep them available independently of the client website.
                    Existing uploads are preserved.
                  </p>
                  <div className="adm-form-grid">
                    {image("desktopImage", "Desktop Screenshot")}
                    {image("mobileImage", "Mobile Screenshot")}
                  </div>
                  {form.gallery.map((item, index) => (
                    <div className="adm-card" key={index}>
                      <ImageField
                        label={`Gallery Image ${index + 1}`}
                        value={item.url}
                        onChange={(url) =>
                          change(
                            "gallery",
                            form.gallery.map((entry, i) =>
                              i === index ? { ...entry, url } : entry,
                            ),
                          )
                        }
                      />
                      <Field label="Alt Text">
                        <input
                          value={item.alt}
                          onChange={(e) =>
                            change(
                              "gallery",
                              form.gallery.map((entry, i) =>
                                i === index ? { ...entry, alt: e.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() =>
                          change(
                            "gallery",
                            form.gallery.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove image
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={form.gallery.length >= 30}
                    onClick={() => change("gallery", [...form.gallery, { url: "", alt: "" }])}
                  >
                    Add Gallery Image
                  </button>
                </details>
              </div>
              <div hidden={tab !== "Project Details"}>
                <h3>Project Details</h3>
                <fieldset className="adm-field">
                  <legend>Website availability</legend>
                  <p className="adm-help">
                    Live allows automatic monitoring to manage the external link. Other statuses are
                    manual overrides. An initial Live default is not a verified result.
                  </p>
                  <WebsiteMonitoring
                    id={id}
                    enabled={form.websiteMonitoringEnabled}
                    onChange={(enabled) => change("websiteMonitoringEnabled", enabled)}
                  />
                  <div className="adm-form-grid">
                    <Field label="Website Availability">
                      <select
                        value={form.websiteAvailability}
                        onChange={(e) =>
                          change(
                            "websiteAvailability",
                            e.target.value as EditorForm["websiteAvailability"],
                          )
                        }
                      >
                        {Object.entries(websiteStatuses).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Website Status Last Updated">
                      <input readOnly value={form.websiteStatusUpdatedAt || "Not updated yet"} />
                    </Field>
                  </div>
                  <button
                    type="button"
                    disabled={checking || !form.liveUrl}
                    onClick={async () => {
                      setChecking(true);
                      const checkedUrl = form.liveUrl;
                      try {
                        const result = await api<{
                          checkedAt: string;
                          result: string;
                          status: number | null;
                          redirects: number;
                        }>("check-website", "POST", { url: checkedUrl });
                        setForm((current) =>
                          current.liveUrl !== checkedUrl
                            ? current
                            : {
                                ...current,
                                lastCheckedAt: result.checkedAt,
                                lastCheckResult: `${result.result} Redirects: ${result.redirects}.`,
                              },
                        );
                        toast.success(
                          "Check complete. Review the result, choose availability and save the project.",
                        );
                      } catch (error) {
                        toast.error((error as Error).message);
                      } finally {
                        setChecking(false);
                      }
                    }}
                  >
                    {checking ? "Checking website…" : "Check Website Status"}
                  </button>
                  <div aria-live="polite">
                    {form.lastCheckedAt && (
                      <p className="adm-help">Last checked: {form.lastCheckedAt}</p>
                    )}
                    {form.lastCheckResult && <p>{form.lastCheckResult}</p>}
                  </div>
                  {area("adminNotes", "Admin Notes (private)")}
                </fieldset>
                <div className="adm-form-grid">
                  <Field label="Website Type">
                    <select
                      value={selectedWebsiteType}
                      onChange={(event) => change("service", event.target.value)}
                    >
                      <option value="" disabled>
                        {form.service ? `${form.service} (current)` : "Select website type"}
                      </option>
                      {websiteTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {lines("features", "Key Features")}
                </div>
                {area("overview", "Project Overview")}
                {area("challenge", "Challenge")}
                <details className="adm-seo">
                  <summary>Optional approach content</summary>
                  {area("approach", "Our Approach")}
                </details>
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
}
