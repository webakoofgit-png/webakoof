// Explicit one-time import through the same authenticated API used by the admin panel.
import { readFile, writeFile, mkdir } from "node:fs/promises";
const origin =
  process.argv.find((arg) => arg.startsWith("--origin="))?.slice(9) || "http://127.0.0.1:8080";
if (!["http://127.0.0.1:8080", "https://webakoof.com"].includes(origin))
  throw new Error("Unsupported CMS origin");
const credentials = JSON.parse(await readFile(".local/admin-login.json", "utf8"));
const projects = JSON.parse(await readFile("content/portfolio/new-projects.json", "utf8"));
let cookie;
async function api(path, method = "GET", data) {
  const form = data instanceof FormData;
  const response = await fetch(`${origin}/api/cms/${path}`, {
    method,
    headers: {
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(form ? {} : { "Content-Type": "application/json" }),
    },
    ...(data === undefined ? {} : { body: form ? data : JSON.stringify(data) }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(`${path}: ${response.status} ${result.error || "Request failed"}`);
  if (path === "login") cookie = response.headers.get("set-cookie")?.split(";")[0];
  return result;
}
try {
  await api("login", "POST", { ...credentials, remember: false });
  const [before, categoriesBefore] = await Promise.all([
    api("portfolio"),
    api("portfolio-categories"),
  ]);
  await mkdir(".local/portfolio-rollout", { recursive: true });
  const prefix = `${new URL(origin).hostname}-${Date.now()}`;
  await writeFile(
    `.local/portfolio-rollout/${prefix}-backup.json`,
    JSON.stringify({ origin, projects: before, categories: categoriesBefore }, null, 2),
  );
  const categories = [...categoriesBefore];
  for (const name of new Set(projects.flatMap((project) => project.categories))) {
    if (categories.some((category) => category.name === name)) continue;
    const slug = name.toLowerCase().replaceAll(" ", "-");
    await api("portfolio-categories", "POST", { name, slug, description: "", status: "active" });
    categories.splice(0, categories.length, ...(await api("portfolio-categories")));
  }
  for (const project of projects) {
    if (before.some((record) => record.slug === project.slug)) {
      console.log("Preserved existing:", project.name);
      continue;
    }
    if (
      before.some(
        (record) =>
          record.name.toLowerCase() === project.name.toLowerCase() ||
          record.liveUrl?.replace(/\/$/, "") === project.liveUrl.replace(/\/$/, ""),
      )
    )
      throw new Error(`Possible duplicate: ${project.name}. Review the existing record.`);
    const categoryIds = project.categories.map((name) => {
      const category = categories.find(
        (category) => category.name === name && category.status === "active",
      );
      if (!category) throw new Error(`Active category required: ${name}`);
      return category.id;
    });
    const image = await readFile(`public/projects/${project.imageFile}`);
    const form = new FormData();
    form.set("folder", "portfolio");
    form.set("file", new Blob([image], { type: "image/webp" }), project.imageFile);
    const uploaded = await api("upload", "POST", form);
    await api("portfolio", "POST", {
      name: project.name,
      slug: project.slug,
      category_id: categoryIds[0],
      category_ids: categoryIds,
      status: "published",
      featured: false,
      clientName: project.name,
      description: project.description,
      fullDescription: project.description,
      overview: project.description,
      industry: project.categories.join(" / "),
      service: project.service,
      services: [project.service],
      tags: project.categories,
      liveUrl: project.liveUrl,
      image: uploaded.url,
      coverImage: uploaded.url,
      ogImage: uploaded.url,
      showcaseVideo: `/projects/${encodeURIComponent(project.videoFile)}`,
      isConcept: false,
    });
    console.log("Added:", project.name);
  }
  const after = await api("portfolio");
  for (const record of before) {
    if (JSON.stringify(after.find((item) => item.id === record.id)) !== JSON.stringify(record))
      throw new Error(`Existing project changed: ${record.name}`);
  }
  for (const project of projects) {
    const matches = after.filter((record) => record.slug === project.slug);
    if (matches.length !== 1 || matches[0].status !== "published")
      throw new Error(`Publication check failed: ${project.name}`);
    const expected = project.categories.map(
      (name) => categories.find((category) => category.name === name).id,
    );
    if (expected.some((id) => !matches[0].category_ids?.includes(id)))
      throw new Error(`Multi-category API not deployed: ${project.name}`);
  }
  await writeFile(
    `.local/portfolio-rollout/${prefix}-result.json`,
    JSON.stringify(
      after.filter((record) => projects.some((project) => project.slug === record.slug)),
      null,
      2,
    ),
  );
  console.log(
    "Verified four published records, no duplicates, and all existing projects unchanged.",
  );
} finally {
  if (cookie) await api("logout", "POST", {});
}
