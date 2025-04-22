// "use client";

// import React, { useState, useEffect } from "react";
// import MDEditor from "@uiw/react-md-editor";
// import "@uiw/react-md-editor/markdown-editor.css";
// import "@uiw/react-markdown-preview/markdown.css";

// interface SplitScreenEditorProps {
//   markdown: string;
//   onChange: (value: string) => void;
// }

// export function SplitScreenEditor({ markdown, onChange }: SplitScreenEditorProps) {
//   const [value, setValue] = useState(markdown);

//   // sync prop → state
//   useEffect(() => {
//     setValue(markdown);
//   }, [markdown]);

//   return (
//     <div data-color-mode="light" className="h-screen">
//       <MDEditor
//         value={value}
//         preview="preview"
//         hideToolbar
//         height="100%"
//       />
//     </div>
//   );
// }