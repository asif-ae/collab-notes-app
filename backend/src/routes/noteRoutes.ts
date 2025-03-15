import express from "express";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getNote,
  getPublicNotes,
  getPublicNoteById,
} from "../controllers/noteController";
import { protect } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();

// Public routes
router.get("/public", catchAsync(getPublicNotes));
router.get("/public/:id", catchAsync(getPublicNoteById));

// Protected routes
router.use(protect);

router.get("/", catchAsync(getNotes));
router.get("/:id", catchAsync(getNote));
router.post("/", catchAsync(createNote));
router.patch("/:id", catchAsync(updateNote));
router.delete("/:id", catchAsync(deleteNote));

export default router;
