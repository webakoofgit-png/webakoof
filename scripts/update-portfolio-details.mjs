import mysql from "mysql2/promise";
import { mkdir, writeFile } from "node:fs/promises";
const updates = [
  [
    "ambika-jewellers",
    "Ambika Jewellers",
    "https://abkambikajewellers.com/",
    "Jewellery",
    "A refined and responsive jewellery website designed to showcase elegant collections, brand craftsmanship, and products through a premium digital experience.",
    "Business Website",
  ],
  [
    "krayons-preschool",
    "Krayons Preschool",
    "https://krayonspreschool.com/",
    "Education",
    "A colourful and parent-friendly preschool website designed to present programs, learning activities, facilities, and essential information in an engaging format.",
    "Business Website",
  ],
  [
    "dadhichi-solar",
    "Dadhichi Solar Power",
    "https://dadhichisolarpower.com/",
    "Solar & Renewable Energy",
    "A professional solar energy website designed to showcase renewable energy solutions, services, and the company’s commitment to sustainable power.",
    "Business Website",
  ],
  [
    "paranjape-tours",
    "Paranjape Tours",
    "https://www.paranjapetours.com/",
    "Tours & Travel",
    "A modern travel website designed to showcase tour packages, destinations, and travel services while making trip information easy for customers to explore.",
    "Business Website",
  ],
  [
    "kaypahije",
    "Kaypahije",
    "https://kaypahije.com/",
    "E-Commerce",
    "A user-friendly e-commerce platform designed to present products through an organised shopping experience with easy product discovery and navigation.",
    "E-Commerce",
  ],
  [
    "morya-plus-hospital",
    "Morya Plus Hospital",
    "https://moryaplushospital.com/",
    "Healthcare",
    "A professional healthcare website designed to present hospital services, medical facilities, specialties, and patient-focused information in a clear and accessible way.",
    "Business Website",
  ],
  [
    "nivesah-weddings",
    "Nivesah Weddings",
    "https://nivesahweddings.in/",
    "Wedding & Events",
    "An elegant wedding-focused website designed to showcase services, experiences, and visual storytelling through a premium and sophisticated presentation.",
    "Business Website",
  ],
  [
    "vet-extrusion",
    "Vighnaharta Extrusion",
    "https://vighnahartaextrusion.com/",
    "Manufacturing",
    "A professional industrial website designed to showcase extrusion capabilities, products, manufacturing expertise, and business information through a clean corporate interface.",
    "Corporate Website",
  ],
  [
    "skill-spark-consulting",
    "Skill Spark Consulting",
    "https://skillsparkconsulting.in/",
    "Consulting",
    "A clean and professional consulting website designed to communicate services, expertise, and business solutions while building a credible digital presence.",
    "Business Website",
  ],
  [
    "rent-for-health",
    "Rent For Health",
    "https://rentforhealth.com/",
    "Healthcare",
    "A healthcare-focused digital platform designed to make medical and healthcare equipment rental information easy to discover and access for customers.",
    "Dynamic Website",
  ],
  [
    "gurukul-class",
    "Gurukul Classes",
    "https://gurukulclass.org/",
    "Education",
    "A modern educational website designed to showcase courses, faculty, academic programs, and class information through a student-friendly digital experience.",
    "Dynamic Website",
  ],
  [
    "ump-consultants",
    "UMP Consultants",
    "https://umpconsultants.com/",
    "Consulting",
    "A professional corporate website designed to showcase consulting services, expertise, and business solutions through a clean and trustworthy digital presence.",
    "Business Website",
  ],
  [
    "shivrudra-graphics",
    "Shivrudra Graphics",
    "https://shivrudragraphics.com/",
    "Printing & Graphics",
    "A visually focused business website designed to showcase printing, graphics, and creative services while highlighting the company’s capabilities and portfolio.",
    "Business Website",
  ],
  [
    "ekvira-export",
    "Ekvira Export House",
    "https://ekviraexporthouse.com/",
    "Export & Trading",
    "A professional export business website designed to showcase products, company capabilities, and international trade services through a clear corporate presentation.",
    "Corporate Website",
  ],
  [
    "suntech-solar",
    "Suntech Green Energy Solar",
    "https://suntechgreenenergysolar.com/",
    "Solar & Renewable Energy",
    "A modern solar energy website designed to showcase sustainable energy solutions, solar services, and the company’s expertise in renewable power systems.",
    "Business Website",
  ],
];
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
try {
  await db.beginTransaction();
  const placeholders = updates.map(() => "?").join(",");
  const [records] = await db.execute(
    `SELECT * FROM portfolio_projects WHERE slug IN (${placeholders}) FOR UPDATE`,
    updates.map((item) => item[0]),
  );
  if (records.length !== updates.length)
    throw new Error("One or more portfolio projects were not found; no changes saved.");
  await mkdir(".local", { recursive: true });
  await writeFile(
    `.local/portfolio-details-backup-${Date.now()}.json`,
    JSON.stringify(records, null, 2),
  );
  for (const [slug, name, liveUrl, category, description, service] of updates) {
    const categorySlug = category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await db.execute(
      "INSERT INTO portfolio_categories(name,slug,description,status) VALUES (?,?,'','active') ON DUPLICATE KEY UPDATE status='active'",
      [category, categorySlug],
    );
    const [categories] = await db.execute("SELECT id FROM portfolio_categories WHERE slug=?", [
      categorySlug,
    ]);
    const record = records.find((item) => item.slug === slug);
    const content =
      typeof record.content === "string" ? JSON.parse(record.content) : record.content;
    if (!content.image || !content.showcaseVideo)
      throw new Error(`Missing portfolio media: ${name}`);
    Object.assign(content, {
      name,
      liveUrl,
      category_id: categories[0].id,
      industry: category,
      description,
      service,
      status: "published",
      isConcept: false,
    });
    await db.execute(
      "UPDATE portfolio_projects SET name=?,category_id=?,status='published',content=? WHERE id=?",
      [name, content.category_id, JSON.stringify(content), record.id],
    );
  }
  await db.commit();
  const [result] = await db.execute(
    `SELECT name,status FROM portfolio_projects WHERE slug IN (${placeholders}) ORDER BY name`,
    updates.map((item) => item[0]),
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  await db.rollback();
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
