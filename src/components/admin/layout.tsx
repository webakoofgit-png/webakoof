import type { AdminProfile } from "./types";
import webakoofLogo from "@/assets/webakoof_logo.png";
import { useEffect, useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { AdminLink as Link } from "./link";
import {
  LayoutDashboard,
  Home,
  FolderKanban,
  Plus,
  Tags,
  FileText,
  Inbox,
  Settings,
  User,
  LogOut,
  Menu,
  ExternalLink,
  PanelLeftClose,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { api, useData, DataState } from "./shared";
import "./admin.css";
import { useInteractive } from "@/hooks/use-interactive";
const groups: { label: string; items: [string, string, typeof Home][] }[] = [
  { label: "", items: [["Dashboard", "/admin", LayoutDashboard]] },
  { label: "WEBSITE", items: [["Homepage", "/admin/homepage", Home]] },
  {
    label: "PORTFOLIO",
    items: [
      ["All Projects", "/admin/portfolio", FolderKanban],
      ["Add Project", "/admin/portfolio/new", Plus],
      ["Categories", "/admin/portfolio/categories", Tags],
    ],
  },
  {
    label: "BLOG",
    items: [
      ["All Blogs", "/admin/blogs", FileText],
      ["Add Blog", "/admin/blogs/new", Plus],
      ["Categories", "/admin/blogs/categories", Tags],
    ],
  },
  { label: "LEADS", items: [["Enquiries", "/admin/enquiries", Inbox]] },
  {
    label: "SETTINGS",
    items: [
      ["Website Settings", "/admin/settings", Settings],
      ["Admin Profile", "/admin/profile", User],
    ],
  },
];
export function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const login = path === "/admin/login";
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <div className={"adm " + (collapsed ? "adm-collapsed" : "")}>
      <Toaster richColors position="top-right" />
      {login ? (
        <Outlet />
      ) : (
        <Protected
          path={path}
          open={open}
          setOpen={setOpen}
          collapsed={collapsed}
          toggle={() => setCollapsed(!collapsed)}
        />
      )}
    </div>
  );
}
function Protected({
  path,
  open,
  setOpen,
  collapsed,
  toggle,
}: {
  path: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  collapsed: boolean;
  toggle: () => void;
}) {
  const { data, error, reload } = useData<{ admin: AdminProfile | null }>("session");
  useEffect(() => {
    if (data && !data.admin) window.location.replace("/admin/login");
  }, [data]);
  async function logout() {
    try {
      await api("logout", "POST", {});
      window.location.assign("/admin/login");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  const nav = (
    <>
      <Link to="/admin" className="adm-brand">
        <img
          className="adm-brand-logo"
          src={webakoofLogo}
          alt="WEBakoof logo"
          width={48}
          height={48}
        />
        <span>
          WEBakoof<small>CONTENT STUDIO</small>
        </span>
      </Link>
      <nav aria-label="Admin navigation">
        {groups.map((group) => (
          <div className="adm-nav-group" key={group.label}>
            {group.label && <small>{group.label}</small>}
            {group.items.map(([title, to, Icon]) => (
              <Link key={to} to={to} title={title} className={path === to ? "active" : ""}>
                <Icon size={18} />
                <span>{title}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <button className="adm-logout" onClick={logout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </>
  );
  const title =
    groups.flatMap((g) => g.items).find((i) => i[1] === path)?.[0] ||
    (path.includes("portfolio")
      ? "Edit Project"
      : path.includes("blogs")
        ? "Edit Blog"
        : "Workspace");
  if (error || !data?.admin)
    return (
      <div className="adm-auth-loading">
        <DataState error={error} retry={reload} />
      </div>
    );
  return (
    <>
      <aside className="adm-sidebar">
        {nav}
        <button
          className="adm-collapse"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeftClose size={18} />
        </button>
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="adm adm-mobile-sidebar">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">Manage your website content</SheetDescription>
          {nav}
        </SheetContent>
      </Sheet>
      <div className="adm-workspace">
        <header className="adm-header">
          <button
            className="adm-mobile-toggle"
            onClick={() => setOpen(true)}
            aria-label="Open admin navigation"
          >
            <Menu />
          </button>
          <div>
            <small>WORKSPACE / {title.toUpperCase()}</small>
            <h1>{title}</h1>
          </div>
          <div className="adm-header-actions">
            <a href="/" target="_blank" rel="noreferrer" className="adm-button">
              View Website <ExternalLink size={15} />
            </a>
            <details className="adm-profile-menu">
              <summary>
                <span className="adm-avatar">{data.admin.name.slice(0, 1)}</span>
                <span>{data.admin.name}</span>
              </summary>
              <div>
                <Link to="/admin/profile">Profile</Link>
                <Link to="/admin/profile" hash="password">
                  Change Password
                </Link>
                <button onClick={logout}>Logout</button>
              </div>
            </details>
          </div>
        </header>
        <div className="adm-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
export function Login() {
  const interactive = useInteractive();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="adm-login">
      <section className="adm-login-brand">
        <a href="/" className="adm-brand">
          <img
            className="adm-brand-logo"
            src={webakoofLogo}
            alt="WEBakoof logo"
            width={48}
            height={48}
          />
          <span>WEBakoof</span>
        </a>
        <div>
          <span className="adm-kicker">YOUR WEBSITE. YOUR WORKSPACE.</span>
          <h1>
            Good ideas.
            <br />
            Fresh content.
            <br />
            <em>All in your hands.</em>
          </h1>
          <p>
            A simple space to manage the stories, projects and conversations that move your business
            forward.
          </p>
        </div>
        <small>WEBakoof by Praavi Consultants</small>
      </section>
      <section className="adm-login-form">
        <form
          method="post"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setPending(true);
            setError("");
            try {
              await api("login", "POST", {
                email: f.get("email"),
                password: f.get("password"),
                remember: f.get("remember") === "on",
              });
              window.location.assign("/admin");
            } catch (error) {
              setError((error as Error).message);
            } finally {
              setPending(false);
            }
          }}
        >
          <span className="adm-kicker">WELCOME BACK</span>
          <h2>Sign in to your workspace.</h2>
          <p>Manage your website with a little more ease.</p>
          <label className="adm-field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@company.com"
            />
          </label>
          <label className="adm-field">
            <span>Password</span>
            <div className="adm-password">
              <input
                name="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setVisible(!visible)}>
                {visible ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <div className="adm-login-options">
            <label>
              <input name="remember" type="checkbox" /> Remember me
            </label>
            <button
              type="button"
              className="adm-text-button"
              onClick={() =>
                toast.info(
                  "Contact the website administrator to reset your password. Email reset is not configured yet.",
                )
              }
            >
              Forgot password?
            </button>
          </div>
          {error && (
            <p className="adm-error" role="alert">
              {error}
            </p>
          )}
          <button className="adm-primary" disabled={pending || !interactive}>
            {pending ? "Signing in…" : "Sign In →"}
          </button>
          <a href="/" className="adm-back">
            ← Back to website
          </a>
        </form>
      </section>
    </div>
  );
}
