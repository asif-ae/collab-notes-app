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

// Store active users in rooms
const noteRooms: Record<string, Record<string, string>> = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join note room with user name
  socket.on("join-note", ({ noteId, userName }) => {
    console.log(`User ${userName} (${socket.id}) joined note: ${noteId}`);

    if (!noteRooms[noteId]) noteRooms[noteId] = {};
    noteRooms[noteId][socket.id] = userName;

    socket.join(noteId);

    // Notify all users in room about current users
    io.to(noteId).emit("active-users", Object.values(noteRooms[noteId]));
  });

  // Handle note editing and broadcast
  socket.on("edit-note", ({ noteId, content }) => {
    socket.to(noteId).emit("receive-changes", { content });
  });

  // Handle title update and broadcast
  socket.on("edit-title", ({ noteId, title }) => {
    console.log(`Title updated in note ${noteId}`);
    socket.to(noteId).emit("receive-title", { title });
  });

  // Handle public status update and broadcast
  socket.on("edit-public-status", ({ noteId, public: isPublic }) => {
    console.log(`Public status updated in note ${noteId}`);
    socket.to(noteId).emit("receive-public-status", { public: isPublic });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    for (const noteId in noteRooms) {
      if (noteRooms[noteId][socket.id]) {
        delete noteRooms[noteId][socket.id];
        io.to(noteId).emit("active-users", Object.values(noteRooms[noteId]));
        if (Object.keys(noteRooms[noteId]).length === 0)
          delete noteRooms[noteId]; // clean empty rooms
      }
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5013;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
