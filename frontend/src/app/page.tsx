"use client";

import {
  createNote,
  deleteNote,
  getNotes,
  Note,
  updateNote,
} from "@/api/notes";
import { default as MainHeader } from "@/components/MainHeader";
import { Lock, Pencil, Trash2, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
}

interface LexicalRoot {
  children?: LexicalNode[];
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch notes
  useEffect(() => {
    (async () => {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Create Note & Redirect to editor
  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: "Untitled Note",
        content: "",
      });
      router.push(`/note/${newNote._id}`); // Redirect to Note Editor
    } catch (err) {
      console.error("Failed to create note:", err);
      alert("Failed to create note. Try again.");
    }
  };

  // ✅ Delete Note
  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note._id !== id)); // Remove from UI
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note.");
    }
  };

  // ✅ Toggle Privacy (Dummy function for now — you can implement the backend logic later)
  const handleTogglePrivacy = async (id: string, isPublic: boolean) => {
    try {
      const newStatus = !isPublic;
      await updateNote(id, { public: newStatus });
      setNotes((prev) => {
        const noteIndex = prev.findIndex((note) => note._id === id);
        if (noteIndex === -1) return prev;
        const updatedNote = { ...prev[noteIndex], public: newStatus };
        return [
          ...prev.slice(0, noteIndex),
          updatedNote,
          ...prev.slice(noteIndex + 1),
        ];
      });
      alert(`Note is now ${newStatus ? "Public" : "Private"}`);
    } catch (error) {
      console.error("Failed to update privacy:", error);
      alert("Failed to update privacy status.");
    }
  };

  // ✅ Helper to parse lexical content (simple plain-text approach for now)
  const getPlainTextFromLexicalJSON = (jsonString: string) => {
    try {
      const json = JSON.parse(jsonString);
      const rootChildren = json.root?.children || [];
      const plainText = rootChildren
        .map((node: LexicalRoot) =>
          node.children?.map((c: LexicalNode) => c.text).join(" ")
        )
        .join(" ");
      return plainText || "No content yet...";
    } catch (err) {
      console.error("Failed to parse content", err);
      return "Invalid content";
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading your notes...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <MainHeader onCreateNote={handleCreateNote} />

      {/* Notes Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {notes.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            You have no notes yet. Click &quot;New Note&quot; to get started!
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note._id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-lg transition bg-white flex flex-col justify-between h-[200px]"
          >
            <div>
              <h3 className="text-xl font-semibold truncate">
                {note.title || "Untitled Note"}
              </h3>
              <p className="text-gray-600 mt-2 text-sm line-clamp-4">
                {note.content
                  ? getPlainTextFromLexicalJSON(note.content).slice(0, 500) +
                    "..."
                  : "No content yet..."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => router.push(`/note/${note._id}`)}
                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => handleTogglePrivacy(note._id, note.public)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Toggle Privacy"
                >
                  {note.public ? (
                    <Unlock className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
