"use client";

import { useEffect, useState, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { io, Socket } from "socket.io-client";
import { EditorState } from "lexical";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

// Define types
interface Props {
  noteId: string;
}

let socket: Socket | null = null;

export default function CollaborativeNoteEditor({ noteId }: Props) {
  const [socketConnected, setSocketConnected] = useState(false);

  // Connect to Socket.io
  useEffect(() => {
    socket = io("http://localhost:5000", { withCredentials: true });

    socket.on("connect", () => {
      console.log("✅ Connected to socket.io");
      setSocketConnected(true);
      socket?.emit("join-note", noteId);
    });

    return () => {
      socket?.disconnect();
    };
  }, [noteId]);

  // Handle editor changes
  const handleEditorChange = useCallback((editorState: EditorState) => {
    if (socketConnected) {
      editorState.read(() => {
        const json = editorState.toJSON();
        socket?.emit("edit-note", { noteId, content: JSON.stringify(json) });
      });
    }
  }, [noteId, socketConnected]);

  // Handle receiving updates from others
  const [initialContent, setInitialContent] = useState<string | null>(null);
  useEffect(() => {
    if (socket) {
      socket.on("receive-changes", (content: string) => {
        console.log("✉️ Received changes:", content);
        setInitialContent(content);
      });
    }
  }, []);

  // Lexical editor config
  const initialConfig = {
    namespace: "CollabNoteEditor",
    onError(error: Error) {
      console.error("Lexical error:", error);
    },
    editorState: initialContent ? JSON.parse(initialContent) : undefined, // Set initial state if available
    theme: {
      paragraph: "editor-paragraph",
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-4 border border-gray-300 rounded-md bg-white shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-2">Collaborative Note</h2>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input min-h-[200px] p-2 rounded-md border" />}
          placeholder={<div className="text-gray-400">Start writing here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={handleEditorChange} />
        <HistoryPlugin />
      </LexicalComposer>
    </div>
  );
}
