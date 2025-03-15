import { Request, Response } from "express";
import { Note } from "../models/noteModel";

// Get all public notes
export const getPublicNotes = async (req: Request, res: Response) => {
  const notes = await Note.find({ public: true });
  res.json(notes);
};

// Get a public note by ID
export const getPublicNoteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const note = await Note.findOne({ _id: id, public: true });

  if (!note) return res.status(404).json({ message: "Note not found or private" });

  res.json(note);
};

// Get all notes (for logged-in user)
export const getNotes = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const notes = await Note.find({ author: userId });
  res.json(notes);
};

// Get note by ID (for logged-in user)
export const getNote = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  const notes = await Note.findOne({ _id: id, author: userId });
  res.json(notes);
};

// Create a note
export const createNote = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { title, content, public: isPublic = false } = req.body;

  const note = new Note({ title, content, public: isPublic, author: userId });
  await note.save();

  res.status(201).json(note);
};


// Update a note
export const updateNote = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  const { title, content } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: id, author: userId },
    { title, content, updatedAt: Date.now() },
    { new: true }
  );

  if (!note) return res.status(404).json({ message: "Note not found" });

  res.json(note);
};

// Delete a note
export const deleteNote = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;

  const note = await Note.findOneAndDelete({ _id: id, author: userId });

  if (!note) return res.status(404).json({ message: "Note not found" });

  res.json({ message: "Note deleted" });
};
