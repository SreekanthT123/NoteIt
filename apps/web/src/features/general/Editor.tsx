import "./editorStyle.css";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { useEffect } from "react";

export const Editor = ({ value, onChange, onFocus, onBlur, autofocus }: any) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    autofocus: autofocus ? 'end' : false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none focus:bg-white text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
  });

  // Sync external value (important when React Query refetches)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="relative h-full">
      {editor && (
        <BubbleMenu
          editor={editor}
          className="
          flex items-center gap-1
          bg-white shadow-lg border border-slate-200
          rounded-lg px-2 py-1
        "
        >
          {/* Bold */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            className={`
            px-2 py-1 rounded text-xs
            ${editor.isActive("bold") ? "bg-slate-200 font-bold" : ""}
          `}
          >
             <Bold size={16}/>
          </button>

          {/* Italic */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            className={`
            px-2 py-1 rounded text-xs 
            ${editor.isActive("italic") ? "bg-slate-200" : ""}
          `}
          >
            <Italic size={16}/>
          </button>

          {/* Bullet List */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={`
            px-2 py-1 rounded text-xs
            ${editor.isActive("bulletList") ? "bg-slate-200" : ""}
          `}
          >
            <List size={16}/>
          </button>

          {/* Ordered List */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={`
            px-2 py-1 rounded text-xs
            ${editor.isActive("orderedList") ? "bg-slate-200" : ""}
          `}
          >
            <ListOrdered size={16}/>
          </button>
          {/* h1 header */}
          <button 
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={`
            px-2 py-1 rounded text-sm font-bold
            ${editor.isActive("heading", { level: 1 }) ? "bg-slate-200" : ""}
          `}
          >
            H1
          </button>
          <button 
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={`
            px-2 py-1 rounded text-sm font-bold
            ${editor.isActive("heading", { level: 2 }) ? "bg-slate-200" : ""}
          `}
          >
            H2
          </button>
        </BubbleMenu>
      )}

      <div className="rounded-md p-2 transition bg-white h-full max-h-[500px] overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
