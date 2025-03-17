"use client";

import { getNote, Note, updateNote } from "@/api/notes";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const RichTextEditor = dynamic(() => import("./Editor"), { ssr: false });

export default function NoteEditorPage({ params }: { params: { id: string } }) {
  const noteId = params.id;
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(1); // Minimum is 1 (you)

  useEffect(() => {
    // Fetch the note content
    getNote(noteId)
      .then((note: Note) => {
        setTitle(note.title);
        setContent(note.content);
      })
      .catch(console.error);

    // Setup socket connection
    const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
    });
    setSocket(socketIo);

    // Join note room
    socketIo.emit("join-note", noteId);

    // Listen for real-time updates
    socketIo.on("receive-changes", (newContent: string) =>
      setContent(newContent)
    );

    // Listen for active users updates
    socketIo.on("active-users", (users: string[]) => {
      setActiveUsers(users.length);
    });

    // Cleanup on unmount
    return () => {
      socketIo.disconnect();
    };
  }, [noteId]);

  // Handle content change and emit
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    socket?.emit("edit-note", { noteId, content: newContent });
  };

  // Save note
  const handleSave = async () => {
    try {
      await updateNote(noteId, { title, content });
      alert("Note saved successfully!");
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Note</h1>

      {/* Active users */}
      <div className="text-sm text-gray-500 mb-2">
        {activeUsers} {activeUsers === 1 ? "person" : "people"} editing this
        note
      </div>

      {/* Title field */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
        className="w-full border border-gray-300 rounded p-2 mb-4 text-xl font-semibold"
      />

      {/* Rich Text Editor */}
      <RichTextEditor content={content} onChange={handleContentChange} />

      {/* Save button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
