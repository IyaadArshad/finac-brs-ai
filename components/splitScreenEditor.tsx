"use client";

import React, { useEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

interface SplitScreenEditorProps {
  markdown: string;
}

export function SplitScreenEditor({ markdown }: SplitScreenEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const crepeInstanceRef = useRef<Awaited<ReturnType<Crepe["create"]>> | null>(
    null
  );

  // Use key to force recreation of editor when markdown changes
  const markdownKey = useRef(markdown);

  useEffect(() => {
    // Cleanup previous instance when markdown changes
    if (crepeInstanceRef.current && markdownKey.current !== markdown) {
      crepeInstanceRef.current.destroy();
      crepeInstanceRef.current = null;
    }

    markdownKey.current = markdown;

    const initEditor = async () => {
      if (editorRef.current && !crepeInstanceRef.current) {
        try {
          // Ensure the element is empty before creating a new instance
          if (editorRef.current.firstChild) {
            editorRef.current.innerHTML = "";
          }

          crepeInstanceRef.current = await new Crepe({
            root: editorRef.current,
            defaultValue: markdown,
          }).create();
        } catch (err) {
          console.error("Error initializing editor:", err);
        }
      }
    };

    initEditor();

    return () => {
      if (crepeInstanceRef.current) {
        crepeInstanceRef.current.destroy();
        crepeInstanceRef.current = null;
      }
    };
  }, [markdown]);

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Source Code Pro';
          src: url('/SourceCodePro-VariableFont_wght.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }

        /* toolbar */
        milkdown-toolbar {
          background-color: #fff !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        milkdown-toolbar * {
          color: #374151 !important;
        }
        milkdown-toolbar [data-active="true"],
        milkdown-toolbar .active,
        milkdown-toolbar .toolbar-item.active,
        milkdown-toolbar button[aria-pressed="true"] {
          background-color: #1A479D !important;
          color: #fff !important;
        }

        /* editor text */
        .milkdown-editor, .milkdown-editor * {
          color: #111827 !important;
        }
        .milkdown-editor p {
          margin-bottom: 1.1em !important;
          font-size: 1.2rem !important;
          line-height: 1.4 !important;
        }
        .milkdown-editor code {
          color: #111827 !important;
          background-color: #f3f4f6 !important;
        }

        /* link editing */
        milkdown-link-edit .link-edit,
        milkdown-link-preview .link-preview {
          background-color: #1A479D !important;
          color: #fff !important;
        }

        /* tables */
        .milkdown-editor table,
        .milkdown-editor .milkdown-table {
          border: 1px solid #d1d5db !important;
        }
        .milkdown-editor table th,
        .milkdown-editor .milkdown-table th {
          background-color: #1A479D !important;
          color: #fff !important;
        }

        /* hr */
        hr {
          border-color: #d1d5db !important;
        }

        /* code block */
        .milkdown-editor milkdown-code-block,
        .milkdown-editor milkdown-code-block * {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }

        /* selection */
        .milkdown-editor ::selection {
          background: rgba(26,71,157,0.2) !important;
        }
      `}</style>

      {/* light background */}
      <div ref={editorRef} className="milkdown-editor bg-white h-full w-full" />
    </>
  );
}