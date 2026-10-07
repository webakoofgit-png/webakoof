import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { ImageField } from "./shared";
import { useEffect } from "react";
export function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      Image,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { "aria-label": "Blog content", class: "adm-rich-content" } },
  });
  useEffect(() => {
    if (editor && editor.getHTML() !== value)
      editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);
  if (!editor) return <p>Loading editor…</p>;
  return (
    <div className="adm-rich-editor">
      <div className="adm-editor-toolbar">
        {[
          ["Paragraph", () => editor.chain().focus().setParagraph().run(), "paragraph"],
          ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "heading"],
          ["H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "heading"],
          ["Bold", () => editor.chain().focus().toggleBold().run(), "bold"],
          ["Italic", () => editor.chain().focus().toggleItalic().run(), "italic"],
          ["Bullets", () => editor.chain().focus().toggleBulletList().run(), "bulletList"],
          ["Numbered", () => editor.chain().focus().toggleOrderedList().run(), "orderedList"],
          ["Quote", () => editor.chain().focus().toggleBlockquote().run(), "blockquote"],
        ].map(([label, action, mark]) => (
          <button
            type="button"
            key={String(label)}
            aria-pressed={editor.isActive(String(mark))}
            onClick={action as () => void}
          >
            {String(label)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const href = window.prompt("Link URL (https://…)");
            if (href && /^https?:\/\//i.test(href)) editor.chain().focus().setLink({ href }).run();
          }}
        >
          Link
        </button>
        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}>
          Unlink
        </button>
      </div>
      <EditorContent editor={editor} />
      <details>
        <summary>Add an image to the article</summary>
        <ImageField
          label="Article image"
          folder="blog"
          value=""
          onChange={(src) => {
            if (src) editor.chain().focus().setImage({ src, alt: "Article illustration" }).run();
          }}
        />
      </details>
    </div>
  );
}
