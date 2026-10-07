import sanitize from "sanitize-html";
import type { ArticleSection } from "@/data/blog";
export function cleanArticle(input: string) {
  const sections: ArticleSection[] = [];
  let index = 0;
  const html = sanitize(input, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
      "br",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
      h2: ["id"],
      h3: ["id"],
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tag, attributes) => ({
        tagName: "a",
        attribs: { ...attributes, rel: "noopener noreferrer" },
      }),
    },
  }).replace(/<(h[23])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g, (_match, tag: string, content: string) => {
    const id = `section-${++index}`;
    const title = sanitize(content, { allowedTags: [], allowedAttributes: {} })
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    sections.push({ id, title, paragraphs: [] });
    return `<${tag} id="${id}">${content}</${tag}>`;
  });
  return { html, sections };
}
