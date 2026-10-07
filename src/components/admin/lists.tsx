import type { ContentRecord, Category, Enquiry } from "./types";
import { useState } from "react";
import { AdminLink as Link } from "./link";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { api, Confirm, DataState, useData, date, Field, makeSlug } from "./shared";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
export function ContentList({ kind }: { kind: "portfolio" | "blogs" }) {
  const { data, error, reload } = useData<ContentRecord[]>(kind);
  const { data: categories } = useData<Category[]>(
    kind === "portfolio" ? "portfolio-categories" : "blog-categories",
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [remove, setRemove] = useState<ContentRecord>();
  if (!data) return <DataState error={error} retry={reload} />;
  const filtered = data.filter(
    (r) =>
      (r.name || r.title).toLowerCase().includes(search.toLowerCase()) &&
      (!category || String(r.category_id) === category) &&
      (!status || r.status === status),
  );
  const count = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, count);
  return (
    <>
      <div className="adm-page-heading">
        <div>
          <h2>{kind === "portfolio" ? "Portfolio Projects" : "Blogs"}</h2>
          <p>
            {data.length} {kind === "portfolio" ? "projects" : "articles"} in your collection.
          </p>
        </div>
        <Link to={`/admin/${kind}/new`} className="adm-button adm-primary">
          <Plus size={17} /> Add {kind === "portfolio" ? "Project" : "Blog"}
        </Link>
      </div>
      <section className="adm-card">
        <div className="adm-filters">
          <label className="adm-search">
            <Search size={18} />
            <input
              aria-label="Search content"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            aria-label="Category filter"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Status filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="adm-table-wrap">
          <table>
            <thead>
              <tr>
                <th>{kind === "portfolio" ? "Project" : "Blog"}</th>
                <th>Category</th>
                <th>Status</th>
                {kind === "portfolio" && <th>Featured</th>}
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 10, current * 10).map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="adm-table-name">
                      {r.image ? (
                        <img src={r.image} alt="" />
                      ) : (
                        <span className="adm-thumbnail-placeholder">w.</span>
                      )}
                      <span>
                        <strong>{r.name || r.title}</strong>
                        <small>/{r.slug}</small>
                      </span>
                    </div>
                  </td>
                  <td>{categories?.find((c) => c.id === r.category_id)?.name || "—"}</td>
                  <td>
                    <span className={"adm-badge " + r.status}>{r.status}</span>
                  </td>
                  {kind === "portfolio" && <td>{r.featured ? "Yes" : "—"}</td>}
                  <td>{date(r.date || r.created_at)}</td>
                  <td>
                    <div className="adm-row-actions">
                      {r.status === "draft" && (
                        <Link to={`/admin/preview/${kind}/${r.id}`} title="Preview draft">
                          <Eye size={17} />
                        </Link>
                      )}
                      {r.status === "published" && (
                        <a
                          href={`/${kind === "blogs" ? "blog" : "portfolio"}/${r.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View published page"
                        >
                          <Eye size={17} />
                        </a>
                      )}
                      <Link to={`/admin/${kind}/${r.id}`} title="Edit">
                        <Pencil size={17} />
                      </Link>
                      <button title="Delete" onClick={() => setRemove(r)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="adm-empty">
              <h3>No {kind === "portfolio" ? "projects" : "blogs"} found.</h3>
              <p>Add your first item or try different filters.</p>
            </div>
          )}
        </div>
        <div className="adm-pagination">
          <span>
            {filtered.length} results · Page {current} of {count}
          </span>
          <div>
            <button disabled={current === 1} onClick={() => setPage(current - 1)}>
              Previous
            </button>
            <button disabled={current === count} onClick={() => setPage(current + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>
      {remove && (
        <Confirm
          title={`Delete ${kind === "portfolio" ? "Project" : "Blog"}?`}
          description={`Are you sure you want to delete “${remove.name || remove.title}”? This action cannot be undone.`}
          onClose={() => setRemove(undefined)}
          onConfirm={async () => {
            await api(`${kind}/${remove.id}`, "DELETE");
            toast.success("Deleted successfully.");
            reload();
          }}
        />
      )}
    </>
  );
}
export function Categories({ kind }: { kind: "portfolio" | "blogs" }) {
  const endpoint = kind === "portfolio" ? "portfolio-categories" : "blog-categories";
  const { data, error, reload } = useData<Category[]>(endpoint);
  const [edit, setEdit] = useState<Partial<Category>>();
  const [remove, setRemove] = useState<Partial<Category>>();
  const [busy, setBusy] = useState(false);
  if (!data) return <DataState error={error} retry={reload} />;
  return (
    <>
      <div className="adm-page-heading">
        <div>
          <h2>{kind === "portfolio" ? "Portfolio" : "Blog"} Categories</h2>
          <p>Keep your content easy to discover.</p>
        </div>
        <button
          className="adm-primary"
          onClick={() => setEdit({ id: 0, name: "", slug: "", description: "", status: "active" })}
        >
          <Plus size={17} /> Add Category
        </button>
      </div>
      <section className="adm-card adm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <small className="adm-block">{c.description}</small>
                </td>
                <td>{c.slug}</td>
                <td>
                  <span className={"adm-badge " + c.status}>{c.status}</span>
                </td>
                <td>
                  <div className="adm-row-actions">
                    <button title="Edit category" onClick={() => setEdit(c)}>
                      <Pencil size={17} />
                    </button>
                    <button title="Delete category" onClick={() => setRemove(c)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.length && <p className="adm-empty">No categories yet. Add your first category.</p>}
      </section>
      {edit && (
        <Dialog open onOpenChange={(v) => !v && !busy && setEdit(undefined)}>
          <DialogContent className="adm adm-dialog">
            <DialogTitle>{edit.id ? "Edit" : "Add"} Category</DialogTitle>
            <DialogDescription>Categories organise your public content.</DialogDescription>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await api(
                    endpoint + (edit.id ? "/" + edit.id : ""),
                    edit.id ? "PUT" : "POST",
                    edit,
                  );
                  toast.success("Category saved successfully.");
                  setEdit(undefined);
                  reload();
                } catch (error) {
                  toast.error((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="Category Name *">
                <input
                  required
                  value={edit.name}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      name: e.target.value,
                      ...(!edit.id ? { slug: makeSlug(e.target.value) } : {}),
                    })
                  }
                />
              </Field>
              <Field label="Slug *">
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  value={edit.slug}
                  onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={edit.description}
                  onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <select
                  value={edit.status}
                  onChange={(e) =>
                    setEdit({ ...edit, status: e.target.value as Category["status"] })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
              <div className="adm-actions">
                <button type="button" onClick={() => setEdit(undefined)}>
                  Cancel
                </button>
                <button className="adm-primary" disabled={busy}>
                  {busy ? "Saving…" : "Save Category"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {remove && (
        <Confirm
          title="Delete Category?"
          description={`Delete “${remove.name}”? Categories containing content must be emptied first.`}
          onClose={() => setRemove(undefined)}
          onConfirm={async () => {
            await api(endpoint + "/" + remove.id, "DELETE");
            toast.success("Category deleted.");
            reload();
          }}
        />
      )}
    </>
  );
}
export function Enquiries() {
  const { data, error, reload } = useData<Enquiry[]>("enquiries");
  const [selected, setSelected] = useState<Enquiry>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  if (!data) return <DataState error={error} retry={reload} />;
  const filtered = data.filter(
    (r) =>
      (r.name + " " + r.phone + " " + r.email).toLowerCase().includes(search.toLowerCase()) &&
      (!status || r.status === status),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  async function update(status: Enquiry["status"]) {
    if (!selected) return;
    setBusy(true);
    try {
      await api("enquiries/" + selected.id, "PUT", { status });
      setSelected({ ...selected, status });
      toast.success("Enquiry status updated.");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="adm-page-heading">
        <div>
          <h2>Enquiries</h2>
          <p>Turn the next conversation into a great project.</p>
        </div>
      </div>
      <section className="adm-card">
        <div className="adm-filters">
          <input
            aria-label="Search enquiries"
            placeholder="Search name, email or phone…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            aria-label="Enquiry status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {["new", "contacted", "closed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="adm-table-wrap">
          <table>
            <thead>
              <tr>
                {["Name", "Phone", "Service", "Date", "Status", "View"].map((t) => (
                  <th key={t}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 10, current * 10).map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.phone}</td>
                  <td>{r.service}</td>
                  <td>{date(r.created_at)}</td>
                  <td>
                    <span className={"adm-badge " + r.status}>{r.status}</span>
                  </td>
                  <td>
                    <button title="View enquiry" onClick={() => setSelected(r)}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="adm-empty">No enquiries to show.</p>}
        </div>
        <div className="adm-pagination">
          <span>
            {filtered.length} enquiries · Page {current} of {pages}
          </span>
          <div>
            <button disabled={current === 1} onClick={() => setPage(current - 1)}>
              Previous
            </button>
            <button disabled={current === pages} onClick={() => setPage(current + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(undefined)}>
        <SheetContent className="adm adm-enquiry-drawer">
          <SheetTitle>{selected?.name}</SheetTitle>
          <SheetDescription>Project enquiry · {date(selected?.created_at)}</SheetDescription>
          {selected && (
            <>
              <dl>
                {[
                  ["Email", "email"],
                  ["Phone", "phone"],
                  ["Company", "company"],
                  ["Service", "service"],
                  ["Budget", "budget"],
                  ["Status", "status"],
                  ["Message", "message"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{selected[key as keyof Enquiry]}</dd>
                  </div>
                ))}
              </dl>
              <div className="adm-actions">
                <button
                  disabled={busy || selected.status === "contacted"}
                  className="adm-primary"
                  onClick={() => update("contacted")}
                >
                  Mark as Contacted
                </button>
                <button
                  disabled={busy || selected.status === "closed"}
                  onClick={() => update("closed")}
                >
                  Mark as Closed
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
