import { createServerFn } from "@tanstack/react-start";
export const getBlogRedirect = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (!/^[a-z0-9-]{1,220}$/.test(slug)) throw new Error("Invalid slug");
    return slug;
  })
  .handler(async ({ data }) => {
    const { cmsEnabled, rows } = await import("./db.server");
    if (!cmsEnabled()) return null;
    const records = await rows<{ new_slug: string }>(
      'SELECT r.new_slug FROM blog_redirects r JOIN blog_posts p ON p.slug=r.new_slug WHERE r.old_slug=? AND p.status="published" AND p.publish_date<=UTC_DATE()',
      [data],
    );
    return records[0]?.new_slug || null;
  });
