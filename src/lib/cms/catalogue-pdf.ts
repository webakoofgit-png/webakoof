import { jsPDF } from "jspdf";
import type { loadCatalogue } from "./catalogue.server";

// Browser image decoding also supports uploaded WebP and SVG brand marks.
async function imageData(url: string) {
  return new Promise<{ data: string; width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    const timeout = window.setTimeout(
      () => reject(new Error("Image loading timed out. Please try again.")),
      15000,
    );
    image.onerror = () => {
      clearTimeout(timeout);
      reject(
        new Error("A catalogue image could not be loaded. Check the project image and logo URLs."),
      );
    };
    image.onload = () => {
      clearTimeout(timeout);
      try {
        const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({
          data: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        reject(
          new Error(
            "An image cannot be exported. Use an uploaded image or a URL that allows cross-origin access.",
          ),
        );
      }
    };
    image.src = url;
  });
}

export async function downloadCatalogue(
  content: Awaited<ReturnType<typeof loadCatalogue>>,
  slug?: string,
) {
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const yellow = "#FFD400";
  const logo = content.settings.logo ? await imageData(content.settings.logo) : null;
  const text = (value: string) =>
    value
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2013\u2014]/g, "-");
  function copy(value: string, x: number, y: number, size: number, width = 166, bold = false) {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(text(value), width);
    pdf.text(lines, x, y);
    return y + lines.length * size * 0.42;
  }
  function brand(y = 24) {
    if (logo) {
      const w = Math.min(48, (14 * logo.width) / logo.height);
      const h = (w * logo.height) / logo.width;
      pdf.setFillColor("#FFFFFF");
      pdf.rect(20, y - 12, w + 4, h + 4, "F");
      pdf.addImage(logo.data, "PNG", 22, y - 10, w, h);
    } else {
      const color = pdf.getTextColor();
      pdf.setFillColor(yellow);
      pdf.roundedRect(22, y - 12, 14, 14, 3, 3, "F");
      pdf.setTextColor("#111111");
      copy("w.", 24, y - 2, 20, 14, true);
      pdf.setTextColor(color);
      copy("WEBakoof", 41, y - 3, 18, 147, true);
      copy("by Praavi Consultants", 41, y + 2, 7, 147);
    }
  }
  function footer() {
    pdf.setDrawColor(yellow);
    pdf.line(22, 275, 188, 275);
    pdf.setTextColor("#666666");
    copy("WEBakoof by Praavi Consultants", 22, 282, 9);
    pdf.text(String(pdf.getNumberOfPages()).padStart(2, "0"), 188, 282, { align: "right" });
  }
  pdf.setProperties({
    title: `${content.sector} Portfolio`,
    author: "WEBakoof by Praavi Consultants",
  });
  pdf.setFillColor("#111111");
  pdf.rect(0, 0, 210, 297, "F");
  pdf.setTextColor("#FFFFFF");
  brand(32);
  pdf.setFillColor(yellow);
  pdf.rect(22, 88, 28, 3, "F");
  pdf.setTextColor(yellow);
  const titleY = copy(content.sector.toUpperCase(), 22, 117, 27, 166, true);
  pdf.setTextColor("#FFFFFF");
  const endY = copy("PORTFOLIO", 22, titleY + 9, 38, 166, true);
  copy("Selected Digital Projects", 22, endY + 15, 14);
  copy(`${content.projects.length} curated digital experiences`, 22, endY + 28, 10);
  copy("WEBakoof by Praavi Consultants", 22, 258, 11);
  pdf.textWithLink("webakoof.com", 22, 270, {
    url: content.settings.website || "https://webakoof.com",
  });

  for (const [index, project] of content.projects.entries()) {
    pdf.addPage();
    pdf.setTextColor("#111111");
    brand();
    pdf.setTextColor("#666666");
    copy(`SELECTED WORK / ${String(index + 1).padStart(2, "0")}`, 22, 43, 9);
    const image = await imageData(project.image);
    const scale = Math.min(166 / image.width, 107 / image.height);
    const w = image.width * scale,
      h = image.height * scale;
    pdf.setFillColor("#F3F3EE");
    pdf.rect(22, 52, 166, 107, "F");
    pdf.addImage(image.data, "PNG", 22 + (166 - w) / 2, 52 + (107 - h) / 2, w, h);
    pdf.setTextColor("#111111");
    let y = copy(project.name, 22, 173, 24, 166, true);
    pdf.setTextColor("#666666");
    y = copy(`${project.category || project.industry} / ${project.service}`, 22, y + 6, 10);
    // Continue lengthy descriptions instead of clipping content at the footer.
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const lines: string[] = pdf.splitTextToSize(text(project.description), 166);
    y += 7;
    for (const line of lines) {
      if (y > 247) {
        footer();
        pdf.addPage();
        pdf.setTextColor("#111111");
        brand();
        y = 49;
      }
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(line, 22, y);
      y += 5.2;
    }
    if (project.liveUrl && /^https?:\/\//i.test(project.liveUrl)) {
      if (y > 234) {
        footer();
        pdf.addPage();
        pdf.setTextColor("#111111");
        brand();
        y = 49;
      }
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      const urlLines: string[] = pdf.splitTextToSize(project.liveUrl, 166);
      for (const line of urlLines) {
        if (y > 247) {
          footer();
          pdf.addPage();
          pdf.setTextColor("#111111");
          brand();
          y = 49;
        }
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.textWithLink(line, 22, y + 7, { url: project.liveUrl });
        y += 5.2;
      }
      if (y > 240) {
        footer();
        pdf.addPage();
        pdf.setTextColor("#111111");
        brand();
        y = 49;
      }
      pdf.setFillColor(yellow);
      pdf.rect(22, y + 11, 46, 12, "F");
      pdf.setTextColor("#111111");
      pdf.setFont("helvetica", "bold");
      pdf.textWithLink("Visit Website", 27, y + 19, { url: project.liveUrl });
    }
    footer();
  }
  pdf.addPage();
  pdf.setFillColor("#111111");
  pdf.rect(0, 0, 210, 297, "F");
  pdf.setTextColor("#FFFFFF");
  brand(32);
  pdf.setTextColor(yellow);
  copy("Have a project in mind?", 22, 94, 27, 166, true);
  pdf.setTextColor("#FFFFFF");
  copy("Let's build something great together.", 22, 128, 22, 150, true);
  copy("WEBakoof by Praavi Consultants", 22, 172, 12);
  let y = 194;
  const contacts: [string, string, string][] = [
    ["Website", content.settings.website || "", content.settings.website || ""],
    ["Phone", content.settings.phone, `tel:${content.settings.phone.replace(/\s/g, "")}`],
    ["Email", content.settings.email, `mailto:${content.settings.email}`],
    [
      "WhatsApp",
      content.settings.whatsapp,
      `https://wa.me/${content.settings.whatsapp.replace(/\D/g, "")}`,
    ],
  ];
  for (const [label, value, url] of contacts) {
    if (!value) continue;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(label, 22, y);
    const lines: string[] = pdf.splitTextToSize(value, 136);
    for (const line of lines) {
      if (y > 255) {
        pdf.addPage();
        pdf.setFillColor("#111111");
        pdf.rect(0, 0, 210, 297, "F");
        pdf.setTextColor("#FFFFFF");
        brand(32);
        y = 76;
      }
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.textWithLink(line, 52, y, { url });
      y += 5;
    }
    y += 9;
  }
  await pdf.save(`WEBakoof-${slug || "complete"}-portfolio.pdf`, { returnPromise: true });
}
