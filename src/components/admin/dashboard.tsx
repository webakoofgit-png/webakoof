import type { DashboardData } from "./types";
import { AdminLink as Link } from "./link";
import { FolderKanban, Tags, FileText, Inbox, Plus, ArrowUpRight } from "lucide-react";
import { DataState, useData, date } from "./shared";
export function Dashboard() {
  const { data, error, reload } = useData<DashboardData>("dashboard");
  if (!data) return <DataState error={error} retry={reload} />;
  return (
    <>
      <div className="adm-page-heading">
        <div>
          <span className="adm-kicker">A LITTLE OVERVIEW</span>
          <h2>Welcome back to WEBakoof.</h2>
          <p>Your content and conversations, in one place.</p>
        </div>
        <Link to="/admin/portfolio/new" className="adm-button adm-primary">
          <Plus size={17} /> Add Project
        </Link>
      </div>
      <div className="adm-stats">
        {(
          [
            ["Total Projects", "projects", FolderKanban],
            ["Portfolio Categories", "categories", Tags],
            ["Total Blogs", "blogs", FileText],
            ["New Enquiries", "enquiries", Inbox],
          ] as const
        ).map(([label, key, Icon]) => (
          <div className="adm-card" key={key}>
            <span className="adm-stat-icon">
              <Icon size={20} />
            </span>
            <span>{label}</span>
            <strong>{data.counts[key]}</strong>
          </div>
        ))}
      </div>
      <div className="adm-dashboard-grid">
        {(
          [
            ["Recent Projects", "projects", "/admin/portfolio"],
            ["Recent Blogs", "blogs", "/admin/blogs"],
            ["Recent Enquiries", "enquiries", "/admin/enquiries"],
          ] as const
        ).map(([title, key, href]) => (
          <section className="adm-card" key={key}>
            <div className="adm-card-heading">
              <h3>{title}</h3>
              <Link to={href!}>
                View all <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{key === "enquiries" ? "Name" : key === "blogs" ? "Blog" : "Project"}</th>
                    <th>{key === "enquiries" ? "Service" : "Category"}</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data[key!].map((row) => (
                    <tr key={row.id}>
                      <td>{row.name || row.title}</td>
                      <td>{row.category || row.service}</td>
                      <td>
                        <span className={"adm-badge " + row.status}>{row.status}</span>
                      </td>
                      <td>{date(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data[key!].length && (
                <p className="adm-empty">Nothing here yet. New records will appear here.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
