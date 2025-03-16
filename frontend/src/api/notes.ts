import API from "./axiosInstance";

export interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

// Get Notes
export const getNotes = async (): Promise<Note[]> => {
  const res = await API.get("/notes");
  return res.data;
};

// Create Note
export const createNote = async (note: Omit<Note, "_id" | "updatedAt">): Promise<Note> => {
  const res = await API.post("/notes", note);
  return res.data;
};
