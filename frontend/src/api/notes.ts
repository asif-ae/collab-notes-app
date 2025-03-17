import API from "./axiosInstance";

export interface Note {
  _id: string;
  title: string;
  content: string;
  author: string;
  public: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface NoteInput {
  title: string;
  content: string;
}

// // Get Notes
// export const getNotes = async (): Promise<Note[]> => {
//   const res = await API.get("/notes");
//   return res.data;
// };

// // Create Note
// export const createNote = async (note: Omit<Note, "_id" | "updatedAt">): Promise<Note> => {
//   const res = await API.post("/notes", note);
//   return res.data;
// };

// ✅ Get all notes
export const getNotes = async (): Promise<Note[]> => {
  const res = await API.get<Note[]>("/notes");
  return res.data;
};

// ✅ Get a single note
export const getNote = async (id: string): Promise<Note> => {
  const res = await API.get<Note>(`/notes/${id}`);
  return res.data;
};

// ✅ Create a new note
export const createNote = async (data: NoteInput): Promise<Note> => {
  const res = await API.post<Note>("/notes", data);
  return res.data;
};

// ✅ Update a note
export const updateNote = async (
  id: string,
  data: Partial<{ title: string; content: string; public: boolean }>
): Promise<Note> => {
  const res = await API.patch<Note>(`/notes/${id}`, data);
  return res.data;
};

// ✅ Delete a note (response contains a message)
export const deleteNote = async (id: string): Promise<{ message: string }> => {
  const res = await API.delete<{ message: string }>(`/notes/${id}`);
  return res.data;
};
