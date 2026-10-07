import {
  useEffect,
  useState,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
import { useBlocker } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export async function api<T = unknown>(path: string, method = "GET", data?: unknown): Promise<T> {
  const response = await fetch("/api/cms/" + path, {
    method,
    headers: data instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...(data === undefined ? {} : { body: data instanceof FormData ? data : JSON.stringify(data) }),
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== "login" && location.pathname !== "/admin/login")
      location.assign("/admin/login");
    throw new Error(result.error || "Unable to complete this request.");
  }
  return result;
}
export function useData<T = unknown>(path: string) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setData(undefined);
    setError("");
    api<T>(path)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [path, version]);
  return { data, error, reload: () => setVersion((v) => v + 1) };
}
export function DataState({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="adm-card adm-empty" role={error ? "alert" : "status"}>
      {error ? (
        <>
          <h2>Unable to load content</h2>
          <p>{error}</p>
          {retry && <button onClick={retry}>Try again</button>}
        </>
      ) : (
        <>
          <div className="adm-skeleton" />
          <p>Loading your workspace…</p>
        </>
      )}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className="adm-field" htmlFor={id}>
      <span id={id + "-label"}>{label}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ id: string; "aria-labelledby": string }>, {
            id,
            "aria-labelledby": id + "-label",
          })
        : children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Confirm({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="adm-dialog">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="adm-actions">
          <button disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            className="adm-danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : title}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function useDirty(dirty: boolean) {
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    withResolver: true,
    enableBeforeUnload: dirty,
  });
  return blocker.status === "blocked" ? (
    <Dialog open>
      <DialogContent className="adm-dialog">
        <DialogTitle>You have unsaved changes.</DialogTitle>
        <DialogDescription>Leave this page and discard your changes?</DialogDescription>
        <div className="adm-actions">
          <button onClick={() => blocker.reset()}>Continue Editing</button>
          <button className="adm-primary" onClick={() => blocker.proceed()}>
            Leave Anyway
          </button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
}
export function ImageField({
  label,
  value,
  onChange,
  folder = "portfolio",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="adm-field">
      <span>{label}</span>
      {value && <img className="adm-image-preview" src={value} alt={label} />}
      <div className="adm-actions">
        <label className="adm-upload">
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input
            aria-label={label}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                const form = new FormData();
                form.set("file", file);
                form.set("folder", folder);
                form.set("alt", label);
                onChange((await api<{ url: string }>("upload", "POST", form)).url);
                toast.success("Image uploaded. Save your changes to use it.");
              } catch (error) {
                toast.error((error as Error).message);
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>
      <small>JPG, PNG or WebP. Maximum 5 MB.</small>
    </div>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="adm-tabs" role="tablist">
      {items.map((item) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === item}
          className={value === item ? "active" : ""}
          onClick={() => onChange(item)}
          key={item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const date = (value?: string) => value?.slice(0, 10) || "—";
