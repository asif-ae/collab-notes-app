"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface EditorUpdaterPluginProps {
  setContent: (content: string) => void;
  socketIoRef: Socket | null | undefined;
}

export default function EditorUpdaterPlugin({
  setContent,
  socketIoRef,
}: EditorUpdaterPluginProps) {
  const [editor] = useLexicalComposerContext();

  // ✅ Setup socket for real-time updates
  useEffect(() => {
    if (!socketIoRef) return;

    // ✅ Sync content in real-time
    socketIoRef.on("receive-changes", ({ content: newContent }) => {
      console.log("📥 Content update received");
      setContent(newContent);
      editor.update(() => {
        const root = $getRoot();
        root.clear(); // Clear existing content

        // Add new content
        root.append($createParagraphNode().append($createTextNode(newContent)));
      });
    });
  }, []);

  return null; // This is a logic-only plugin, no visual component
}
