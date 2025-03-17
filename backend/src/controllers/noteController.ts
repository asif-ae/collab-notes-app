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

// Get all notes (own + public)
export const getNotes = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  const notes = await Note.find({
    $or: [
      { author: userId },      // Notes authored by user
      { public: true },        // Public notes from others
    ],
  });

  res.json(notes);
};

// Get note by ID (own + public)
export const getNote = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;

  const note = await Note.findOne({
    _id: id,
    $or: [
      { author: userId },   // If user is the author
      { public: true },     // OR note is public
    ],
  });

  if (!note) return res.status(404).json({ message: "Note not found" });

  res.json(note);
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
  const { title, content, public: isPublic } = req.body; // ✅ Include public field optionally

  const updateFields: any = { updatedAt: Date.now() };

  if (title !== undefined) updateFields.title = title;
  if (content !== undefined) updateFields.content = content;
  if (isPublic !== undefined) updateFields.public = isPublic;

  const note = await Note.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { author: userId },
        { public: true },
      ],
    },
    updateFields,
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
