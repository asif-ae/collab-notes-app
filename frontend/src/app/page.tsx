"use client";

import { createNote, deleteNote, getNotes, Note } from "@/api/notes";
import Logout from "@/components/Logout";
import User from "@/components/User";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const handleTogglePrivacy = (id: string) => {
    alert(`Toggle privacy for note: ${id}`);
    // TODO: Call backend to update privacy and update state
  };

  if (loading) return <div className="text-center mt-10">Loading your notes...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Notes</h1>
        <button
          onClick={handleCreateNote}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Note
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 && <p>No notes found. Create a new one!</p>}
        {notes.map((note) => (
          <div
            key={note._id}
            className="border rounded p-4 shadow-sm hover:shadow transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{note.title}</h3>
                <p className="text-gray-600">{note.content.slice(0, 100)}...</p>
              </div>
              <div className="flex gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => router.push(`/note/${note._id}`)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
                {/* Privacy Toggle Button */}
                <button
                  onClick={() => handleTogglePrivacy(note._id)}
                  className="text-gray-500 hover:underline"
                >
                  Toggle Privacy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Info & Logout */}
      <div className="mt-10">
        <User />
        <Logout />
      </div>
    </div>
  );
}
