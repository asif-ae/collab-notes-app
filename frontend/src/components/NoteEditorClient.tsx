"use client";

import { me } from "@/api/auth";
import { getNote, updateNote } from "@/api/notes";
import {
  LexicalEditor
} from "lexical";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Dynamic import for rich text editor
const RichTextEditor = dynamic(() => import("./Editor"), { ssr: false });

export default function NoteEditorClient({ noteId }: { noteId: string }) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const isRemoteUpdate = useRef(false);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null); // For debounce auto-save

  // ✅ Fetch note and user
  useEffect(() => {
    (async () => {
      try {
        const note = await getNote(noteId);
        setTitle(note.title);
        setContent(note.content);
        setIsPublic(note.public);

        const user = await me();
        setUserName(user.name);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [noteId, router]);

  // ✅ Setup socket for real-time updates
  useEffect(() => {
    if (!userName) return;

    const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("🟢 Connected:", socketIo.id);
      socketIo.emit("join-note", { noteId, userName });
    });

    // ✅ Sync content in real-time
    socketIo.on("receive-changes", ({ content: newContent }) => {
      console.log("📥 Content update received");
      setContent(newContent);
      // handleContentChange(newContent);

      isRemoteUpdate.current = true; // ✅ Scoped to this update

      editorRef.current?.update(() => {
        // const root = $getRoot();
        // root.clear(); // Clear existing
        // root.updateFromJSON(newContent);
        const editorState = editorRef.current!.parseEditorState(newContent); // ✅ Parse JSON string to editor state
        editorRef.current!.setEditorState(editorState); // ✅ Set editor state
      });

      setTimeout(() => {
        isRemoteUpdate.current = false; // ✅ Reset after applying
      }, 0); // Optional, to avoid locking onChange
    });

    // ✅ Sync title in real-time
    socketIo.on("receive-title", ({ title: newTitle }) => {
      console.log("📥 Title update received");
      setTitle(newTitle);
    });

    // ✅ Sync public status in real-time
    socketIo.on("receive-public-status", ({ public: newStatus }) => {
      console.log("📥 Public status update received");
      setIsPublic(newStatus);
    });

    // ✅ Active users list
    socketIo.on("active-users", (users: string[]) => {
      console.log("👥 Active users:", users);
      setActiveUsers(users);
    });

    return () => {
      socketIo.disconnect();
      console.log("🔴 Disconnected");
    };
  }, [noteId, userName]);

  // ✅ Auto-save function
  const autoSave = async (newContent: string, newTitle: string) => {
    try {
      console.log("💾 Auto-saving...");
      await updateNote(noteId, { title: newTitle, content: newContent });
      console.log("✅ Auto-saved successfully");
    } catch (err) {
      console.error("❌ Auto-save failed", err);
    }
  };

  // ✅ Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    socket?.emit("edit-note", { noteId, content: newContent });

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => autoSave(newContent, title), 1000);
  };

  // ✅ Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    socket?.emit("edit-title", { noteId, title: newTitle });

    // Auto-save after 1 sec of inactivity
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => autoSave(content, newTitle), 1000);
  };

  // ✅ Toggle public/private and sync via socket
  const togglePublic = async () => {
    try {
      const newStatus = !isPublic;
      await updateNote(noteId, { public: newStatus });
      setIsPublic(newStatus);
      socket?.emit("edit-public-status", { noteId, public: newStatus });
      alert(`Note is now ${newStatus ? "Public" : "Private"}`);
    } catch (error) {
      console.error("Failed to update privacy:", error);
      alert("Failed to update privacy status.");
    }
  };

  if (loading) return <>Loading...</>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Note</h1>

      {/* 👥 Active Users */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {activeUsers.map((name, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"
              title={name}
            >
              {name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">
            {isPublic ? "🔓 Public" : "🔒 Private"}
          </span>
          <button
            onClick={togglePublic}
            className={`px-4 py-2 rounded ${
              isPublic ? "bg-green-600" : "bg-gray-600"
            } text-white`}
          >
            Make {isPublic ? "Private" : "Public"}
          </button>
        </div>
      </div>

      {/* 🔥 Real-time Note Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Note Title"
        className="w-full border border-gray-300 rounded p-2 mb-4 text-xl font-semibold"
      />

      {/* ✍️ Rich Text Editor */}
      <RichTextEditor
        content={content}
        onChange={handleContentChange}
        setContent={setContent}
        editorRef={editorRef}
        isRemoteUpdate={isRemoteUpdate}
      />
    </div>
  );
}
