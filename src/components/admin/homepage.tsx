import type { SectionRow } from "./types";
import { useState } from "react";
import { toast } from "sonner";
import { sectionNames, sectionSchema, type Section } from "@/lib/cms/schema";
import { homepageDefaults } from "@/lib/cms/defaults";
import { api, Confirm, DataState, Field, ImageField, useData, useDirty } from "./shared";
export function HomepageManager() {
  const { data, error, reload } = useData<SectionRow[]>("homepage");
  const [selected, setSelected] = useState("hero");
  if (!data) return <DataState error={error} retry={reload} />;
  const current = data.find((s) => s.slug === selected)?.content;
  return (
    <>
      <div className="adm-page-heading">
        <div>
          <h2>Homepage</h2>
          <p>Select a section. Make it yours. Save when you’re ready.</p>
        </div>
        <a className="adm-button" href="/" target="_blank" rel="noreferrer">
          Preview Website ↗
        </a>
      </div>
      <div className="adm-home-grid">
        <nav className="adm-section-nav" aria-label="Homepage sections">
          <span className="adm-kicker">SECTIONS</span>
          {Object.entries(sectionNames).map(([key, label]) => (
            <button
              key={key}
              className={key === selected ? "active" : ""}
              onClick={() => {
                document.dispatchEvent(new CustomEvent("cms-section-select", { detail: key }));
              }}
            >
              {label}
              <span>{selected === key ? "●" : "↗"}</span>
            </button>
          ))}
        </nav>
        <SectionEditor
          key={selected}
          selected={selected}
          initial={
            typeof current === "string"
              ? JSON.parse(current)
              : current || homepageDefaults[selected]
          }
          select={setSelected}
          saved={reload}
        />
      </div>
    </>
  );
}
import { useEffect } from "react";
function SectionEditor({
  selected,
  initial,
  select,
  saved,
}: {
  selected: string;
  initial: Section;
  select: (v: string) => void;
  saved: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState("");
  const [remove, setRemove] = useState<number>();
  const dirty = JSON.stringify(form) !== baseline;
  const warning = useDirty(dirty);
  useEffect(() => {
    const handler = (event: Event) => {
      const key = (event as CustomEvent<string>).detail;
      if (key === selected) return;
      if (dirty) setPending(key);
      else select(key);
    };
    document.addEventListener("cms-section-select", handler);
    return () => document.removeEventListener("cms-section-select", handler);
  }, [dirty, select, selected]);
  const change = (key: keyof Section, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const field = (key: keyof Section, label: string, textarea = false) => (
    <Field label={label} key={key}>
      {textarea ? (
        <textarea
          rows={4}
          value={String(form[key])}
          onChange={(e) => change(key, e.target.value)}
        />
      ) : (
        <input value={String(form[key])} onChange={(e) => change(key, e.target.value)} />
      )}
    </Field>
  );
  const repeat = ["counters", "services", "why", "process", "technology", "impact"].includes(
    selected,
  );
  return (
    <>
      {warning}
      <form
        className="adm-card adm-editor-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("homepage/" + selected, "PUT", form);
            setBaseline(JSON.stringify(form));
            toast.success(
              selected === "hero"
                ? "Banner updated successfully."
                : "Section updated successfully.",
            );
            saved();
          } catch (error) {
            toast.error((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="adm-card-heading">
          <h3>{sectionNames[selected]} Settings</h3>
          <span className="adm-badge active">Homepage</span>
        </div>
        {selected !== "counters" && (
          <>
            {field("label", "Small Heading / Label")}
            {selected !== "technology" && (
              <>
                {field("heading", "Main Heading")}
                {selected === "hero" && field("highlight", "Highlighted Text")}
                {field("description", "Description", true)}
              </>
            )}
          </>
        )}
        {["hero", "services", "portfolio", "insights"].includes(selected) && (
          <div className="adm-form-grid">
            {field("buttonText", "Primary Button Text")}
            {field("buttonUrl", "Primary Button Link")}
          </div>
        )}
        {selected === "hero" && (
          <>
            <div className="adm-form-grid">
              {field("secondaryText", "Secondary Button Text")}
              {field("secondaryUrl", "Secondary Button Link")}
              <ImageField
                label="Desktop Banner Image"
                folder="homepage"
                value={form.image}
                onChange={(v) => change("image", v)}
              />
              <ImageField
                label="Mobile Banner Image"
                folder="homepage"
                value={form.mobileImage}
                onChange={(v) => change("mobileImage", v)}
              />
            </div>
            {field("imageAlt", "Image Alt Text")}
          </>
        )}
        {repeat && (
          <>
            <h3>{selected === "process" ? "Steps" : "Items"}</h3>
            {form.items.map((item, index) => (
              <div className="adm-repeater" key={index}>
                <div className="adm-card-heading">
                  <strong>
                    {index + 1}. {item.title || "New item"}
                  </strong>
                  <div className="adm-actions">
                    <button
                      type="button"
                      title="Move up"
                      disabled={!index}
                      onClick={() => move(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={index === form.items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      ↓
                    </button>
                    <button type="button" onClick={() => setRemove(index)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="adm-form-grid">
                  {(
                    [
                      "title",
                      ...(selected !== "technology" ? ["description"] : []),
                      ...(["process", "services"].includes(selected) ? ["number"] : []),
                      ...(["why", "services", "counters"].includes(selected) ? ["icon"] : []),
                      ...(["technology", "services"].includes(selected) ? ["url"] : []),
                      ...(selected === "counters" ? ["value", "suffix"] : []),
                    ] as (keyof Section["items"][number])[]
                  ).map((key) => (
                    <Field
                      key={key}
                      label={
                        key === "url"
                          ? selected === "technology"
                            ? "Icon Image URL"
                            : "Service Link"
                          : key === "icon"
                            ? "Icon (Lucide name)"
                            : key.charAt(0).toUpperCase() + key.slice(1)
                      }
                    >
                      <input
                        value={item[key]}
                        type={key === "value" ? "number" : "text"}
                        onChange={(e) =>
                          change(
                            "items",
                            form.items.map((v, i) =>
                              i === index
                                ? {
                                    ...v,
                                    [key]:
                                      key === "value" ? Number(e.target.value) : e.target.value,
                                  }
                                : v,
                            ),
                          )
                        }
                      />
                    </Field>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                change("items", [...form.items, sectionSchema.parse({ items: [{}] }).items[0]!])
              }
            >
              + Add {selected === "process" ? "Step" : "Item"}
            </button>
          </>
        )}
        <div className="adm-save-bar">
          <span>{dirty ? "Unsaved changes" : ""}</span>
          <div className="adm-actions">
            <button type="button" onClick={() => setForm(JSON.parse(baseline))}>
              Cancel
            </button>
            <button className="adm-primary" disabled={busy}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
      {pending && (
        <Confirm
          title="Leave Anyway"
          description="You have unsaved changes. Switching sections will discard them."
          onClose={() => setPending("")}
          onConfirm={() => select(pending)}
        />
      )}
      {remove !== undefined && (
        <Confirm
          title="Remove Item?"
          description="This item will be removed when you save this section."
          onClose={() => setRemove(undefined)}
          onConfirm={() =>
            change(
              "items",
              form.items.filter((_, i) => i !== remove),
            )
          }
        />
      )}
    </>
  );
  function move(index: number, delta: number) {
    const items = [...form.items];
    [items[index], items[index + delta]] = [items[index + delta]!, items[index]!];
    change("items", items);
  }
}
