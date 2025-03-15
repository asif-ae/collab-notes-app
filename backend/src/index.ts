import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import noteRoutes from "./routes/noteRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5012",
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5012",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

// After all routes
app.use(errorHandler);

// Base Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Socket.io Real-time Collaboration
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join a note room
  socket.on("join-note", (noteId: string) => {
    console.log(`User ${socket.id} joined note: ${noteId}`);
    socket.join(noteId);
  });

  // Edit note and broadcast to others
  socket.on("edit-note", ({ noteId, content }: { noteId: string; content: string }) => {
    console.log(`User ${socket.id} edited note: ${noteId}`);
    // Broadcast changes to all other users in the same room
    socket.to(noteId).emit("receive-changes", content);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5013;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
