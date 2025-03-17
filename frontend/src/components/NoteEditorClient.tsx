"use client";

import { me } from "@/api/auth";
import { getNote, updateNote } from "@/api/notes";
import { LexicalEditor } from "lexical";
import { ArrowLeft, Lock, Unlock, Users } from "lucide-react";
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
  const [authorUserId, setAuthorUserId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null); // For debounce auto-save

  useEffect(() => {
    (async () => {
      const user = await me();
      setUserId(user._id);
      setUserName(user.name);
    })();
  }, []);

  // ✅ Fetch note and user
  useEffect(() => {
    (async () => {
      try {
        const note = await getNote(noteId);
        setTitle(note.title);
        setContent(note.content);
        setIsPublic(note.public);
        setAuthorUserId(note.author);
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

      isRemoteUpdate.current = true; // ✅ Scoped to this update

      editorRef.current?.update(() => {
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
    <div className="max-w-4xl mx-auto mt-8 p-6">
      {/* ✅ Merged Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        {/* 🔙 Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* 🔥 Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note Title"
          className="w-2/3 border border-gray-300 rounded p-2 text-lg font-semibold text-center"
        />

        {/* 🔒 Public/Private Toggle */}
        {userId === authorUserId ? (
          <button
            onClick={togglePublic}
            className={`px-4 py-2 rounded-md flex items-center gap-2 text-white ${
              isPublic ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            {isPublic ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isPublic ? "Public" : "Private"}
          </button>
        ) : (
          <div>
            {isPublic ? (
              <span className="px-4 py-2 rounded-md bg-green-600 text-white">
                Public
              </span>
            ) : (
              <span
                className="px-4 py-2 rounded-md bg-gray-600 text-white
              "
              >
                Private
              </span>
            )}
          </div>
        )}
      </div>

      {/* 👥 Active Users */}
      <div className="flex items-center gap-3 mb-4">
        {activeUsers.slice(0, 5).map((name, idx) => (
          <div
            key={idx}
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm"
            title={name}
          >
            {name[0]?.toUpperCase()}
          </div>
        ))}
        {activeUsers.length > 5 && (
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="text-gray-600 text-sm flex items-center gap-1"
          >
            <Users className="w-5 h-5" /> +{activeUsers.length - 5} more
          </button>
        )}
      </div>

      {/* 📝 Rich Text Editor */}
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
