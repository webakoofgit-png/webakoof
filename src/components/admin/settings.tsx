import type { AdminProfile } from "./types";
import { useState } from "react";
import { toast } from "sonner";
import { settingsDefaults } from "@/lib/cms/defaults";
import { api, useData, DataState, Field, Tabs, ImageField, useDirty } from "./shared";
export function SettingsPage() {
  const { data, error, reload } = useData<typeof settingsDefaults>("settings");
  if (!data) return <DataState error={error} retry={reload} />;
  return <SettingsForm initial={{ ...settingsDefaults, ...data }} />;
}
function SettingsForm({ initial }: { initial: typeof settingsDefaults }) {
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [tab, setTab] = useState("General");
  const [busy, setBusy] = useState(false);
  const warning = useDirty(JSON.stringify(form) !== baseline);
  const fields: Record<string, [keyof typeof form, string][]> = {
    General: [
      ["name", "Website Name"],
      ["logo", "Logo"],
      ["favicon", "Favicon"],
    ],
    Contact: [
      ["website", "Website URL"],
      ["email", "Email"],
      ["phone", "Phone"],
      ["whatsapp", "WhatsApp"],
      ["address", "Address"],
    ],
    "Social Media": [
      ["instagram", "Instagram"],
      ["facebook", "Facebook"],
      ["linkedin", "LinkedIn"],
      ["youtube", "YouTube"],
    ],
    SEO: [
      ["metaTitle", "Default Meta Title"],
      ["metaDescription", "Default Meta Description"],
      ["ogImage", "Default OG Image"],
    ],
  };
  return (
    <>
      {warning}
      <div className="adm-page-heading">
        <div>
          <h2>Website Settings</h2>
          <p>Your brand, contact details and search appearance.</p>
        </div>
      </div>
      <Tabs items={Object.keys(fields)} value={tab} onChange={setTab} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("settings", "PUT", form);
            setBaseline(JSON.stringify(form));
            toast.success("Website settings updated.");
          } catch (error) {
            toast.error((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="adm-card adm-editor-card adm-form-grid">
          {fields[tab]!.map(([key, label]) =>
            ["logo", "favicon", "ogImage"].includes(key) ? (
              <ImageField
                key={key}
                folder="settings"
                label={label}
                value={form[key]}
                onChange={(value) => setForm({ ...form, [key]: value })}
              />
            ) : (
              <Field key={key} label={label}>
                <input
                  type={key === "email" ? "email" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </Field>
            ),
          )}
        </div>
        <div className="adm-save-bar">
          <span>{JSON.stringify(form) !== baseline ? "Unsaved changes" : ""}</span>
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
    </>
  );
}
export function ProfilePage() {
  const { data, error, reload } = useData<AdminProfile>("profile");
  if (!data) return <DataState error={error} retry={reload} />;
  return <ProfileForm initial={data} />;
}
function ProfileForm({ initial }: { initial: AdminProfile }) {
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const warning = useDirty(dirty);
  return (
    <>
      {warning}
      <div className="adm-page-heading">
        <div>
          <h2>Admin Profile</h2>
          <p>Keep your details and account secure.</p>
        </div>
      </div>
      <form
        className="adm-card adm-editor-card adm-profile-form"
        onChange={() => setDirty(true)}
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const values = Object.fromEntries(new FormData(form));
          setBusy(true);
          try {
            const response = await api<{ signInAgain: boolean }>("profile", "PUT", values);
            setDirty(false);
            toast.success("Profile updated.");
            if (response.signInAgain) setTimeout(() => window.location.assign("/admin/login"), 0);
            else form.reset();
          } catch (error) {
            toast.error((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Name">
          <input name="name" defaultValue={initial.name} required />
        </Field>
        <Field label="Email">
          <input name="email" type="email" defaultValue={initial.email} required />
        </Field>
        <h3 id="password">Change Password</h3>
        <Field label="Current Password *" hint="Required to save any profile changes.">
          <input name="currentPassword" type="password" autoComplete="current-password" required />
        </Field>
        <Field
          label="New Password"
          hint="At least 12 characters. Leave empty to keep your current password."
        >
          <input name="password" type="password" minLength={12} autoComplete="new-password" />
        </Field>
        <button className="adm-primary" disabled={busy}>
          {busy ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </>
  );
}
